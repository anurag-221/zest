'use server';

import { db } from '@/lib/fs-db';
import { Order } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getOrderById(id: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
        const orders = await db.orders.getAll();
        const order = orders.find(o => o.id === id);
        
        if (!order) {
            return { success: false, message: 'Order not found' };
        }
        
        return { success: true, order };
    } catch (error) {
        console.error('Failed to fetch order', error);
        return { success: false, message: 'Failed to fetch order' };
    }
}

export async function updateOrderStatus(id: string, newStatus: Order['status']): Promise<{ success: boolean; message?: string }> {
    try {
        const orders = await db.orders.getAll();
        const orderIndex = orders.findIndex(o => o.id === id);
        
        if (orderIndex === -1) {
            return { success: false, message: 'Order not found' };
        }

        const currentOrder = orders[orderIndex];
        
        // Don't update if it's the same status
        if (currentOrder.status === newStatus) {
            return { success: true };
        }

        // Initialize history if it doesn't exist
        const history = currentOrder.statusHistory || [];
        
        // Add new timestamped status
        history.push({
            status: newStatus,
            timestamp: new Date().toISOString()
        });

        // Update the order object
        orders[orderIndex] = {
            ...currentOrder,
            status: newStatus,
            statusHistory: history
        };

        // Save back to db
        await db.orders.saveAll(orders);
        
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
