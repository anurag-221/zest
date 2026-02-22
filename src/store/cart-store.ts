import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { toast } from 'sonner';
import { syncUserCart } from '@/actions/sync-actions';

export interface CartItem extends Product {
  quantity: number;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, userId?: string) => void;
  removeItem: (productId: string, userId?: string) => void;
  widthdrawItem: (productId: string, userId?: string) => void;
  clearCart: (userId?: string) => void;
  total: number;
  // Coupon Support
  discount: number;
  couponCode: string | null;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  // Tipping
  tip: number;
  setTip: (amount: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      discount: 0,
      couponCode: null,
      tip: 0,

      addItem: (product, userId) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === product.id);
          let newItems: CartItem[];

          if (!existingItem) {
              toast.success(`Added ${product.name} to cart`);
              newItems = [...state.items, { ...product, quantity: 1 }];
          } else {
            newItems = state.items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          }

          if (userId) syncUserCart(userId, newItems).catch(console.error);
          return { items: newItems, total: state.total + product.price };
        });
      },

      removeItem: (productId, userId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        if (userId) syncUserCart(userId, updatedItems).catch(console.error);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },

      widthdrawItem: (productId, userId) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === productId);
        let updatedItems: CartItem[];

        if (existingItem && existingItem.quantity > 1) {
          updatedItems = currentItems.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
          );
        } else {
          updatedItems = currentItems.filter((item) => item.id !== productId);
        }

        if (userId) syncUserCart(userId, updatedItems).catch(console.error);
        set({ items: updatedItems, total: calculateTotal(updatedItems) });
      },
      
      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: null, discount: 0 }),
      setTip: (amount) => set({ tip: amount }),
      
      clearCart: (userId) => {
        if (userId) syncUserCart(userId, []).catch(console.error);
        set({ items: [], total: 0, couponCode: null, discount: 0, tip: 0 });
      },
    }),
    { name: 'user-cart-storage' }
  )
);

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

