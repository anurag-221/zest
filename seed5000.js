/**
 * seed5000.js
 * Fetches real DummyJSON products (with full image galleries) and seeds them
 * alongside hand-crafted flagship phones. Each product has a `variants` array
 * for size/storage/colour options — shown as chips on the product card.
 * Old smartphones (older than 2 years) are excluded.
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory.json');

// Current date: Feb 2026. Only show phones released >= Feb 2024.
const RECENT_PHONE_KEYWORDS = [
    'iphone 15', 'iphone 16', 'samsung galaxy s24', 'samsung galaxy s25',
    'pixel 8', 'pixel 9', 'oneplus 12', 'oneplus 13', 'redmi 13',
    'nothing phone 2', 'realme 12', 'poco x6', 'poco f6',
];

function isRecentPhone(name) {
    const n = name.toLowerCase();
    return RECENT_PHONE_KEYWORDS.some(k => n.includes(k));
}

/**
 * Returns a variants array (chips) for a given category.
 * These appear as selectable chips on the ProductCard.
 */
function getVariantsForCategory(category, basePrice) {
    const cat = category.toLowerCase();
    if (cat.includes('beverage') || cat.includes('drink')) {
        return [
            { label: '250ml', price: Math.round(basePrice * 0.5) },
            { label: '500ml', price: Math.round(basePrice * 0.85) },
            { label: '1L', price: basePrice },
            { label: '2L', price: Math.round(basePrice * 1.7) },
        ];
    }
    if (cat === 'groceries') {
        return [
            { label: '250g', price: Math.round(basePrice * 0.3) },
            { label: '500g', price: Math.round(basePrice * 0.55) },
            { label: '1kg', price: basePrice },
            { label: '5kg', price: Math.round(basePrice * 4.2), discount: '16% off' },
            { label: '10kg', price: Math.round(basePrice * 7.5), discount: '25% off' },
        ];
    }
    if (cat === 'beauty' || cat.includes('skincare') || cat.includes('skin-care')) {
        return [
            { label: '30ml', price: Math.round(basePrice * 0.5) },
            { label: '75ml', price: basePrice },
            { label: '150ml', price: Math.round(basePrice * 1.7), discount: '10% off' },
            { label: '300ml', price: Math.round(basePrice * 2.9), discount: '18% off' },
        ];
    }
    if (cat.includes('fragrance')) {
        return [
            { label: '30ml', price: Math.round(basePrice * 0.55) },
            { label: '50ml', price: basePrice },
            { label: '100ml', price: Math.round(basePrice * 1.7), discount: '15% off' },
            { label: '200ml', price: Math.round(basePrice * 2.8), discount: '22% off' },
        ];
    }
    if (cat.includes('shirt') || cat.includes('top') || cat.includes('dress')) {
        return [
            { label: 'S', price: basePrice },
            { label: 'M', price: basePrice },
            { label: 'L', price: basePrice },
            { label: 'XL', price: Math.round(basePrice * 1.05) },
            { label: 'XXL', price: Math.round(basePrice * 1.05) },
        ];
    }
    if (cat.includes('shoe') || cat.includes('boot')) {
        return [
            { label: 'UK 6', price: basePrice },
            { label: 'UK 7', price: basePrice },
            { label: 'UK 8', price: basePrice },
            { label: 'UK 9', price: basePrice },
            { label: 'UK 10', price: basePrice },
        ];
    }
    if (cat.includes('laptop')) {
        return [
            { label: '256GB SSD', price: basePrice },
            { label: '512GB SSD', price: Math.round(basePrice * 1.25) },
            { label: '1TB SSD', price: Math.round(basePrice * 1.55), discount: '5% off' },
        ];
    }
    if (cat.includes('smartphone') || cat.includes('tablet') || cat.includes('phone')) {
        return [
            { label: '128GB', price: basePrice },
            { label: '256GB', price: Math.round(basePrice * 1.18) },
            { label: '512GB', price: Math.round(basePrice * 1.4), discount: '8% off' },
        ];
    }
    if (cat.includes('mobile-acc') || cat.includes('accessories')) {
        return [
            { label: '1 Piece', price: basePrice },
            { label: '2 Pack', price: Math.round(basePrice * 1.7), discount: '15% off' },
            { label: '5 Pack', price: Math.round(basePrice * 3.5), discount: '30% off' },
        ];
    }
    if (cat.includes('watch') || cat.includes('jewel') || cat.includes('sunglass') || cat.includes('bag')) {
        return [{ label: '1 Piece', price: basePrice }];
    }
    if (cat.includes('furniture') || cat.includes('kitchen')) {
        return [
            { label: '1 Piece', price: basePrice },
            { label: 'Set of 2', price: Math.round(basePrice * 1.8), discount: '10% off' },
            { label: 'Set of 4', price: Math.round(basePrice * 3.2), discount: '20% off' },
        ];
    }
    // Default: pack sizes
    return [
        { label: '1x', price: basePrice },
        { label: '2x Pack', price: Math.round(basePrice * 1.75), discount: '12% off' },
        { label: '5x Pack', price: Math.round(basePrice * 3.8), discount: '24% off' },
    ];
}

async function seed() {
    try {
        console.log('📦 Fetching DummyJSON products with images...');
        const res = await fetch('https://dummyjson.com/products?limit=194&skip=0&select=id,title,description,price,thumbnail,images,category,brand,tags,rating');
        const data = await res.json();
        console.log(`✅ Got ${data.products.length} products from DummyJSON.`);

        const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
        const cities = Object.keys(inventory);

        // Keep hand-crafted flagship phones only — drop all generated products (clean slate)
        const handCrafted = existingProducts.filter(p => p.id.startsWith('phone-'));
        console.log(`🔒 Keeping ${handCrafted.length} hand-crafted flagship phones.`);

        // Build base products from DummyJSON (skip old smartphones)
        const baseProducts = data.products
            .filter(p => {
                if (p.category === 'smartphones') return isRecentPhone(p.title);
                return true;
            })
            .map(p => {
                const basePrice = Math.round(p.price * 83);
                const imgs = p.images || [p.thumbnail];
                return {
                    id: `prod-gen-${p.id}`,
                    name: p.title,               // ← plain product name, no suffix
                    description: p.description,
                    price: basePrice,
                    image: p.thumbnail,
                    category: p.category,
                    brand: p.brand || 'Generic',
                    tags: p.tags || [p.category],
                    isBestSeller: p.rating >= 4.7,
                    isNewArrival: false,
                    variants: getVariantsForCategory(p.category, basePrice), // ← chips on card
                    _imgs: imgs,
                };
            });

        console.log(`📱 Base products (after phone filter): ${baseProducts.length}`);

        // Final list: hand-crafted phones + DummyJSON base products (no duplicates)
        const cleanBase = baseProducts.map(({ _imgs, ...rest }) => rest);
        const final = [...handCrafted, ...cleanBase];
        console.log(`📊 Total products: ${final.length}`);

        // Seed inventory for new base products only
        const allNewIds = cleanBase.map(p => p.id);
        for (const city of cities) {
            if (!inventory[city]) inventory[city] = {};
            for (const id of allNewIds) {
                const p = final.find(x => x.id === id);
                inventory[city][id] = {
                    stock: Math.floor(Math.random() * 120) + 5,
                    price: p.price,
                };
            }
        }

        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(final, null, 2));
        fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
        console.log(`\n✅ Done! ${final.length} products saved.`);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
}

seed();
