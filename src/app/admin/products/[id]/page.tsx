import { supabaseAdmin } from '@/lib/supabase';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: dbProduct } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
  
  if (!dbProduct) {
    notFound();
  }

  const product = {
      ...dbProduct,
      isBestSeller: dbProduct.is_best_seller,
      isNewArrival: dbProduct.is_new_arrival,
      isTrending: dbProduct.is_trending
  };

  // Fetch Cities
  const { data: dbCities } = await supabaseAdmin.from('cities').select('*');
  const cities = dbCities || [];

  // Fetch Inventory for this specific product
  const { data: invRecords } = await supabaseAdmin
      .from('inventory')
      .select('*')
      .eq('product_id', product.id);

  // Transform inventory to format expected by form: { [cityId]: { stock, price } }
  const productInventory: Record<string, { stock: number, price: number }> = {};
  
  if (invRecords) {
      invRecords.forEach(record => {
          productInventory[record.city_id] = { stock: record.stock, price: record.price };
      });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm 
        initialData={product} 
        cities={cities}
        initialInventory={productInventory}
      />
    </div>
  );
}
