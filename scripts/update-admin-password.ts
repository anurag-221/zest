import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    // Fetch existing settings
    const { data: existing } = await supabase
        .from('store_settings')
        .select('data')
        .eq('id', 'default')
        .single();

    const currentData = existing?.data || {};
    const newData = {
        platformFee: 2,
        deliveryFee: 35,
        handlingFee: 5,
        freeDeliveryThreshold: 499,
        ...currentData, // Preserve any other existing settings
        adminPasswordHash: 'Zest@2026', // Always override password
    };

    const { error } = await supabase
        .from('store_settings')
        .upsert({ id: 'default', data: newData, updated_at: new Date().toISOString() });

    if (error) {
        console.error('Error updating admin password:', error.message);
    } else {
        console.log('✅ Admin password updated to Zest@2026 in Supabase!');
    }
}

run().catch(console.error);
