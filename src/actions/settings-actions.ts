'use server';

import { db } from '@/lib/fs-db';
import { GlobalSettings } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
    try {
        const settings = await db.settings.get();
        return { success: true, settings };
    } catch (error) {
        console.error('Failed to get settings:', error);
        return { success: false, message: 'Failed to load settings.' };
    }
}

export async function saveSettings(newSettings: GlobalSettings) {
    try {
        await db.settings.save(newSettings);
        
        // Ensure cache breaks for pages relying on settings
        revalidatePath('/admin/settings');
        revalidatePath('/checkout');
        
        return { success: true };
    } catch (error) {
        console.error('Failed to save settings:', error);
        return { success: false, message: 'Failed to save settings.' };
    }
}
