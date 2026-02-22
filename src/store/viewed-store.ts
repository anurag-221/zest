import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncViewedProducts } from '@/actions/sync-actions';

interface ViewedState {
  viewedProductIds: string[];
  addViewedProduct: (id: string, userId?: string) => void;
  clearHistory: (userId?: string) => void;
}

export const useViewedStore = create<ViewedState>()(
  persist(
    (set) => ({
      viewedProductIds: [],
      
      addViewedProduct: (id, userId) => set((state) => {
          const filtered = state.viewedProductIds.filter(existingId => existingId !== id);
          const newArray = [id, ...filtered].slice(0, 15);
          if (userId) syncViewedProducts(userId, newArray).catch(console.error);
          return { viewedProductIds: newArray };
      }),

      clearHistory: (userId) => {
        if (userId) syncViewedProducts(userId, []).catch(console.error);
        set({ viewedProductIds: [] });
      },
    }),
    { name: 'recently-viewed-storage' }
  )
);

