'use client';

import Header from '@/components/Header';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <ArrowLeft />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="fill-red-500 text-red-500" />
                My Wishlist
            </h1>
            <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400">
                {items.length} items
            </span>
        </div>

        {items.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <Heart size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Tap the heart icon on products to save them for later.</p>
                <Link href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors inline-block">
                    Explore Products
                </Link>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex gap-4 relative group hover:shadow-lg transition-all">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-xl flex-shrink-0 p-2">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">₹{product.price}</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">₹{product.price}</span>
                                    {/* Original price not available on Product type yet */}
                                </div>
                                <button 
                                    onClick={() => {
                                        addItem(product);
                                        toast.success('Moved to Cart');
                                    }}
                                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    title="Add to Cart"
                                >
                                    <ShoppingBag size={18} />
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                removeItem(product.id);
                                toast.error('Removed from Wishlist');
                            }}
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        )}

      </main>
    </div>
  );
}
