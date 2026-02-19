'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductRail from '@/components/ProductRail';
import { ProductService } from '@/services/product-service'; // Assuming client-safe or mocked
import Link from 'next/link';

const categoryNames: Record<string, string> = {
  'fruits-veg': 'Fruits & Vegetables',
  'dairy': 'Dairy, Bread & Eggs',
  'snacks': 'Munchies & Snacks',
  'drinks': 'Cold Drinks & Juices',
  'breakfast': 'Breakfast & Instant Food',
  'tea': 'Tea, Coffee & Health Drinks',
  'bakery': 'Bakery & Biscuits',
  'frozen': 'Frozen Food & Ice Creams',
  'pantry': 'Atta, Rice & Dal',
};

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const categoryName = categoryNames[slug] || 'Category';

    const categoryProducts = ProductService.getProductsByCategory(slug);
    if (slug === 'pantry') {
        const extra = ProductService.getProductsByCategory('pantry');
        // Dedupe if needed, for now just simplistic
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
            <Header />
            
            {/* Category Banner (Mock) */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 mb-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-2 capitalize">{categoryName}</h1>
                    <p className="opacity-80">Fresh stock available now.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20">
                {categoryProducts.length > 0 ? (
                    <ProductRail title={`All ${categoryName}`} products={categoryProducts} />
                ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center">
                         <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-4xl transition-colors">
                            🤷‍♂️
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                         <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                            We couldn't find any products in this category. 
                            Try checking other categories or come back later!
                         </p>
                         <Link href="/" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Back to Home
                         </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
