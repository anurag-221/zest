import fs from 'fs/promises';
import path from 'path';
import { AppEvent, Product, Inventory, City, Order, Coupon, GlobalSettings } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function readJsonFile<T>(filename: string, fallback?: T): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT' && fallback !== undefined) {
        return fallback;
    }
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read data from ${filename}`);
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    // Ensure directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error: any) {
    if (error.code === 'EROFS' || error.syscall === 'open') {
        console.warn(`[WARN] Read-only file system detected (Vercel). Write to ${filename} skipped.`);
        return; // Gracefully degrade
    }
    console.error(`Error writing ${filename}:`, error);
    throw new Error(`Failed to write data to ${filename}`);
  }
}

export const db = {
  events: {
    getAll: () => readJsonFile<AppEvent[]>('events.json', []),
    saveAll: (events: AppEvent[]) => writeJsonFile('events.json', events),
  },
  products: {
    getAll: () => readJsonFile<Product[]>('products.json', []),
    saveAll: (products: Product[]) => writeJsonFile('products.json', products),
  },
  inventory: {
    getAll: () => readJsonFile<Inventory>('inventory.json', {}),
    saveAll: (inventory: Inventory) => writeJsonFile('inventory.json', inventory),
  },
  cities: {
    getAll: () => readJsonFile<City[]>('cities.json', []),
    saveAll: (cities: City[]) => writeJsonFile('cities.json', cities),
  },
  orders: {
    getAll: () => readJsonFile<Order[]>('orders.json', []),
    saveAll: (orders: Order[]) => writeJsonFile('orders.json', orders),
    add: async (order: Order) => {
        const orders = await db.orders.getAll();
        orders.unshift(order); // Add to top
        await db.orders.saveAll(orders);
    }
  },
  coupons: {
    getAll: () => readJsonFile<Coupon[]>('coupons.json', []),
    saveAll: (coupons: Coupon[]) => writeJsonFile('coupons.json', coupons),
  },
  settings: {
    get: async () => {
        const defaultSettings: GlobalSettings = {
            storeName: 'Zest Hyperlocal',
            supportEmail: 'support@zest.com',
            currency: 'INR',
            deliveryFee: 35,
            freeDeliveryThreshold: 499,
            handlingFee: 5,
            platformFee: 2,
            adminPasswordHash: 'Zest@2026' // In a real app, this should be a bcrypt hash
        };
        return readJsonFile<GlobalSettings>('settings.json', defaultSettings);
    },
    save: (settings: GlobalSettings) => writeJsonFile('settings.json', settings),
  }
};
