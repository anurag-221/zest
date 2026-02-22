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
  if (!accountSid || accountSid.includes('xxx') || !authToken || authToken.includes('xxx') || !serviceSid || serviceSid.includes('xxx')) {
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
    
    const errMessage = err instanceof Error ? err.message : String(err);
    
    // Twilio trial account limitations: unverified number, geo-permission, or invalid region
    const isTwilioTrialError = 
        errMessage.includes('unverified') || 
        errMessage.includes('Trial account') ||
        errMessage.includes('60605') ||
        errMessage.includes('60200') ||
        errMessage.includes('21608');
        
    if (isTwilioTrialError) {
        // Auto-fallback to dev mock mode
        const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
        console.warn(`[Auth] Twilio trial limitation hit — falling back to DEV mock OTP: ${mockOtp}`);
        return NextResponse.json({ 
            success: true, 
            mock: true, 
            devOtp: mockOtp,
            warning: 'Twilio trial mode: phone number not verified. Using dev OTP instead.'
        });
    }
    
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
