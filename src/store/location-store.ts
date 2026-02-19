import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { City } from '../types';

interface LocationState {
  selectedCity: City | null;
  setCity: (city: City) => void;
  clearCity: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedCity: null,
      setCity: (city) => set({ selectedCity: city }),
      clearCity: () => set({ selectedCity: null }),
    }),
    {
      name: 'user-location-storage',
      storage: createJSONStorage(() => sessionStorage), // Use Session Storage as requested
    }
  )
);
