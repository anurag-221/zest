'use server';

import { GlobalSettings } from '@/types';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function getSettings() {
    try {
        const { data, error } = await supabaseAdmin.from('store_settings').select('data').eq('id', 'default').single();
        const settings = data?.data || { platformFee: 2, deliveryFee: 35, handlingFee: 5, freeDeliveryThreshold: 499, adminPasswordHash: 'Zest@2026' };
        return { success: true, settings };
    } catch (error) {
        console.error('Failed to get settings:', error);
        return { success: false, message: 'Failed to load settings.' };
    }
}

export async function saveSettings(newSettings: GlobalSettings) {
    try {
        await supabaseAdmin.from('store_settings').upsert({ id: 'default', data: newSettings, updated_at: new Date().toISOString() });
        
        // Ensure cache breaks for pages relying on settings
        revalidatePath('/admin/settings');
        revalidatePath('/checkout');
        
        return { success: true };
    } catch (error) {
        console.error('Failed to save settings:', error);
        return { success: false, message: 'Failed to save settings.' };
    }
}
