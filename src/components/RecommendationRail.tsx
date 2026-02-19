'use client';

import { Product } from '@/types';
import { Plus, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';

interface RecommendationRailProps {
    title?: string;
    products: Product[];
}

export default function RecommendationRail({ title = "Recommended for You", products }: RecommendationRailProps) {
  const { addItem } = useCartStore();

  if (!products || products.length === 0) return null;

  return (
    <div className="py-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700 my-8">
      <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-indigo-600 fill-indigo-200" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="min-w-[160px] w-[160px] bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 snap-start hover:shadow-md transition-all flex flex-col"
          >
            <Link href={`/product/${product.id}`} className="block relative aspect-square mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
            </Link>

            <div className="flex-1 flex flex-col">
                <Link href={`/product/${product.id}`} className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 min-h-[2.5em]">
                    {product.name}
                </Link>
                <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-sm text-gray-900 dark:text-indigo-300">₹{product.price}</span>
                    <button 
                        onClick={() => addItem(product)}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
