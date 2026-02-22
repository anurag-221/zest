'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { Product, Inventory } from '@/types';
import { revalidatePath } from 'next/cache';

export async function saveProduct(product: Product) {
  const { error } = await supabaseAdmin.from('products').upsert({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: product.brand,
      tags: product.tags,
      is_best_seller: product.isBestSeller,
      is_new_arrival: product.isNewArrival,
      is_trending: product.isTrending,
      stock: product.stock,
      variants: product.variants,
      colors: product.colors
  });

  if (error) {
      console.error('Failed to save product', error);
      return { success: false, error: 'Database error' };
  }

  revalidatePath('/');
  revalidatePath('/admin/products');
  return { success: true };
}

export async function updateInventory(cityId: string, productId: string, stock: number, price: number) {
    const { error } = await supabaseAdmin.from('inventory').upsert({
        city_id: cityId,
        product_id: productId,
        stock,
        price
    }, { onConflict: 'city_id,product_id' });

    if (error) {
        console.error('Failed to update inventory', error);
        return { success: false, error: 'Database error' };
    }

    revalidatePath('/');
    return { success: true };
}

export async function placeOrder(
    cityId: string,
    items: { id: string; quantity: number }[],
    userId?: string,
    customer?: { name: string; address: string; phone?: string }
) {
    // 1. Fetch current inventory for these specific items in this city
    const itemIds = items.map(i => i.id);
    const { data: currentInventory, error: invError } = await supabaseAdmin
        .from('inventory')
        .select('product_id, stock, price, products(name)')
        .eq('city_id', cityId)
        .in('product_id', itemIds);

    if (invError || !currentInventory || currentInventory.length === 0) {
        throw new Error('Failed to verify inventory or city not found');
    }

    // 2. Verify Stock
    let orderTotal = 0;
    const orderItems: any[] = [];
    const stockUpdates: { product_id: string; new_stock: number }[] = [];

    for (const item of items) {
        const invRecord = currentInventory.find(i => i.product_id === item.id);
        if (!invRecord) {
             throw new Error(`Product ${item.id} not available in this city`);
        }
        
        if (invRecord.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.id}`);
        }

        // Calculate total and prepare order item details
        orderTotal += invRecord.price * item.quantity;
        orderItems.push({
            id: item.id,
            name: invRecord.products ? (invRecord.products as any).name : 'Unknown Item',
            quantity: item.quantity,
            price: invRecord.price
        });

        // Prepare stock deduction
        stockUpdates.push({
            product_id: item.id,
            new_stock: invRecord.stock - item.quantity
        });
    }

    // 3. Deduct Stock in DB
    // Supabase JS doesn't have a bulk update for multiple different rows without a stored procedure, 
    // so we will loop upserts or single updates for now
    for (const update of stockUpdates) {
        await supabaseAdmin
            .from('inventory')
            .update({ stock: update.new_stock })
            .eq('city_id', cityId)
            .eq('product_id', update.product_id);
    }

    const orderId = `ORD-${Date.now()}`;
    
    // 4. Save Order to Database
    const { error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
            id: orderId,
            user_id: userId || null,
            customer: customer || null,
            items: orderItems,
            total: orderTotal,
            status: 'pending',
            status_history: [{ status: 'pending', timestamp: new Date().toISOString() }],
            city_id: cityId,
        });

    if (orderError) {
        console.error('Failed to create order', orderError);
        throw new Error('Failed to create order record');
    }

    revalidatePath('/');
    revalidatePath('/admin/orders');
    return { success: true, orderId };
}
