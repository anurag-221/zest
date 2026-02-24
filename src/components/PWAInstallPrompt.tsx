'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowRight } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Delay showing the prompt to avoid immediate popup
      const timer = setTimeout(() => {
        // Only show if not already installed (best effort check)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Optional: save to localStorage to not show again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if dismissed recently
  useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
        const now = Date.now();
        const diff = now - parseInt(dismissedAt);
        const oneDay = 24 * 60 * 60 * 1000;
        if (diff < oneDay) {
            setShowPrompt(false);
        }
    }
  }, [showPrompt]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[50] animate-in slide-in-from-bottom-full duration-500">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-gray-800 p-5 overflow-hidden relative group">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
        
        <div className="relative flex items-center gap-4">
          {/* App Icon Mockup */}
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0">
            <span className="text-2xl font-black">Z</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Install Zest App</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-1">Fastest access to 10-min delivery</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={handleInstallClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none whitespace-nowrap"
            >
                <Download size={14} />
                Install
            </button>
            <button 
                onClick={dismissPrompt}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Hint for iOS */}
        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
             <Smartphone size={12} />
             <span>Works on iPhone & Android</span>
             <ArrowRight size={10} />
        </div>
      </div>
    </div>
  );
}
