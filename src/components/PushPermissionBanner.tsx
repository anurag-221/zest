'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushPermissionBanner() {
  const { isAuthenticated } = useAuthStore();
  const { isSupported, permission, subscribeToPush } = usePushNotifications();
  const [dismissed, setDismissed] = useState(true);

  // Prevent hydration mismatch
  useEffect(() => {
     // Only show if user is logged in, push is supported, permission is 'default' (not asked yet), and not dismissed in this session
     if (isAuthenticated && isSupported && permission === 'default') {
        const hasDismissed = sessionStorage.getItem('pushBannerDismissed');
        if (!hasDismissed) {
             setDismissed(false);
        }
     }
  }, [isAuthenticated, isSupported, permission]);

  if (dismissed || permission !== 'default') return null;

  const handleEnable = async () => {
      await subscribeToPush();
      setDismissed(true);
  };

  const handleDismiss = () => {
      setDismissed(true);
      sessionStorage.setItem('pushBannerDismissed', 'true');
  };

  return (
    <div className="fixed bottom-[80px] left-4 right-4 z-[50] animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-indigo-600 text-white rounded-xl shadow-xl p-4 flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-full hidden sm:block">
                <Bell size={20} className="text-white animate-pulse" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm">Stay Updated</p>
                <p className="text-xs text-indigo-100">Get instant alerts for your order status and exclusive flash sales.</p>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleEnable}
                    className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
                >
                    Enable
                </button>
                <button 
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-indigo-500 rounded-lg transition-colors text-indigo-200 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    </div>
  );
}
