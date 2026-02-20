import { NextRequest, NextResponse } from 'next/server';

// In a real app, this would be a database table mapped to user IDs
const subscriptions: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription object' }, { status: 400 });
    }

    // Save the subscription
    const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
        subscriptions.push(subscription);
        console.log('[Push] Saved subscription:', subscription.endpoint.substring(0, 50) + '...');
    }

    return NextResponse.json({ success: true, message: 'Subscribed' });
  } catch (error: any) {
    console.error('[Push Subscribe Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Helper function to get all subscriptions (internal use)
export function getSubscriptions() {
    return subscriptions;
}
