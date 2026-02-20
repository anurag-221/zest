'use server';

import { db } from '@/lib/fs-db';

export async function validateAdminPassword(password: string) {
    try {
        const settings = await db.settings.get();
        // In a real application, you'd use bcrypt.compare here
        if (password === settings.adminPasswordHash) {
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    } catch (error) {
        console.error('Error validating admin password:', error);
        return { success: false, message: 'An error occurred during authentication' };
    }
}
