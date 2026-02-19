'use client';

import Header from '@/components/Header';
import CategoryGrid from '@/components/CategoryGrid';
import { Search } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Search size={24} />
            </span>
            Browse Categories
        </h1>
        
        <CategoryGrid />

        {/* Placeholder for more browsing options */}
        <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Curated Collections</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-800">Breakfast Store</h3>
                    <p className="text-xs text-orange-600 mt-1">Milk, Bread, Eggs & more</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h3 className="font-bold text-green-800">Fresh Produce</h3>
                    <p className="text-xs text-green-600 mt-1">Fruits & Vegetables</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
