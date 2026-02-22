'use server';
import { supabaseAdmin } from '@/lib/supabase';

interface Coupon {
    code: string;
    type: 'flat' | 'percentage' | 'shipping';
    value: number;
    maxDiscount?: number;
    minOrderValue: number;
    description: string;
}

export async function validateCoupon(code: string, orderTotal: number) {
    try {
        const { data: dbCoupon, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .ilike('code', code)
            .eq('is_active', true)
            .single();

        if (error || !dbCoupon) {
            return { success: false, message: 'Invalid or inactive coupon code' };
        }

        const coupon: Coupon = {
            code: dbCoupon.code,
            type: dbCoupon.type as 'flat' | 'percentage' | 'shipping',
            value: dbCoupon.value,
            maxDiscount: dbCoupon.max_discount,
            minOrderValue: dbCoupon.min_order_value,
            description: dbCoupon.description
        };

        if (orderTotal < coupon.minOrderValue) {
            return { success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` };
        }

        let discount = 0;
        if (coupon.type === 'flat') {
            discount = coupon.value;
        } else if (coupon.type === 'percentage') {
            discount = (orderTotal * coupon.value) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else if (coupon.type === 'shipping') {
            // Handled separately or passed as flag
            discount = 0; // Shipping discount logic usually handled in fee calculation
        }

        return { 
            success: true, 
            coupon: {
                code: coupon.code,
                type: coupon.type,
                discount: Math.floor(discount), // Round down
                description: coupon.description
            } 
        };
    } catch (error) {
        console.error('Coupon validation error', error);
        return { success: false, message: 'Failed to validate coupon' };
    }
}
