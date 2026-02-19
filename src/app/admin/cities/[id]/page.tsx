import { db } from '@/lib/fs-db';
import CityForm from '@/components/admin/CityForm';
import { notFound } from 'next/navigation';

export default async function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const city = (await db.cities.getAll()).find(c => c.id === id);
  
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
