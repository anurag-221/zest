import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/push-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Secure the endpoint
    if (secret !== process.env.ADMIN_SECRET && secret !== 'zest-admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date().toISOString();

        // 1. Fetch campaigns that are scheduled and the time has passed
        const { data: campaigns, error } = await supabaseAdmin
            .from('push_campaigns')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_at', now);

        if (error) {
            console.error('Cron: Failed to fetch scheduled campaigns:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: 'No campaigns to process' });
        }

        console.log(`Cron: Processing ${campaigns.length} campaigns...`);

        const results = [];

        // 2. Process each campaign
        for (const camp of campaigns) {
            try {
                // sendPushNotification handles:
                // - Loading subscribers
                // - Sending via web-push
                // - Updating DB status to 'sent'
                // - Updating sent_at and recipient_count
                const res = await sendPushNotification({
                    id: camp.id,
                    title: camp.title,
                    body: camp.body,
                    icon: camp.icon,
                    url: camp.url,
                    type: camp.type,
                    target_type: camp.target_type,
                    target_ids: camp.target_ids,
                });
                
                results.push({ id: camp.id, success: true, sent: res.sent });
            } catch (err: any) {
                console.error(`Cron: Failed to process campaign ${camp.id}:`, err);
                results.push({ id: camp.id, success: false, error: err.message });
            }
        }

        return NextResponse.json({ 
            message: `Processed ${campaigns.length} campaigns`,
            results 
        });

    } catch (error: any) {
        console.error('Cron: Unexpected error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
