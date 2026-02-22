import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:anuragsrivastava695@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
} else {
  console.warn('[Push] VAPID keys are missing. Push notifications will not be fully initialized.');
}

export async function POST(req: NextRequest) {
  try {
    const { title, body, url, icon } = await req.json();

    if (!title) {
        return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const payload = JSON.stringify({
        title: title,
        body: body,
        url: url || '/',
        options: {
            icon: icon || '/icons/icon-192.png',
        }
    });

    // Fetch active subscriptions from Database
    const { data: dbSubscriptions, error } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*');

    if (error) {
        console.error('[Push DB Error]', error);
        throw new Error('Failed to fetch subscriptions');
    }

    const subscriptions = dbSubscriptions || [];
    
    if (subscriptions.length === 0) {
        return NextResponse.json({ message: 'No subscriptions found in DB. Push not sent but API works.'});
    }

    console.log(`[Push] Sending "${title}" to ${subscriptions.length} subscribers`);
    
    const sendPromises = subscriptions.map((sub: webpush.PushSubscription, index: number) => {
        return webpush.sendNotification(sub, payload).catch((err) => {
            console.error(`[Push] Error sending to subscriber ${index}:`, err);
            // In a real app, we would remove the subscription if it returns 410 Gone
        });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, sentCount: subscriptions.length });
  } catch (error: any) {
    console.error('[Push Send Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
