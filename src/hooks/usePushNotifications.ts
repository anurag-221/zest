'use client';

import { useState, useEffect } from 'react';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    } catch (err) {
        console.error('SW Registration Failed', err);
    }
  };

  const subscribeToPush = async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      
      if (Notification.permission === 'denied') {
        alert('Notifications are blocked in your browser settings.');
        return;
      }

      // Request permission
      let perm: NotificationPermission = Notification.permission;
      if (perm !== 'granted') {
          perm = await Notification.requestPermission() as NotificationPermission;
          setPermission(perm);
      }

      if (perm === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicVapidKey) {
            console.error('VAPID public key missing from env');
            return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // Send subscription to our server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          body: JSON.stringify({ subscription }),
          headers: {
            'content-type': 'application/json',
          },
        });

        setIsSubscribed(true);
        console.log('[Push] User subscribed successfully!');
      }
    } catch (err) {
      console.error('[Push] Failed to subscribe', err);
    }
  };

  return { isSupported, isSubscribed, permission, subscribeToPush };
}
