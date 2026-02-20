import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ViewedState {
  viewedProductIds: string[];
  addViewedProduct: (id: string) => void;
  clearHistory: () => void;
}

export const useViewedStore = create<ViewedState>()(
  persist(
    (set) => ({
      viewedProductIds: [],
      
      addViewedProduct: (id: string) => set((state) => {
          // Remove if it already exists to move to top
          const filtered = state.viewedProductIds.filter(existingId => existingId !== id);
          
          // Add new element to front
          const newArray = [id, ...filtered];
          
          // Cap at 15 items latest
          return { viewedProductIds: newArray.slice(0, 15) };
      }),

      clearHistory: () => set({ viewedProductIds: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
