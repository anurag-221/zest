import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { phone, otp, mockExpectedOtp } = await req.json();

  if (!phone || !otp) {
    return NextResponse.json({ error: 'Missing phone or otp' }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  // ── MOCK MODE ────────────────────────────────────────────────────────────────
  if (!accountSid || accountSid.startsWith('AC') && accountSid.length < 20 || !authToken || !serviceSid) {
    const valid = mockExpectedOtp && otp === mockExpectedOtp;
    return NextResponse.json({ valid });
  }

  // ── REAL TWILIO MODE ─────────────────────────────────────────────────────────
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);

    const check = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    });

    return NextResponse.json({ valid: check.status === 'approved' });
  } catch (err: unknown) {
    console.error('[Auth] Twilio verify-otp error:', err);
    return NextResponse.json({ valid: false });
  }
}
