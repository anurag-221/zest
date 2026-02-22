'use client';

import { useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPushTrigger() {
  const [loading, setLoading] = useState(false);

  const triggerFlashSale = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '⚡ Flash Sale is LIVE!',
          body: 'Get up to 50% off on your favorite products for the next 10 minutes. Hurry up!',
          url: '/category/all', // or redirect to a specific flash sale page
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Push sent to ${data.sentCount} subscribers!`);
      } else {
        toast.error(data.error || 'Failed to send push');
      }
    } catch (error) {
      toast.error('Something went wrong while sending push notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={triggerFlashSale}
      disabled={loading}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
      Trigger Flash Sale Push
    </button>
  );
}
