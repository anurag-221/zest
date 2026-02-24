const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testActions() {
    console.log('Testing getSubscribers join...');
    const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*, users(name, phone)');

    if (error) {
        console.log('❌ getSubscribers Error:', error.message);
    } else {
        console.log('✅ getSubscribers Success. Count:', data.length);
        if (data.length > 0) {
            console.log('Sample user data:', data[0].users);
        }
    }

    console.log('Testing getCampaigns...');
    const { data: cData, error: cError } = await supabase
        .from('push_campaigns')
        .select('*');

    if (cError) {
        console.log('❌ getCampaigns Error:', cError.message);
    } else {
        console.log('✅ getCampaigns Success. Count:', cData.length);
    }
}

testActions();
