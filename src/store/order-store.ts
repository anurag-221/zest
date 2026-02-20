import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cart-store';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  deliveryFee: number;
  handlingFee: number;
  platformFee: number;
  tip?: number;
  total: number;
  date: string;
  userId?: string;
  status: 'pending' | 'processing' | 'packed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  statusHistory?: { status: string; timestamp: string }[];
  address?: string;
  paymentMethod?: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatusLocally: (id: string, newStatus: Order['status'], history?: {status: string, timestamp: string}[]) => void;
  getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
          set((state) => ({ orders: [order, ...state.orders] }));
          // Fire Push Notification
          fetch('/api/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  title: 'Order Confirmed! 🎉',
                  body: `Your order #${order.id.slice(0,6)} has been placed successfully.`,
                  url: '/profile/orders'
              })
          }).catch(console.error);
      },
      updateOrderStatusLocally: (id, newStatus, history) => {
          set((state) => ({
             orders: state.orders.map(o => o.id === id ? { ...o, status: newStatus, statusHistory: history || o.statusHistory } : o)
          }));
          
          if (['packed', 'out-for-delivery', 'delivered'].includes(newStatus)) {
              let title = '';
              let body = '';
              
              if (newStatus === 'packed') {
                  title = 'Order Packed 📦';
                  body = `Order #${id.slice(0,6)} is packed and ready to ship.`;
              } else if (newStatus === 'out-for-delivery') {
                  title = 'Out for Delivery 🚚';
                  body = `Order #${id.slice(0,6)} is arriving in 10 minutes!`;
              } else if (newStatus === 'delivered') {
                  title = 'Order Delivered ✅';
                  body = `Order #${id.slice(0,6)} has been delivered. Enjoy!`;
              }

              fetch('/api/push/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      title,
                      body,
                      url: '/profile/orders'
                  })
              }).catch(console.error);
          }
      },
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: 'user-orders-storage',
    }
  )
);
