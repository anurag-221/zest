'use server';

import { getSettings } from '@/actions/settings-actions';
import { supabaseAdmin } from '@/lib/supabase';
import { User } from '@/store/auth-store';

export async function upsertUser(user: Partial<User> & { phone: string }) {
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert({
                id: user.id || Math.random().toString(36).substring(7),
                name: user.name || 'Anonymous',
                phone: user.phone,
                addresses: user.addresses || []
            }, { onConflict: 'phone' })
            .select()
            .single();

        if (error) throw error;
        return { success: true, user: data };
    } catch (error) {
        console.error('Error upserting user:', error);
        return { success: false, message: 'Failed to save user profile' };
    }
}

export async function validateAdminPassword(password: string) {
// ... existing code
    try {
        const res = await getSettings();
        const settings = res.settings;
        
        // In a real application, you'd use bcrypt.compare here
        if (settings && password === settings.adminPasswordHash) {
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    } catch (error) {
        console.error('Error validating admin password:', error);
        return { success: false, message: 'An error occurred during authentication' };
    }
}
