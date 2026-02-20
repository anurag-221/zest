const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory.json');

const phones = [
    // ─── iPhone 16 Series ───────────────────────────────────────────────────────
    {
        id: 'phone-iphone-16-pro-max',
        name: 'iPhone 16 Pro Max',
        description: 'Apple\'s most advanced iPhone. 6.9" Super Retina XDR display with ProMotion 120Hz, A18 Pro chip, 48MP Fusion camera, titanium design, and all-day battery life.',
        price: 144900,
        image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg',
        category: 'smartphones',
        brand: 'Apple',
        tags: ['iphone', 'apple', 'smartphone', 'trending', 'flagship', '5g'],
        isBestSeller: true,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '256GB', price: 144900 },
            { label: '512GB', price: 164900 },
            { label: '1TB', price: 194900, discount: '5% off' },
        ],
        colors: ['#1a1a1a', '#f5f5f0', '#8a7560', '#b5a99a'],
    },
    {
        id: 'phone-iphone-16-pro',
        name: 'iPhone 16 Pro',
        description: '6.3" Super Retina XDR display with ProMotion 120Hz, A18 Pro chip, titanium design, Camera Control button, and USB-C with USB 3 speeds.',
        price: 119900,
        image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-1.jpg',
        category: 'smartphones',
        brand: 'Apple',
        tags: ['iphone', 'apple', 'smartphone', 'trending', 'flagship', '5g'],
        isBestSeller: true,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '128GB', price: 119900 },
            { label: '256GB', price: 129900 },
            { label: '512GB', price: 149900, discount: '3% off' },
            { label: '1TB', price: 179900, discount: '5% off' },
        ],
        colors: ['#1a1a1a', '#f5f5f0', '#8a7560', '#b5a99a'],
    },
    {
        id: 'phone-iphone-16',
        name: 'iPhone 16',
        description: '6.1" Super Retina XDR display, A18 chip, new Camera Control button, 48MP Fusion camera, Action Button, and USB-C connectivity.',
        price: 79900,
        image: 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-1.jpg',
        category: 'smartphones',
        brand: 'Apple',
        tags: ['iphone', 'apple', 'smartphone', 'trending', '5g'],
        isBestSeller: false,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '128GB', price: 79900 },
            { label: '256GB', price: 89900 },
            { label: '512GB', price: 109900, discount: '4% off' },
        ],
        colors: ['#000000', '#f5f5f5', '#f0a0b0', '#008080', '#3a5dad'],
    },

    // ─── Samsung Galaxy S25 Series ───────────────────────────────────────────────
    {
        id: 'phone-samsung-s25-ultra',
        name: 'Samsung Galaxy S25 Ultra',
        description: 'The ultimate Galaxy experience. 6.9" QHD+ Dynamic AMOLED 2X, Snapdragon 8 Elite, 200MP ProVisual camera system, built-in S Pen, and 5000mAh battery.',
        price: 129999,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Samsung_Galaxy_S25_Ultra.jpg/500px-Samsung_Galaxy_S25_Ultra.jpg',
        category: 'smartphones',
        brand: 'Samsung',
        tags: ['samsung', 'galaxy', 'smartphone', 'trending', 'flagship', '5g', 's-pen'],
        isBestSeller: true,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '256GB', price: 129999 },
            { label: '512GB', price: 149999 },
            { label: '1TB', price: 179999, discount: '5% off' },
        ],
        colors: ['#1b1b1b', '#d4d0c8', '#9db9d6', '#f5f3ef'],
    },
    {
        id: 'phone-samsung-s25-plus',
        name: 'Samsung Galaxy S25+',
        description: '6.7" QHD+ Dynamic AMOLED 2X 120Hz, Snapdragon 8 Elite, 50MP ProVisual triple camera with AI features, 4900mAh battery with 45W fast charging.',
        price: 99999,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Samsung_Galaxy_S25_Ultra.jpg/500px-Samsung_Galaxy_S25_Ultra.jpg',
        category: 'smartphones',
        brand: 'Samsung',
        tags: ['samsung', 'galaxy', 'smartphone', 'trending', '5g'],
        isBestSeller: false,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '256GB', price: 99999 },
            { label: '512GB', price: 119999, discount: '4% off' },
        ],
        colors: ['#4a7fad', '#98c4a5', '#222222', '#c0bdb5'],
    },
    {
        id: 'phone-samsung-s25',
        name: 'Samsung Galaxy S25',
        description: '6.2" Dynamic AMOLED 2X 120Hz display, Snapdragon 8 Elite, 50MP triple rear camera, 4000mAh battery. Compact flagship with Galaxy AI built in.',
        price: 79999,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Samsung_Galaxy_S25_Ultra.jpg/500px-Samsung_Galaxy_S25_Ultra.jpg',
        category: 'smartphones',
        brand: 'Samsung',
        tags: ['samsung', 'galaxy', 'smartphone', 'trending', '5g'],
        isBestSeller: false,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '128GB', price: 79999 },
            { label: '256GB', price: 89999 },
        ],
        colors: ['#4a7fad', '#98c4a5', '#222222', '#c0bdb5', '#d87060'],
    },

    // ─── Google Pixel 9 Series ───────────────────────────────────────────────────
    {
        id: 'phone-pixel-9-pro-xl',
        name: 'Google Pixel 9 Pro XL',
        description: '6.8" LTPO OLED 1-120Hz, Google Tensor G4 chip, 50MP triple camera with 5x optical zoom, 7 years of OS updates, and built-in Gemini AI.',
        price: 108999,
        image: 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-pro-xl-1.jpg',
        category: 'smartphones',
        brand: 'Google',
        tags: ['google', 'pixel', 'smartphone', 'trending', 'flagship', '5g', 'ai'],
        isBestSeller: false,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '128GB', price: 108999 },
            { label: '256GB', price: 118999 },
            { label: '512GB', price: 138999, discount: '5% off' },
            { label: '1TB', price: 168999, discount: '8% off' },
        ],
        colors: ['#1a1a1a', '#f5f1ed', '#5a6b55', '#d4a0a0'],
    },
    {
        id: 'phone-pixel-9-pro',
        name: 'Google Pixel 9 Pro',
        description: '6.3" LTPO OLED 1-120Hz, Google Tensor G4, 50MP triple camera, 4700mAh battery, 7 years of guaranteed updates, and Gemini Advanced.',
        price: 89999,
        image: 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-pro-1.jpg',
        category: 'smartphones',
        brand: 'Google',
        tags: ['google', 'pixel', 'smartphone', 'trending', 'flagship', '5g', 'ai'],
        isBestSeller: false,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '128GB', price: 89999 },
            { label: '256GB', price: 99999 },
            { label: '512GB', price: 119999, discount: '5% off' },
            { label: '1TB', price: 149999, discount: '8% off' },
        ],
        colors: ['#1a1a1a', '#f5f1ed', '#5a6b55', '#d4a0a0'],
    },
    {
        id: 'phone-pixel-9',
        name: 'Google Pixel 9',
        description: '6.3" Actua OLED display, Google Tensor G4 chip, 50MP rear camera, 24hr battery with Extreme Battery Saver, and 7 years of OS & security updates.',
        price: 69999,
        image: 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-1.jpg',
        category: 'smartphones',
        brand: 'Google',
        tags: ['google', 'pixel', 'smartphone', 'trending', '5g', 'ai'],
        isBestSeller: false,
        isNewArrival: true,
        isTrending: true,
        variants: [
            { label: '128GB', price: 69999 },
            { label: '256GB', price: 79999 },
        ],
        colors: ['#1a1a1a', '#f5f1ed', '#2d6b5a', '#d4789a'],
    },
];

function addPhones() {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
    const cities = Object.keys(inventory);

    // Remove any existing hand-added phone entries
    const filtered = products.filter(p => !p.id.startsWith('phone-'));
    const final = [...filtered, ...phones];

    // Add inventory for each phone in each city
    for (const city of cities) {
        if (!inventory[city]) inventory[city] = {};
        for (const phone of phones) {
            inventory[city][phone.id] = {
                stock: Math.floor(Math.random() * 40) + 5,
                price: phone.price,
            };
        }
    }

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(final, null, 2));
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));

    console.log(`✅ Added ${phones.length} flagship phones. Total products: ${final.length}`);
    phones.forEach(p => console.log(`  • ${p.name} — ${p.variants.length} variants, ${p.colors.length} colors`));
}

addPhones();
