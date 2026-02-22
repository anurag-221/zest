import { supabaseClient } from '@/lib/supabase';
import { Product } from '../types';

export const ProductService = {
  clearCache: () => {
    // No-op for now as we are moving to direct DB queries
    // In production, we'd invalidate SWR or React Query caches here
  },

  getAllProducts: async (): Promise<Product[]> => {
    const { data: products } = await supabaseClient.from('products').select('*');
    return (products || []).map(p => ({
        ...p,
        isBestSeller: p.is_best_seller,
        isNewArrival: p.is_new_arrival,
        isTrending: p.is_trending
    }));
  },

  getProductsByCity: async (cityId: string): Promise<(Product & { stock: number; price: number })[]> => {
    // Join inventory with products table
    const { data: inventoryRecords, error } = await supabaseClient
        .from('inventory')
        .select(`
            stock, 
            price, 
            products (*)
        `)
        .eq('city_id', cityId);

    if (error || !inventoryRecords) return [];

    return inventoryRecords
        .filter(record => record.products) // Ensure product exists
        .map(record => {
            const p: any = record.products;
            return {
                ...p,
                isBestSeller: p.is_best_seller,
                isNewArrival: p.is_new_arrival,
                isTrending: p.is_trending,
                stock: record.stock,
                price: record.price
            };
        });
  },

  getProductById: async (id: string, cityId?: string): Promise<Product & { stock?: number; currentPrice?: number } | undefined> => {
    if (cityId) {
        const { data: record } = await supabaseClient
            .from('inventory')
            .select(`stock, price, products (*)`)
            .eq('city_id', cityId)
            .eq('product_id', id)
            .single();

        if (!record || !record.products) return undefined;
        
        const p: any = record.products;
        return {
            ...p,
            isBestSeller: p.is_best_seller,
            isNewArrival: p.is_new_arrival,
            isTrending: p.is_trending,
            stock: record.stock,
            currentPrice: record.price // Mapping price to currentPrice based on interface
        };
    } else {
        const { data: p } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
            
        if (!p) return undefined;
        return {
             ...p,
             isBestSeller: p.is_best_seller,
             isNewArrival: p.is_new_arrival,
             isTrending: p.is_trending
        };
    }
  },

  getProductsByBrand: async (brandId: string, cityId: string): Promise<(Product & { stock: number; price: number })[]> => {
    const products = await ProductService.getProductsByCity(cityId); 
    return products.filter(p => p.brand === brandId);
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
      const { data: products } = await supabaseClient
          .from('products')
          .select('*')
          .eq('category', category);
          
      return (products || []).map(p => ({
            ...p,
            isBestSeller: p.is_best_seller,
            isNewArrival: p.is_new_arrival,
            isTrending: p.is_trending
      }));
  }
};
