import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { phone, channel = 'sms' } = await req.json();

  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // ── MOCK MODE (no Twilio creds configured) ──────────────────────────────────
  if (!accountSid || accountSid.startsWith('AC') && accountSid.length < 20 || !authToken || !serviceSid) {
    // Generate a mock OTP and return it in the response for dev/demo
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[Auth Mock] OTP for +91${phone} via ${channel}: ${mockOtp}`);
    return NextResponse.json({ success: true, mock: true, devOtp: mockOtp });
  }

  // ── REAL TWILIO MODE ─────────────────────────────────────────────────────────
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);

    const to = `+91${phone}`;
    const twilioChannel = channel === 'whatsapp' ? 'whatsapp' : 'sms';

    await client.verify.v2.services(serviceSid).verifications.create({
      to,
      channel: twilioChannel,
    });

    return NextResponse.json({ success: true, mock: false });
  } catch (err: unknown) {
    console.error('[Auth] Twilio send-otp error:', err);
    const message = err instanceof Error ? err.message : 'Failed to send OTP';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
