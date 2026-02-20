'use client';

import { useLocationStore } from '@/store/location-store';
import { AppEvent, Product } from '@/types';
import { EventService } from '@/services/event-service';
import { ProductService } from '@/services/product-service';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import BannerCarousel from '@/components/BannerCarousel';
import ProductRail from '@/components/ProductRail';
import CategoryGrid from '@/components/CategoryGrid';
import BrandRail from '@/components/BrandRail';

import PullToRefresh from '@/components/PullToRefresh';
import { useCallback } from 'react';
import { useViewedStore } from '@/store/viewed-store';

export default function Home() {
  const { selectedCity } = useLocationStore();
  const [activeEvents, setActiveEvents] = useState<AppEvent[]>([]);
  const [cityProducts, setCityProducts] = useState<any[]>([]);
  const [eventProducts, setEventProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<{name: string, products: any[]}[]>([]);
  const [mounted, setMounted] = useState(false);
  const { viewedProductIds } = useViewedStore();

  const loadData = useCallback(async () => {
    if (!selectedCity) return;

    // Simulate network delay for better UX on refresh
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Get Active Events
    const events = EventService.getActiveEvents(selectedCity.id);
    setActiveEvents(events);

    // 2. Get All Products for City (Availability check)
    // Clear cache effectively by calling the service (which we cleared manually before calling this if refreshing)
    const products = ProductService.getProductsByCity(selectedCity.id);
    setCityProducts(products);

    // 3. Filter Products for Event (if any event is active)
    if (events.length > 0) {
      const primaryEvent = events[0];
      const tags = primaryEvent.rules.showTags;
      const filtered = products.filter(p => 
          p.tags && p.tags.some(tag => tags.includes(tag))
      );
      setEventProducts(filtered);
    } else {
      setEventProducts([]);
    }

    // 4. Derive Top Categories (categories with most products)
    const categoryMap = new Map<string, any[]>();
    products.forEach(p => {
        if (!categoryMap.has(p.category)) categoryMap.set(p.category, []);
        categoryMap.get(p.category)!.push(p);
    });
    
    // Sort categories by product count and take top 4
    const sortedCategories = Array.from(categoryMap.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 4)
        .map(([name, products]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
            products: products.slice(0, 10) // show up to 10 per rail
        }));
        
    setTopCategories(sortedCategories);
  }, [selectedCity]);

  // Effect to load data when city changes
  useEffect(() => {
    setMounted(true);
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
      ProductService.clearCache();
      await loadData();
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">
      <Header />
      
      {!selectedCity ? (
         <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="w-64 h-64 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-100/50 animate-pulse rounded-full"></div>
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/2838/2838912.png" 
                    alt="Select Location" 
                    className="w-32 h-32 relative z-10 opacity-80" 
                />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Where do you want delivery?</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Select your location to see products, prices, and delivery times for your area.</p>
                <button 
                    onClick={() => useLocationStore.getState().setCity(null as any)} // Trigger modal
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    Select Location
                </button>
            </div>
         </div>
      ) : (
        <PullToRefresh onRefresh={handleRefresh}>
          <BannerCarousel events={activeEvents} />

          {mounted && viewedProductIds.length > 0 && (
             <ProductRail 
                 title="Recently Viewed" 
                 products={viewedProductIds.map(id => ProductService.getAllProducts().find(p => p.id === id)).filter(Boolean) as any[]} 
             />
          )}
        
          <BrandRail />

          <CategoryGrid />

          {activeEvents.length > 0 && eventProducts.length > 0 && (
            <ProductRail 
                title={`Featured in ${activeEvents[0].name}`} 
                products={eventProducts} 
            />
          )}

          {/* Best Sellers Rail - Filtered by isBestSeller flag */}
          {cityProducts.some(p => p.isBestSeller) && (
              <ProductRail 
                title="Best Sellers in Your City" 
                products={cityProducts.filter(p => p.isBestSeller)} 
              />
          )}

          {/* New Arrivals Rail - Filtered by isNewArrival flag */}
          {cityProducts.some(p => p.isNewArrival) && (
              <ProductRail 
                title="New Arrivals" 
                products={cityProducts.filter(p => p.isNewArrival)} 
              />
          )}

          {/* 🔥 Trending Deals — flagship phones */}
          {cityProducts.some(p => p.isTrending) && (
              <ProductRail
                title="🔥 Trending Deals"
                products={cityProducts.filter(p => p.isTrending)}
              />
          )}

           {/* Dynamic Category Rails */}
           {topCategories.map(cat => (
              <ProductRail 
                key={cat.name}
                title={`Top in ${cat.name}`} 
                products={cat.products} 
              />
           ))}
        </PullToRefresh>
      )}

    </main>
  );
}
