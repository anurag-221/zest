'use client';

import { useState, useEffect } from 'react';

import { useParams } from 'next/navigation';
import { useViewedStore } from '@/store/viewed-store';
import Header from '@/components/Header';
import { ProductService } from '@/services/product-service'; // Assuming client-safe
import { useCartStore } from '@/store/cart-store';
import { Plus, Minus, Star, ShieldCheck, Truck, Heart } from 'lucide-react';
import ProductRail from '@/components/ProductRail';
import RecommendationRail from '@/components/RecommendationRail';
import { RecommendationService } from '@/services/recommendation-service';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlist-store';
import { useHaptic } from '@/hooks/useHaptic';

export default function ProductPage() {
    const params = useParams();
    const id = params.id as string;
    const { items, addItem, widthdrawItem } = useCartStore();
    const { toggleWishlist, isInWishlist } = useWishlistStore();
    const { trigger } = useHaptic();
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Mock Fetch Product
    const allProducts = ProductService.getAllProducts();
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4 transition-colors">
                <Header />
                <div className="text-center mt-20">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">The item you are looking for does not exist or has been removed.</p>
                    <Link href="/" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    const cartItem = items.find(i => i.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10);

    // Track View
    useEffect(() => {
        if (product) {
            useViewedStore.getState().addViewedProduct(product.id);
        }
    }, [product?.id]);

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 pb-20 transition-colors">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Section */}
                    {/* Image Section */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 flex items-center justify-center aspect-square md:aspect-auto md:h-[500px] relative overflow-hidden transition-colors">
                         {!isImageLoaded && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                         )}
                         <img 
                            src={product.image} 
                            alt={product.name} 
                            onLoad={() => setIsImageLoaded(true)}
                            className={`w-3/4 h-3/4 object-contain mix-blend-multiply drop-shadow-xl hover:scale-105 transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {product.stock !== undefined && product.stock <= 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                Out of Stock
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 w-fit px-2 py-1 rounded transition-colors">
                            {product.category}
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                            {product.name}
                        </h1>
                        <div 
                            className="prose prose-indigo dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 mb-6 text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />

                        {/* Price & Rating */}
                        <div className="flex items-center gap-4 mb-8">
                            <div>
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                                <span className="text-lg text-gray-400 dark:text-gray-600 line-through ml-2">₹{product.price + (product.price * 0.2)}</span>
                            </div>
                            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                                <span className="font-bold text-yellow-700 dark:text-yellow-400 text-sm">4.8</span>
                            </div>
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="flex items-center gap-4 mb-8">
                             {quantity === 0 ? (
                                <button 
                                    onClick={() => {
                                        addItem(product);
                                        trigger.medium();
                                    }}
                                    // disabled={product.stock <= 0} // Fix logic if stock optional
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Add to Cart
                                </button>
                             ) : (
                                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-2 w-fit transition-colors">
                                    <button 
                                        onClick={() => {
                                            widthdrawItem(product.id);
                                            trigger.soft();
                                        }}
                                        className="bg-white dark:bg-gray-700 p-2 rounded-lg text-gray-700 dark:text-white shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors active:scale-95"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="font-bold text-xl min-w-[30px] text-center text-gray-900 dark:text-white">{quantity}</span>
                                    <button 
                                        onClick={() => {
                                            addItem(product);
                                            trigger.medium();
                                        }}
                                        className="bg-white dark:bg-gray-700 p-2 rounded-lg text-gray-700 dark:text-white shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors active:scale-95"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                             )}

                             <button 
                                onClick={() => toggleWishlist(product)}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                    isInWishlist(product.id) 
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' 
                                    : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-500'
                                }`}
                             >
                                <Heart size={24} className={isInWishlist(product.id) ? 'fill-red-500' : ''} />
                             </button>
                        </div>

                         {/* Trust Badges */}
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                    <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900 dark:text-white">Quality Assured</p>
                                    <p className="text-gray-500 dark:text-gray-400">Fresh from farms</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                    <Truck size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900 dark:text-white">Instant Delivery</p>
                                    <p className="text-gray-500 dark:text-gray-400">In 10 minutes</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-10 space-y-12">
                    <RecommendationRail title="Frequently Bought Together" products={RecommendationService.getSimilarProducts(product)} />
                    {relatedProducts.length > 0 && (
                        <div className="pt-4">
                             <ProductRail title="Related Items" products={relatedProducts} />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
