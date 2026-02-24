-- Enhancement for Coupons Table
-- Run this in Supabase SQL Editor

-- 1. Ensure the table exists first
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'flat', 'percentage', 'shipping'
    value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
);

-- 2. Add scheduling and status fields if they don't exist (for existing tables)
-- This is safe to run after the CREATE TABLE IF NOT EXISTS
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 3. Fix permissions and refresh schema cache
-- This ensures PostgREST (Supabase API) sees the table and can access it
GRANT ALL ON TABLE coupons TO postgres, service_role, anon, authenticated;

-- Force a schema cache reload via a dummy comment
COMMENT ON TABLE coupons IS 'Promo codes and discounts with scheduling support';

-- 4. Create an index for faster lookups during checkout
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;
