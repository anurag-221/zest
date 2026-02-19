import { db } from '@/lib/fs-db';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await db.products.getAll()).find(p => p.id === id);
  const cities = await db.cities.getAll();
  const allInventory = await db.inventory.getAll();
  
  if (!product) {
    notFound();
  }

  // Transform inventory to format expected by form: { [cityId]: { stock, price } }
  // DB structure is { [cityId]: { [productId]: { stock, price } } }
  const productInventory: Record<string, { stock: number, price: number }> = {};
  
  cities.forEach(city => {
      const cityInv = allInventory[city.id];
      if (cityInv && cityInv[product.id]) {
          productInventory[city.id] = cityInv[product.id];
      }
  });

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
