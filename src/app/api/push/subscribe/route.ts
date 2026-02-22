import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription object' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('push_subscriptions')
        .upsert({
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            user_id: userId || null,
        }, { onConflict: 'endpoint' });

    if (error) {
        console.error('[Push DB Error]', error);
        throw new Error('Database save failed');
    }

    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (error: any) {
    console.error('[Push Subscribe Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Push Unsubscribe Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
