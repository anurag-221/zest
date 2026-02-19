'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { trigger } = useHaptic();

  const THRESHOLD = 80;
  const MAX_DISTANCE = 120;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
        setPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0) {
        // Prevent default only if we are pulling down at the top
        if (e.cancelable) e.preventDefault();
        setDistance(Math.min(diff * 0.5, MAX_DISTANCE)); // Resistance
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling) return;
      
      setPulling(false);
      
      if (distance > THRESHOLD) {
        setRefreshing(true);
        setDistance(THRESHOLD); // Snap to threshold
        trigger.medium();
        await onRefresh();
        trigger.success();
        setRefreshing(false);
      }
      
      setDistance(0);
    };

    const element = contentRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, startY, distance, onRefresh, trigger]);

  return (
    <div ref={contentRef} className="min-h-screen relative">
      {/* Loading Indicator */}
      <div 
        className="fixed left-0 right-0 flex justify-center pointer-events-none z-50 transition-all duration-300"
        style={{ 
            top: refreshing ? '100px' : `${Math.max(0, distance - 40)}px`,
            opacity: distance > 0 || refreshing ? 1 : 0 
        }}
      >
        <div className="bg-white rounded-full p-2 shadow-xl border border-gray-100 ring-4 ring-indigo-50">
            <Loader2 
                className={`text-indigo-600 ${refreshing ? 'animate-spin' : ''}`} 
                size={24} 
                style={{ transform: `rotate(${distance * 2}deg)` }}
            />
        </div>
      </div>

      <div 
        style={{ 
            transform: `translateY(${distance}px)`,
            transition: pulling ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
        }}
      >
        {children}
      </div>
    </div>
  );
}
