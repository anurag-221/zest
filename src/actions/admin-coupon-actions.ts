'use server';

import { Coupon } from '@/types';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function saveCoupon(coupon: Coupon) {
    try {
        const { error } = await supabaseAdmin.from('coupons').upsert({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_order_value: coupon.minOrderValue,
            max_discount: coupon.maxDiscount,
            description: coupon.description,
            is_active: coupon.isActive ?? true,
            start_date: coupon.startDate || null,
            end_date: coupon.endDate || null
        });
        
        if (error) throw error;

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
        const { error } = await supabaseAdmin.from('coupons').delete().eq('code', code);
        if (error) throw error;

        revalidatePath('/admin/coupons');
        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete coupon', error);
        return { success: false, message: 'Failed to delete coupon' };
    }
}
