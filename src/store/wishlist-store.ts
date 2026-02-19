import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const currentItems = get().items;
        if (!currentItems.find(i => i.id === product.id)) {
          set({ items: [...currentItems, product] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.id !== productId) });
      },
      isInWishlist: (productId) => {
        return !!get().items.find(i => i.id === productId);
      },
      toggleWishlist: (product) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      }
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
