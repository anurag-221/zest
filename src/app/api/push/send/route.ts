import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@zest.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, body: msgBody, url, icon, type, target_type, target_ids } = body;

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title,
      body: msgBody,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/',
      tag: type || 'announcement',
      data: { url: url || '/', type },
    });

    // Build subscriber query based on targeting
    let query = supabaseAdmin.from('push_subscriptions').select('endpoint, keys, user_id');

    if (target_type === 'users' && Array.isArray(target_ids) && target_ids.length > 0) {
      query = query.in('user_id', target_ids);
    }

    const { data: subs, error: subError } = await query;
    if (subError) throw new Error(subError.message);

    const subscriptions = subs || [];
    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscribers found.' });
    }

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys } as webpush.PushSubscription,
          payload
        );
        sent++;
      } catch (err: any) {
        failed++;
        // Clean up expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }

    // Remove expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
    }

    // Update campaign record if sending from a saved campaign
    if (id) {
      await supabaseAdmin.from('push_campaigns').upsert({
        id,
        title,
        body: msgBody,
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

    return NextResponse.json({ success: true, sent, failed });
  } catch (error: any) {
    console.error('[Push Send Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
