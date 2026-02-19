import { Product } from '@/types';
import { ProductService } from './product-service';

// Mock "Smart" Associations (Knowledge Graph)
const PAIRINGS: Record<string, string[]> = {
    'bread': ['butter', 'jam', 'eggs', 'milk'],
    'milk': ['cookies', 'bread', 'cereals'],
    'coffee': ['sugar', 'milk', 'biscuits'],
    'chips': ['coke', 'pepsi', 'dip', 'sauce'],
    'pasta': ['sauce', 'cheese', 'olive oil'],
    'rice': ['dal', 'spices'],
};

export const RecommendationService = {
    /**
     * Get recommendations based on a single product (for Product Details Page)
     */
    getSimilarProducts: (product: Product, limit: number = 5): Product[] => {
        const allProducts = ProductService.getAllProducts();
        
        // 1. Tag Scoring
        const scored = allProducts
            .filter(p => p.id !== product.id)
            .map(p => {
                let score = 0;
                // Same Category matches
                if (p.category === product.category) score += 5;
                
                // Tag Overlap
                const sharedTags = p.tags.filter(t => product.tags.includes(t));
                score += sharedTags.length * 2;
                
                // Explicit Pairing (Name contains key words)
                const pName = product.name.toLowerCase();
                const targetName = p.name.toLowerCase();
                
                // Check if current product name triggers any pairings
                Object.keys(PAIRINGS).forEach(key => {
                    if (pName.includes(key)) {
                        // If current product is "Bread", and target is "Butter", huge boost
                        const targets = PAIRINGS[key];
                        targets.forEach(t => {
                            if (targetName.includes(t)) score += 10;
                        });
                    }
                });

                return { product: p, score };
            });
            
        // Sort by score and take top N
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.product);
    },

    /**
     * Get recommendations based on Cart contents (Cross-sell)
     */
    getCartRecommendations: (cartItemIds: string[], limit: number = 6): Product[] => {
        const allProducts = ProductService.getAllProducts();
        const cartProducts = allProducts.filter(p => cartItemIds.includes(p.id));
        
        const recommendations = new Map<string, { product: Product, score: number }>();

        cartProducts.forEach(source => {
            const similar = RecommendationService.getSimilarProducts(source, 3);
            similar.forEach(rec => {
                if (cartItemIds.includes(rec.id)) return; // Already in cart
                
                const existing = recommendations.get(rec.id);
                if (existing) {
                    existing.score += 2; // Recommended by multiple items
                } else {
                    recommendations.set(rec.id, { product: rec, score: 5 }); // Base score
                }
            });
        });

        return Array.from(recommendations.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.product);
    }
};
