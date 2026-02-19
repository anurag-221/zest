'use server';

import { db } from '@/lib/fs-db';
import { Product, Inventory } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveProduct(product: Product) {
  const products = await db.products.getAll();
  const existingIndex = products.findIndex(p => p.id === product.id);

  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }

  await db.products.saveAll(products);
  revalidatePath('/');
  revalidatePath('/admin/products');
  return { success: true };
}

export async function updateInventory(cityId: string, productId: string, stock: number, price: number) {
    const inventory = await db.inventory.getAll();
    if (!inventory[cityId]) inventory[cityId] = {};
    
    inventory[cityId][productId] = { stock, price };
    
    await db.inventory.saveAll(inventory);
    revalidatePath('/');
    return { success: true };
}

export async function placeOrder(cityId: string, items: { id: string; quantity: number }[]) {
    const inventory = await db.inventory.getAll();
    const cityInventory = inventory[cityId];

    if (!cityInventory) {
        throw new Error('City inventory not found');
    }

    // 1. Verify Stock
    for (const item of items) {
        const productStock = cityInventory[item.id]?.stock || 0;
        if (productStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.id}`);
        }
    }

    // 2. Deduct Stock
    let orderTotal = 0;
    const orderItems: any[] = [];
    const products = await db.products.getAll();

    for (const item of items) {
        cityInventory[item.id].stock -= item.quantity;
        const product = products.find(p => p.id === item.id);
        const price = cityInventory[item.id]?.price || product?.price || 0;
        
        orderTotal += price * item.quantity;
        orderItems.push({
            id: item.id,
            name: product?.name || 'Unknown Item',
            quantity: item.quantity,
            price
        });
    }

    const orderId = `ORD-${Date.now()}`;
    
    // 3. Save Order
    await db.orders.add({
        id: orderId,
        items: orderItems,
        total: orderTotal, // Note: This is simplified, ideally pass full total from client or calc fees here
        status: 'processing',
        createdAt: new Date().toISOString(),
        cityId,
        // We can accept more details in args later
    });

    await db.inventory.saveAll(inventory);
    revalidatePath('/');
    revalidatePath('/admin/orders'); // Update admin dashboard
    return { success: true, orderId };
}
