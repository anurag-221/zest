import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription object' }, { status: 400 });
    }

    // Save the subscription to the database
    const { error } = await supabaseAdmin
        .from('push_subscriptions')
        .upsert({
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            // user_id: '...' would go here once we pass user ID from the client
        }, { onConflict: 'endpoint' });

    if (error) {
        console.error('[Push DB Error]', error);
        throw new Error('Database save failed');
    }

    console.log('[Push] Saved subscription to DB:', subscription.endpoint.substring(0, 50) + '...');
    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (error: any) {
    console.error('[Push Subscribe Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}


