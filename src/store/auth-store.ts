import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  line1: string;
  line2: string;
  city: string;
  zip: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  addresses: Address[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  adminLogin: () => void;
  logout: () => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (user) => set({ user: { ...user, addresses: user.addresses || [] }, isAuthenticated: true }),
      adminLogin: () => set({ isAdmin: true }),
      logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),
      addAddress: (address) => set((state) => {
        if (!state.user) return state;
        return { user: { ...state.user, addresses: [...(state.user.addresses || []), address] } };
      }),
      removeAddress: (id) => set((state) => {
        if (!state.user) return state;
        return { user: { ...state.user, addresses: state.user.addresses.filter(a => a.id !== id) } };
      }),
    }),
    {
      name: 'user-auth-storage',
    }
  )
);
