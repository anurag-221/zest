'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { Address } from '@/store/auth-store';

/** Generic helper - update any JSON columns in the users table */
async function syncUserField(userId: string, field: string, value: unknown) {
    try {
        const { error } = await supabaseAdmin
            .from('users')
            .update({ [field]: value })
            .eq('id', userId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error(`Failed to sync user.${field}:`, error);
        return { success: false };
    }
}

export async function syncUserAddresses(userId: string, addresses: Address[]) {
    return syncUserField(userId, 'addresses', addresses);
}

export async function syncUserCart(userId: string, cart: unknown[]) {
    return syncUserField(userId, 'cart', cart);
}

export async function syncUserWishlist(userId: string, wishlist: unknown[]) {
    return syncUserField(userId, 'wishlist', wishlist);
}

export async function syncUserWallet(
    userId: string,
    balance: number,
    transactions: unknown[]
) {
    try {
        const { error } = await supabaseAdmin
            .from('users')
            .update({ wallet_balance: balance, wallet_transactions: transactions })
            .eq('id', userId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Failed to sync user wallet:', error);
        return { success: false };
    }
}

export async function syncViewedProducts(userId: string, productIds: string[]) {
    return syncUserField(userId, 'viewed_products', productIds);
}

