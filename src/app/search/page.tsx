'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ProductRail from '@/components/ProductRail';
import { ProductService } from '@/services/product-service'; // Assuming this service exists and works client-side or we mock data access
import { Product } from '@/types';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        if (query) {
            const allProducts = ProductService.getAllProducts();
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) || 
                p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
        }
    }, [query]);

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <Header />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-gray-900 mb-6">
                    {results.length} results for "{query}"
                </h1>

                {results.length > 0 ? (
                    <ProductRail title="Products" products={results} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                         <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="No Results" className="w-32 opacity-50 mb-4 mix-blend-multiply" />
                         <p className="text-gray-500 font-medium">No matches found. Try searching for "Milk", "Bread", or "Chips".</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
