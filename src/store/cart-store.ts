import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { toast } from 'sonner';

export interface CartItem extends Product {
  quantity: number;
  stock?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  widthdrawItem: (productId: string) => void; // Decrease quantity
  clearCart: () => void;
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

      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === product.id);
          
          if (!existingItem) {
              toast.success(`Added ${product.name} to cart`);
              return {
                items: [...state.items, { ...product, quantity: 1 }],
                total: state.total + product.price,
              };
          } else {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              total: state.total + product.price,
            };
          }
        });
      },

      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        set({
          items: updatedItems,
          total: calculateTotal(updatedItems),
        });
      },

      widthdrawItem: (productId) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === productId);

        if (existingItem && existingItem.quantity > 1) {
          const updatedItems = currentItems.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
          set({
            items: updatedItems,
            total: calculateTotal(updatedItems),
          });
        } else {
            // Remove if quantity is 1
            const updatedItems = currentItems.filter((item) => item.id !== productId);
            set({
                items: updatedItems,
                total: calculateTotal(updatedItems)
            });
        }
      },
      
      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: null, discount: 0 }),
      setTip: (amount) => set({ tip: amount }),
      
      clearCart: () => set({ items: [], total: 0, couponCode: null, discount: 0, tip: 0 }),
    }),
    {
      name: 'user-cart-storage',
    }
  )
);

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};
