'use client';

import { BrandService } from '@/services/brand-service';
import Link from 'next/link';

export default function BrandRail() {
  const brands = BrandService.getAllBrands();

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Shop by Brand</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
        {brands.map((brand) => (
          <Link 
            key={brand.id} 
            href={`/brand/${brand.id}`}
            className="flex flex-col items-center gap-2 min-w-[80px] snap-start group"
          >
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center p-2 shadow-sm group-hover:border-indigo-500 transition-colors overflow-hidden">
                <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="w-full h-full object-contain"
                />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">
                {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
