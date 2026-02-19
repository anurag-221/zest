'use server';

import fs from 'fs/promises';
import path from 'path';

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
        const filePath = path.join(process.cwd(), 'data', 'coupons.json');
        const fileData = await fs.readFile(filePath, 'utf-8');
        const coupons: Coupon[] = JSON.parse(fileData);

        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

        if (!coupon) {
            return { success: false, message: 'Invalid coupon code' };
        }

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
