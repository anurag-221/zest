'use server';

import { getSettings } from '@/actions/settings-actions';

export async function validateAdminPassword(password: string) {
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
