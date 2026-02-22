import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { syncUserWishlist } from '@/actions/sync-actions';

interface WishlistState {
  items: Product[];
  addItem: (product: Product, userId?: string) => void;
  removeItem: (productId: string, userId?: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product, userId?: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, userId) => {
        const currentItems = get().items;
        if (!currentItems.find(i => i.id === product.id)) {
          const newItems = [...currentItems, product];
          if (userId) syncUserWishlist(userId, newItems).catch(console.error);
          set({ items: newItems });
        }
      },
      removeItem: (productId, userId) => {
        const newItems = get().items.filter(i => i.id !== productId);
        if (userId) syncUserWishlist(userId, newItems).catch(console.error);
        set({ items: newItems });
      },
      isInWishlist: (productId) => {
        return !!get().items.find(i => i.id === productId);
      },
      toggleWishlist: (product, userId) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id, userId);
        } else {
          addItem(product, userId);
        }
      }
    }),
    { name: 'wishlist-storage' }
  )
);
