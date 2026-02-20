'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { id: 'smartphones', name: 'Smartphones', image: 'https://cdn-icons-png.flaticon.com/512/0/191.png', color: 'bg-gray-100 dark:bg-gray-900/30 dark:border-gray-800' },
  { id: 'groceries', name: 'Groceries', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png', color: 'bg-green-100 dark:bg-green-900/30 dark:border-green-800' },
  { id: 'beauty', name: 'Beauty', image: 'https://cdn-icons-png.flaticon.com/512/1940/1940922.png', color: 'bg-pink-100 dark:bg-pink-900/30 dark:border-pink-800' },
  { id: 'fragrances', name: 'Fragrances', image: 'https://cdn-icons-png.flaticon.com/512/3596/3596009.png', color: 'bg-purple-100 dark:bg-purple-900/30 dark:border-purple-800' },
  { id: 'furniture', name: 'Furniture', image: 'https://cdn-icons-png.flaticon.com/512/2611/2611026.png', color: 'bg-amber-100 dark:bg-amber-900/30 dark:border-amber-800' },
  { id: 'home-decoration', name: 'Home Decor', image: 'https://cdn-icons-png.flaticon.com/512/4754/4754546.png', color: 'bg-rose-100 dark:bg-rose-900/30 dark:border-rose-800' },
  { id: 'kitchen-accessories', name: 'Kitchen', image: 'https://cdn-icons-png.flaticon.com/512/1655/1655060.png', color: 'bg-orange-100 dark:bg-orange-900/30 dark:border-orange-800' },
  { id: 'laptops', name: 'Laptops', image: 'https://cdn-icons-png.flaticon.com/512/428/428054.png', color: 'bg-slate-100 dark:bg-slate-900/30 dark:border-slate-800' },
  { id: 'mobile-accessories', name: 'Mobile Acc.', image: 'https://cdn-icons-png.flaticon.com/512/3067/3067822.png', color: 'bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800' },
  { id: 'mens-shirts', name: 'Mens Shirts', image: 'https://cdn-icons-png.flaticon.com/512/2445/2445656.png', color: 'bg-cyan-100 dark:bg-cyan-900/30 dark:border-cyan-800' },
  { id: 'mens-shoes', name: 'Mens Shoes', image: 'https://cdn-icons-png.flaticon.com/512/2742/2742638.png', color: 'bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800' },
  { id: 'mens-watches', name: 'Mens Watches', image: 'https://cdn-icons-png.flaticon.com/512/2784/2784459.png', color: 'bg-stone-100 dark:bg-stone-900/30 dark:border-stone-800' },
  { id: 'snacks', name: 'Snacks', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', color: 'bg-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-800' },
];

export default function CategoryGrid() {
  return (
    <section className="py-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-4">Shop by Category</h2>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 px-4">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.id}`}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-105 transition-transform duration-300 shadow-sm border border-black/5`}>
               <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain drop-shadow-md" />
            </div>
            <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 leading-tight md:max-w-[80px] line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
