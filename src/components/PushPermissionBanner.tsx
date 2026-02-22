'use client';

import { useState, useEffect } from 'react';
import { Bell, Package, Tag, Zap, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushPermissionBanner() {
  const { isAuthenticated } = useAuthStore();
  const { isSupported, permission, subscribeToPush } = usePushNotifications();
  const [dismissed, setDismissed] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isSupported && permission === 'default') {
      const hasDismissed = sessionStorage.getItem('pushBannerDismissed');
      if (!hasDismissed) {
        // Small delay so it doesn't flash immediately on page load
        const t = setTimeout(() => setDismissed(false), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [isAuthenticated, isSupported, permission]);

  if (dismissed || permission !== 'default') return null;

  const handleEnable = async () => {
    setLoading(true);
    await subscribeToPush();
    setDismissed(true);
    setLoading(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pushBannerDismissed', 'true');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] animate-in fade-in duration-300"
        onClick={handleDismiss}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] animate-in slide-in-from-bottom duration-500">
        <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl overflow-hidden">
          
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 mx-4 mt-2 rounded-2xl p-5 overflow-hidden">
            {/* decorative blobs */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

            <div className="relative flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/30">
                <Bell size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-black">Enable Notifications</h2>
                <p className="text-indigo-100 text-sm mt-0.5">Stay ahead with real-time updates</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="px-6 pt-5 pb-2 space-y-3">
            {[
              { icon: Package, color: 'bg-green-100 text-green-600', label: 'Order Updates', desc: 'Track every step from packed to delivered' },
              { icon: Tag,     color: 'bg-orange-100 text-orange-600', label: 'Flash Sales',   desc: 'Be first to grab limited-time deals' },
              { icon: Zap,     color: 'bg-violet-100 text-violet-600', label: 'Instant Alerts', desc: 'Never miss restocks & price drops' },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl ${color} flex-shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-4 pt-4 pb-8 space-y-3">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900 active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Enabling...
                </span>
              ) : (
                <>
                  <Bell size={18} />
                  Enable Notifications
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3.5 text-gray-500 dark:text-gray-400 rounded-2xl font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
