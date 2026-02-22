'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { Order } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getOrderById(id: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error || !order) {
            return { success: false, message: 'Order not found' };
        }
        
        return { success: true, order: order as Order };
    } catch (error) {
        console.error('Failed to fetch order', error);
        return { success: false, message: 'Failed to fetch order' };
    }
}

export async function getOrdersByIds(ids: string[]): Promise<{ success: boolean; orders?: Order[]; message?: string }> {
    try {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .in('id', ids);

        if (error) {
             return { success: false, message: 'Failed to fetch orders' };
        }
        
        return { success: true, orders: orders as Order[] };
    } catch (error) {
        console.error('Failed to fetch orders', error);
        return { success: false, message: 'Failed to fetch orders' };
    }
}

export async function updateOrderStatus(id: string, newStatus: Order['status']): Promise<{ success: boolean; message?: string }> {
    try {
        // Fetch current to append history
        const { data: currentOrder, error: fetchErr } = await supabaseAdmin
            .from('orders')
            .select('status, status_history')
            .eq('id', id)
            .single();
            
        if (fetchErr || !currentOrder) {
            return { success: false, message: 'Order not found' };
        }

        // Don't update if it's the same status
        if (currentOrder.status === newStatus) {
            return { success: true };
        }

        // Initialize history if it doesn't exist
        const history = currentOrder.status_history || [];
        
        // Add new timestamped status
        history.push({
            status: newStatus,
            timestamp: new Date().toISOString()
        });

        const { error: updateErr } = await supabaseAdmin
            .from('orders')
            .update({
                status: newStatus,
                status_history: history
            })
            .eq('id', id);

        if (updateErr) {
            return { success: false, message: 'Failed to save order status' };
        }
        
        // Simulated Email Dispatch
        console.log(`\n\n[EMAIL DISPATCH SIMULATION]`);
        console.log(`To: Customer`);
        console.log(`Subject: Your order #${id} is now ${newStatus}!`);
        console.log(`View live tracking on your dashboard.\n\n`);

        // Revalidate relevant paths
        revalidatePath(`/order-success/${id}`);
        revalidatePath('/admin/orders');
        
        return { success: true };
    } catch (error) {
        console.error('Failed to update order status', error);
        return { success: false, message: 'Failed to update order status' };
    }
}
