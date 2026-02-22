import { supabaseAdmin } from '@/lib/supabase';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const { data: dbCities } = await supabaseAdmin.from('cities').select('*');
  const cities = dbCities || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
      <ProductForm cities={cities} />
    </div>
  );
}
