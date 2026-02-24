import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-service';

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.headers.get('x-admin-secret');
    if (adminSecret !== (process.env.ADMIN_SECRET || 'zest-admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = await sendPushNotification(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Push Send API Error]', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
