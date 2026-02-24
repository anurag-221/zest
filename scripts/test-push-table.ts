import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const { data, error } = await s.from('push_campaigns').select('id').limit(1);
    if (error) console.log('❌ ERROR:', error.message);
    else console.log('✅ push_campaigns table exists!');
}

check().catch(console.error);
