import fs from 'fs/promises';
import path from 'path';
import { AppEvent, Product, Inventory, City, Order } from '@/types';

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
  } catch (error) {
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
  }
};
