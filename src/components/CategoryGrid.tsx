'use client';

import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { id: 'fruits-veg', name: 'Fruits & Veggies', image: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png', color: 'bg-green-100 dark:bg-green-900/30 dark:border-green-800' },
  { id: 'dairy', name: 'Dairy, Bread & Eggs', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png', color: 'bg-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-800' },
  { id: 'snacks', name: 'Munchies', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', color: 'bg-orange-100 dark:bg-orange-900/30 dark:border-orange-800' },
  { id: 'drinks', name: 'Cold Drinks', image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', color: 'bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800' },
  { id: 'breakfast', name: 'Breakfast', image: 'https://cdn-icons-png.flaticon.com/512/887/887396.png', color: 'bg-red-100 dark:bg-red-900/30 dark:border-red-800' },
  { id: 'tea', name: 'Tea & Coffee', image: 'https://cdn-icons-png.flaticon.com/512/924/924514.png', color: 'bg-brown-100 dark:bg-stone-800 dark:border-stone-700' },
  { id: 'bakery', name: 'Bakery', image: 'https://cdn-icons-png.flaticon.com/512/992/992710.png', color: 'bg-pink-100 dark:bg-pink-900/30 dark:border-pink-800' },
  { id: 'frozen', name: 'Frozen Food', image: 'https://cdn-icons-png.flaticon.com/512/2722/2722513.png', color: 'bg-cyan-100 dark:bg-cyan-900/30 dark:border-cyan-800' },
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
