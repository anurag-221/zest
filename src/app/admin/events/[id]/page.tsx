import { db } from '@/lib/fs-db';
import EventForm from '@/components/admin/EventForm';
import { notFound } from 'next/navigation';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = (await db.events.getAll()).find(e => e.id === id);
  const cities = await db.cities.getAll();
  
  if (!event) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
      <EventForm initialData={event} availableCities={cities} />
    </div>
  );
}
