import { supabaseAdmin } from '@/lib/supabase';
import CityForm from '@/components/admin/CityForm';
import { notFound } from 'next/navigation';

export default async function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data } = await supabaseAdmin.from('cities').select('*').eq('id', id).single();
  
  const city = data ? {
      ...data,
      isActive: data.is_active,
      displayName: data.display_name
  } : null;
  
  if (!city) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit City</h1>
      <CityForm initialData={city} />
    </div>
  );
}
