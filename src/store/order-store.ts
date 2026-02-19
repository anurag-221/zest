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
  status: 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  address?: string;
  paymentMethod?: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: 'user-orders-storage',
    }
  )
);
