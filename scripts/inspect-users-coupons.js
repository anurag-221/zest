const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
    console.log('--- Inspecting Push Subscriptions ---');
    const { data: subs, error: subError } = await supabase
        .from('push_subscriptions')
        .select('user_id, endpoint');

    if (subError) {
        console.error('Error fetching subs:', subError.message);
    } else {
        console.log(`Found ${subs.length} subscriptions.`);
        for (const sub of subs) {
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id, name, phone')
                .eq('id', sub.user_id)
                .single();

            if (userError) {
                console.log(`❌ Sub for user_id [${sub.user_id}] has NO matching user record.`);
            } else {
                console.log(`✅ Sub for user_id [${sub.user_id}] matches user: ${user.name} (${user.phone})`);
            }
        }
    }

    console.log('\n--- Checking for coupons table ---');
    const { error: couponError } = await supabase.from('coupons').select('count', { count: 'exact', head: true });
    if (couponError) {
        console.log('❌ coupons table error:', couponError.message);
    } else {
        console.log('✅ coupons table exists.');
    }
}

inspectData();
