-- 1. Create Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    addresses JSONB DEFAULT '[]'::jsonb,
    cart JSONB DEFAULT '[]'::jsonb,
    wishlist JSONB DEFAULT '[]'::jsonb,
    wallet_balance NUMERIC DEFAULT 500,
    wallet_transactions JSONB DEFAULT '[]'::jsonb,
    viewed_products JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    tags TEXT[],
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    stock INTEGER DEFAULT 0,
    variants JSONB,
    colors TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Cities Table
CREATE TABLE cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pincodes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    lat NUMERIC,
    lng NUMERIC,
    display_name TEXT
);

-- 4. Create Inventory Table (Links Products to Cities)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    stock INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    UNIQUE(city_id, product_id)
);

-- 5. Create Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL,
    status_history JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    city_id TEXT REFERENCES cities(id),
    customer JSONB,
    discount NUMERIC,
    fees JSONB,
    payment_method TEXT
);

-- 6. Create Push Subscriptions Table
CREATE TABLE push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    keys JSONB NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Events Table
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    schedule JSONB NOT NULL,
    rules JSONB NOT NULL,
    assets JSONB NOT NULL,
    target_cities TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Coupons Table
CREATE TABLE coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. Create Settings Table
CREATE TABLE store_settings (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
