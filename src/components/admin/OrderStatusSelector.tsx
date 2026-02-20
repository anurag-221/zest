'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/actions/order-actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Order } from '@/types';

interface Props {
    orderId: string;
    currentStatus: Order['status'];
}

export default function OrderStatusSelector({ orderId, currentStatus }: Props) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<Order['status']>(currentStatus);

    const statuses: { value: Order['status'], label: string }[] = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'packed', label: 'Packed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'out-for-delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const handleStatusChange = async (newStatus: Order['status']) => {
        setLoading(true);
        setStatus(newStatus);
        
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success(`Order #${orderId} marked as ${newStatus}`);
            } else {
                toast.error(result.message || 'Failed to update order status');
                setStatus(currentStatus); // Revert on failure
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
            setStatus(currentStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                disabled={loading}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 font-bold cursor-pointer transition-colors hover:bg-white min-w-[140px]"
            >
                {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>
            {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
    );
}
