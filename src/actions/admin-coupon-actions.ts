'use server';

import { db } from '@/lib/fs-db';
import { Coupon } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveCoupon(coupon: Coupon) {
    try {
        const coupons = await db.coupons.getAll();
        const existingIndex = coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
        
        if (existingIndex >= 0) {
            coupons[existingIndex] = coupon;
        } else {
            coupons.push(coupon);
        }

        await db.coupons.saveAll(coupons);
        revalidatePath('/admin/coupons');
        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error('Failed to save coupon', error);
        return { success: false, message: 'Failed to save coupon' };
    }
}

export async function deleteCoupon(code: string) {
    try {
        const coupons = await db.coupons.getAll();
        const updatedCoupons = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
        
        await db.coupons.saveAll(updatedCoupons);
        revalidatePath('/admin/coupons');
        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete coupon', error);
        return { success: false, message: 'Failed to delete coupon' };
    }
}
