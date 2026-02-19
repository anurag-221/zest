import { Product, Inventory } from '../types';
import productsData from '../../data/products.json';
import inventoryData from '../../data/inventory.json';

import { BrandService } from './brand-service';

const enrichProduct = (product: Product): Product => {
    // Simple heuristic: check if brand name is in product name
    const brands = BrandService.getAllBrands();
    const foundBrand = brands.find(b => product.name.toLowerCase().includes(b.name.toLowerCase()));
    
    return {
        ...product,
        brand: foundBrand ? foundBrand.id : undefined
    };
};

export const ProductService = {
  // Simple in-memory cache
  _cache: null as Product[] | null,

  clearCache: () => {
    ProductService._cache = null;
  },

  getAllProducts: (): Product[] => {
    if (ProductService._cache) {
        return ProductService._cache;
    }
    const enriched = (productsData as Product[]).map(enrichProduct);
    ProductService._cache = enriched;
    return enriched;
  },

  getProductsByCity: (cityId: string): (Product & { stock: number; price: number })[] => {
    const cityInventory = (inventoryData as Inventory)[cityId];
    if (!cityInventory) return [];

    return (productsData as Product[])
      .map(enrichProduct) // Enrich first
      .filter(product => cityInventory[product.id])
      .map(product => ({
        ...product,
        stock: cityInventory[product.id].stock,
        price: cityInventory[product.id].price
      }));
  },

  getProductById: (id: string, cityId?: string): Product & { stock?: number; currentPrice?: number } | undefined => {
    const allProducts = ProductService.getAllProducts(); // Use cache
    const product = allProducts.find(p => p.id === id);
    
    if (!product) return undefined;
    // Already enriched by getAllProducts cache

    if (cityId) {
      const cityInventory = (inventoryData as Inventory)[cityId];
      if (cityInventory && cityInventory[id]) {
        return {
          ...product,
          stock: cityInventory[id].stock,
          currentPrice: cityInventory[id].price
        };
      }
    }

    return product;
  },

  getProductsByBrand: (brandId: string, cityId: string): (Product & { stock: number; price: number })[] => {
    const products = ProductService.getProductsByCity(cityId); // Already enriched
    return products.filter(p => p.brand === brandId);
  },

  getProductsByCategory: (category: string): Product[] => {
      const all = ProductService.getAllProducts(); // Uses cache
      return all.filter(p => p.category === category);
  }
};
