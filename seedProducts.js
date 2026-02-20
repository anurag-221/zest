const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory.json');

/**
 * Returns an array of {label, multiplier} variant definitions based on category.
 * multiplier is applied to the base price to get the variant price.
 */
function getVariantsForCategory(category) {
    const cat = category.toLowerCase();

    // Beverages / drinks
    if (cat.includes('beverage') || cat.includes('drink') || cat.includes('juice') || cat.includes('water')) {
        return [
            { label: '250ml', multiplier: 0.5 },
            { label: '500ml', multiplier: 0.85 },
            { label: '1L', multiplier: 1.0 },
            { label: '2L', multiplier: 1.7 },
        ];
    }

    // Groceries / food staples
    if (cat === 'groceries' || cat.includes('grain') || cat.includes('rice') || cat.includes('cereal') || cat.includes('pantry')) {
        return [
            { label: '250g', multiplier: 0.3, discount: null },
            { label: '500g', multiplier: 0.55, discount: null },
            { label: '1kg', multiplier: 1.0, discount: null },
            { label: '5kg', multiplier: 4.2, discount: '16% off' },
            { label: '10kg', multiplier: 7.5, discount: '25% off' },
        ];
    }

    // Snacks / munchies
    if (cat.includes('snack') || cat.includes('chip') || cat.includes('biscuit')) {
        return [
            { label: '100g', multiplier: 0.6 },
            { label: '200g', multiplier: 1.0 },
            { label: '500g', multiplier: 2.2, discount: '12% off' },
        ];
    }

    // Beauty / skincare / personal care
    if (cat === 'beauty' || cat.includes('skincare') || cat.includes('skin-care') || cat.includes('hair') || cat.includes('personal')) {
        return [
            { label: '30ml', multiplier: 0.5 },
            { label: '75ml', multiplier: 1.0 },
            { label: '150ml', multiplier: 1.7, discount: '10% off' },
            { label: '300ml', multiplier: 2.9, discount: '18% off' },
        ];
    }

    // Fragrances / perfume
    if (cat.includes('fragrance') || cat.includes('perfume') || cat.includes('deo')) {
        return [
            { label: '30ml', multiplier: 0.55 },
            { label: '50ml', multiplier: 1.0 },
            { label: '100ml', multiplier: 1.7, discount: '15% off' },
            { label: '200ml', multiplier: 2.8, discount: '22% off' },
        ];
    }

    // Clothing — shirts, tops, dresses, jackets
    if (cat.includes('shirt') || cat.includes('top') || cat.includes('dress') || cat.includes('jacket') || cat.includes('coat') || cat.includes('suit')) {
        return [
            { label: 'S', multiplier: 1.0 },
            { label: 'M', multiplier: 1.0 },
            { label: 'L', multiplier: 1.0 },
            { label: 'XL', multiplier: 1.05 },
            { label: 'XXL', multiplier: 1.05 },
        ];
    }

    // Shoes / footwear
    if (cat.includes('shoe') || cat.includes('boot') || cat.includes('sandal') || cat.includes('slipper')) {
        return [
            { label: 'UK 6', multiplier: 1.0 },
            { label: 'UK 7', multiplier: 1.0 },
            { label: 'UK 8', multiplier: 1.0 },
            { label: 'UK 9', multiplier: 1.0 },
            { label: 'UK 10', multiplier: 1.0 },
        ];
    }

    // Laptops
    if (cat.includes('laptop')) {
        return [
            { label: '256GB SSD', multiplier: 1.0 },
            { label: '512GB SSD', multiplier: 1.25 },
            { label: '1TB SSD', multiplier: 1.55, discount: '5% off' },
        ];
    }

    // Smartphones / tablets / electronics
    if (cat.includes('smartphone') || cat.includes('tablet') || cat.includes('phone') || cat.includes('iphone')) {
        return [
            { label: '128GB', multiplier: 1.0 },
            { label: '256GB', multiplier: 1.18 },
            { label: '512GB', multiplier: 1.4, discount: '8% off' },
        ];
    }

    // Mobile / PC accessories
    if (cat.includes('mobile-acc') || cat.includes('computer-acc') || cat.includes('accessory') || cat.includes('accessories')) {
        return [
            { label: '1 Piece', multiplier: 1.0 },
            { label: '2 Pack', multiplier: 1.7, discount: '15% off' },
            { label: '5 Pack', multiplier: 3.5, discount: '30% off' },
        ];
    }

    // Watches / jewellery / sunglasses — typically 1 piece
    if (cat.includes('watch') || cat.includes('jewel') || cat.includes('sunglass') || cat.includes('bag') || cat.includes('purse')) {
        return [
            { label: '1 Piece', multiplier: 1.0 },
        ];
    }

    // Furniture / home decor / kitchen
    if (cat.includes('furniture') || cat.includes('decoration') || cat.includes('kitchen')) {
        return [
            { label: '1 Piece', multiplier: 1.0 },
            { label: 'Set of 2', multiplier: 1.8, discount: '10% off' },
            { label: 'Set of 4', multiplier: 3.2, discount: '20% off' },
        ];
    }

    // Default fallback — generic pack sizes
    return [
        { label: '1x', multiplier: 1.0 },
        { label: '2x Pack', multiplier: 1.75, discount: '12% off' },
        { label: '5x Pack', multiplier: 3.8, discount: '24% off' },
    ];
}

async function seed() {
    try {
        console.log('Fetching all DummyJSON products...');
        const response = await fetch('https://dummyjson.com/products?limit=194&skip=0');
        const data = await response.json();
        console.log(`Got ${data.products.length} products from DummyJSON.`);

        const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
        const cities = Object.keys(inventory);

        // Keep original hand-crafted products
        const oldProducts = existingProducts.filter(p =>
            !p.id.startsWith('prod-gen-') && !p.id.startsWith('prod-var-')
        );
        console.log(`Keeping ${oldProducts.length} hand-crafted products.`);

        // Build products with category-aware embedded variants
        const newProducts = data.products.map(p => {
            const basePrice = Math.round(p.price * 83);
            const variantDefs = getVariantsForCategory(p.category);

            return {
                id: `prod-gen-${p.id}`,
                name: p.title,
                description: p.description,
                price: basePrice,
                image: p.thumbnail,
                category: p.category,
                brand: p.brand || 'Generic',
                tags: p.tags || [p.category],
                isBestSeller: p.rating >= 4.7,
                isNewArrival: false,
                variants: variantDefs.map(v => ({
                    label: v.label,
                    price: Math.round(basePrice * v.multiplier),
                    ...(v.discount ? { discount: v.discount } : {}),
                })),
            };
        });

        const finalProducts = [...oldProducts, ...newProducts];
        console.log(`Total products: ${finalProducts.length}`);

        // Seed inventory
        for (const city of cities) {
            if (!inventory[city]) inventory[city] = {};
            for (const p of newProducts) {
                inventory[city][p.id] = {
                    stock: Math.floor(Math.random() * 120) + 5,
                    price: p.price,
                };
            }
        }

        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(finalProducts, null, 2));
        fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));

        console.log(`\n✅ Done! ${finalProducts.length} products saved with category-smart variants.`);

        // Print category → variant summary
        const summary = {};
        newProducts.forEach(p => {
            if (!summary[p.category]) summary[p.category] = p.variants.map(v => v.label).join(', ');
        });
        console.log('\nCategory → Variants:');
        Object.entries(summary).forEach(([cat, vars]) => console.log(`  ${cat}: ${vars}`));
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
