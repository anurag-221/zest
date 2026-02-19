'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

export default function BottomNav() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/categories', icon: Grid },
    // Cart is now a floating bar, removed from nav
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Hide bottom nav on specific pages
  // Hide bottom nav on specific pages
  if (pathname?.includes('/checkout') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-2xl md:hidden pb-safe">
      <div className="grid grid-cols-3 h-16">
        {navItems.map((item) => {
          const ActiveIcon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
                <div className="relative">
                <ActiveIcon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
