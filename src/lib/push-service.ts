import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase';

// Initialize VAPID
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@zest.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
}

export interface PushNotificationPayload {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  type?: string;
  target_type?: string;
  target_ids?: string[];
}

export async function sendPushNotification(payload: PushNotificationPayload) {
  const { id, title, body, url, icon, type, target_type, target_ids } = payload;

  const pushPayload = JSON.stringify({
    title,
    body,
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    url: url || '/',
    tag: type || 'announcement',
    data: { url: url || '/', type },
  });

  // 1. Build subscriber query based on targeting
  let query = supabaseAdmin.from('push_subscriptions').select('endpoint, keys, user_id');

  if (target_type === 'users' && Array.isArray(target_ids) && target_ids.length > 0) {
    query = query.in('user_id', target_ids);
  }

  const { data: subs, error: subError } = await query;
  if (subError) throw new Error(subError.message);

  const subscriptions = subs || [];
  if (subscriptions.length === 0) {
    return { success: true, sent: 0, message: 'No subscribers found.' };
  }

  let sent = 0;
  let failed = 0;
  const expiredEndpoints: string[] = [];

  // 2. Send notifications in parallel (with error catching)
  const sendPromises = subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys } as webpush.PushSubscription,
        pushPayload
      );
      sent++;
    } catch (err: any) {
      failed++;
      // Clean up expired/invalid subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) {
        expiredEndpoints.push(sub.endpoint);
      }
    }
  });

  await Promise.all(sendPromises);

  // 3. Remove expired subscriptions
  if (expiredEndpoints.length > 0) {
    await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
  }

  // 4. Update campaign record if sending from a saved campaign
  if (id) {
    await supabaseAdmin.from('push_campaigns').upsert({
      id,
      title,
      body,
      icon: icon || '/icon-192.png',
      url: url || '/',
      type: type || 'announcement',
      target_type: target_type || 'all',
      target_ids: target_ids || [],
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: sent,
    });
  }

  return { success: true, sent, failed };
}
