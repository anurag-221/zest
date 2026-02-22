import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Read from .env.local manually since this is a standalone node script
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DATA_DIR = path.join(process.cwd(), 'data');

async function readJson(filename: string, fallback: any = []) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.warn(`Could not read ${filename}, defaulting to fallback`);
    return fallback;
  }
}

async function migrate() {
  console.log('Starting explicit migration to Supabase...');

  // 1. Migrate Cities
  const cities = await readJson('cities.json');
  if (cities.length > 0) {
    console.log(`Migrating ${cities.length} cities...`);
    const { error } = await supabase.from('cities').upsert(
      cities.map((c: any) => ({
        id: c.id,
        name: c.name,
        pincodes: c.pincodes,
        is_active: c.isActive,
        lat: c.lat,
        lng: c.lng,
        display_name: c.displayName,
      }))
    );
    if (error) console.error('Error migrating cities:', error);
  }

  // 2. Migrate Products
  const products = await readJson('products.json');
  if (products.length > 0) {
    console.log(`Migrating ${products.length} products (this might take a moment)...`);
    // Batch inserts for large datasets
    const batchSize = 500;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        brand: p.brand,
        tags: p.tags || [],
        is_best_seller: p.isBestSeller || false,
        is_new_arrival: p.isNewArrival || false,
        is_trending: p.isTrending || false,
        stock: p.stock || 0,
        variants: p.variants || null,
        colors: p.colors || [],
      }));

      const { error } = await supabase.from('products').upsert(batch);
      if (error) {
          console.error(`Error migrating products batch ${i/batchSize}:`, error);
      } else {
          console.log(`Inserted products batch ${i/batchSize + 1}`);
      }
    }
  }

  // 3. Migrate Inventory
  const inventoryDb = await readJson('inventory.json', {});
  const inventoryRecords = [];
  const validProductIds = new Set(products.map((p: any) => p.id));
  
  for (const [cityId, productsInCity] of Object.entries(inventoryDb)) {
      for (const [productId, inv] of Object.entries(productsInCity as any)) {
          if (validProductIds.has(productId)) {
              inventoryRecords.push({
                  city_id: cityId,
                  product_id: productId,
                  stock: (inv as any).stock,
                  price: (inv as any).price
              });
          } else {
              console.warn(`Skipping inventory for missing product: ${productId} in city ${cityId}`);
          }
      }
  }

  if (inventoryRecords.length > 0) {
      console.log(`Migrating ${inventoryRecords.length} inventory records...`);
      const batchSize = 1000;
      for (let i = 0; i < inventoryRecords.length; i += batchSize) {
        const batch = inventoryRecords.slice(i, i + batchSize);
        const { error } = await supabase.from('inventory').upsert(batch, { onConflict: 'city_id,product_id' });
        if (error) {
            console.error(`Error migrating inventory batch ${i/batchSize}:`, error);
        } else {
            console.log(`Inserted inventory batch ${i/batchSize + 1}`);
        }
      }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
