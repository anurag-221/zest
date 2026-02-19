'use client';

import Header from '@/components/Header';
import CategoryGrid from '@/components/CategoryGrid';
import { Search } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors">
                <Search size={24} />
            </span>
            Browse Categories
        </h1>
        
        <CategoryGrid />

        {/* Placeholder for more browsing options */}
        <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Curated Collections</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 transition-colors">
                    <h3 className="font-bold text-orange-800 dark:text-orange-200">Breakfast Store</h3>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Milk, Bread, Eggs & more</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 transition-colors">
                    <h3 className="font-bold text-green-800 dark:text-green-200">Fresh Produce</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Fruits & Vegetables</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
