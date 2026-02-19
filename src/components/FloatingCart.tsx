'use client';

import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingCart() {
  const { items, total } = useCartStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Hide on checkout page or if cart is empty
  if (itemCount === 0 || pathname?.includes('/checkout')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden">
      <Link 
        href="/checkout"
        className="bg-indigo-600 text-white p-4 rounded-xl shadow-xl shadow-indigo-200 flex items-center justify-between animate-in slide-in-from-bottom active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-indigo-100">{itemCount} items</span>
            <span className="font-bold text-lg">₹{total}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 font-bold text-sm">
          <span>View Cart</span>
          <ChevronRight size={18} />
        </div>
      </Link>
    </div>
  );
}
