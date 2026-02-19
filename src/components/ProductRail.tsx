'use client';

import { Product } from '../types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

interface ProductRailProps {
  title: string;
  products: (Product & { stock?: number; price?: number })[];
  viewAllLink?: string;
}

export default function ProductRail({ title, products, viewAllLink }: ProductRailProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-indigo-600 font-semibold text-sm hover:underline">
              See All
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
