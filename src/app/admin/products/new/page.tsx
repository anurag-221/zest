import { db } from '@/lib/fs-db';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const cities = await db.cities.getAll();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
      <ProductForm cities={cities} />
    </div>
  );
}
