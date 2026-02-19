'use client';

import { BrandService } from '@/services/brand-service';
import { ProductService } from '@/services/product-service';
import { useLocationStore } from '@/store/location-store';
import { useCartStore } from '@/store/cart-store';
import Header from '@/components/Header';
import { ArrowLeft, Clock, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const [brandId, setBrandId] = useState<string>('');
  const { selectedCity } = useLocationStore();
  const { items, addItem, widthdrawItem } = useCartStore();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);

  // Unwrap params
  useEffect(() => {
    params.then(p => setBrandId(p.id));
  }, [params]);

  const brand = BrandService.getBrandById(brandId);

  useEffect(() => {
    if (brandId && selectedCity) {
        const brandProducts = ProductService.getProductsByBrand(brandId, selectedCity.id);
        setProducts(brandProducts);
    }
  }, [brandId, selectedCity]);

  if (!brand || !selectedCity) {
      if(brandId && !brand) return <div className="p-10 text-center">Brand not found</div>;
      return <div className="min-h-screen bg-gray-50 dark:bg-black"></div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <div className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 h-16 flex items-center gap-4">
              <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <ArrowLeft className="text-gray-700 dark:text-gray-300" />
              </Link>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{brand.name} Store</h1>
          </div>
      </div>

      {/* Brand Hero */}
      <div className="relative h-48 md:h-64 bg-gray-200 overflow-hidden">
        <img src={brand.banner} className="w-full h-full object-cover" alt={brand.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg">
                    <img src={brand.logo} className="w-full h-full object-contain" alt={brand.name} />
                </div>
                <div className="text-white">
                    <h1 className="text-2xl font-bold">{brand.name}</h1>
                    <p className="text-gray-200 text-sm">{brand.description}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Products ({products.length})</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => {
                const cartItem = items.find((i) => i.id === product.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
                    <div 
                        key={product.id} 
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex flex-col hover:shadow-lg transition-all"
                    >
                        <Link href={`/product/${product.id}`} className="block relative aspect-square mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                             <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                            />
                        </Link>
                        
                        <div className="flex-1 flex flex-col">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.description.substring(0, 20)}...</div>
                            <Link href={`/product/${product.id}`} className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5em] hover:text-indigo-600 transition-colors">
                                {product.name}
                            </Link>

                             <div className="flex items-center justify-between mt-auto">
                                <div>
                                    <span className="text-xs text-gray-500 line-through">₹{product.price + 10}</span>
                                    <div className="font-bold text-base text-gray-900 dark:text-white">₹{product.price}</div>
                                </div>
                                
                                {quantity === 0 ? (
                                    <button 
                                        onClick={() => addItem(product)}
                                        className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    >
                                        ADD
                                    </button>
                                ) : (
                                    <div className="flex items-center bg-indigo-600 rounded-lg">
                                        <button 
                                            onClick={() => widthdrawItem(product.id)}
                                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-indigo-700 rounded-l-lg transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-8 text-center text-white font-bold text-sm">{quantity}</span>
                                        <button 
                                            onClick={() => addItem(product)}
                                            className="w-8 h-8 flex items-center justify-center text-white hover:bg-indigo-700 rounded-r-lg transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </main>
  );
}
