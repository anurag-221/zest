'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Clock, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useHaptic } from '@/hooks/useHaptic';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product & { stock?: number; price?: number };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, widthdrawItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { trigger } = useHaptic();
  
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div 
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 hover:shadow-lg transition-all duration-300 hover:border-indigo-100 dark:hover:border-indigo-900 flex flex-col"
    >
      <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
         <Link href={`/product/${product.id}`} className="contents">
            {/* Skeleton */}
            {!isImageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img 
                src={product.image} 
                alt={product.name}
                onLoad={() => setIsImageLoaded(true)}
                className={`object-contain w-3/4 h-3/4 mix-blend-multiply group-hover:scale-110 transition-all duration-500 cursor-pointer ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
         </Link>
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-sm flex items-center gap-1 z-10">
            <Clock size={10} className="text-indigo-600" />
            9 mins
        </div>
        
        {/* Wishlist Button */}
        <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
                trigger.soft();
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm z-10 hover:bg-red-50 transition-colors group/heart"
        >
            <Heart 
                size={16} 
                className={`transition-colors ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/heart:text-red-500'}`} 
            />
        </button>

        {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] z-20">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
            </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.description.substring(0, 20)}...</div>
        <Link href={`/product/${product.id}`} className="hover:text-indigo-600 transition-colors">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em]">
                {product.name}
            </h4>
        </Link>
        
        <div className="mt-auto flex flex-col gap-2">
            {!isOutOfStock && product.stock !== undefined && product.stock < 5 && (
                <p className="text-[10px] font-bold text-red-600 animate-pulse">
                    Hurry! Only {product.stock} left
                </p>
            )}
            <div className="flex items-center justify-between">
            <div>
                <span className="text-xs text-gray-500 line-through">₹{product.price! + 10}</span>
                <div className="font-bold text-base text-gray-900 dark:text-white">₹{product.price}</div>
            </div>
            
            {quantity === 0 ? (
                <button 
                    disabled={isOutOfStock}
                    onClick={() => {
                        addItem(product);
                        trigger.medium();
                    }}
                    className="bg-white border border-indigo-600 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-active:scale-95"
                >
                    <Plus size={18} />
                </button>
            ) : (
                <div className="flex items-center gap-2 bg-indigo-600 text-white rounded-lg p-1">
                    <button 
                        onClick={() => {
                            widthdrawItem(product.id);
                            trigger.soft();
                        }}
                        className="p-0.5 hover:bg-indigo-700 rounded transition-colors active:scale-90"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                    <button 
                        disabled={product.stock !== undefined && quantity >= product.stock}
                        onClick={() => {
                            addItem(product);
                            trigger.medium();
                        }}
                        className="p-0.5 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  </div>
  );
}
