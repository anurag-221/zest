import { supabaseAdmin } from '@/lib/supabase';
import { getProductTags } from '@/actions/event-actions';
import EventForm from '@/components/admin/EventForm';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [{ data: dbEvent }, { data: dbCities }, availableTags] = await Promise.all([
    supabaseAdmin.from('events').select('*').eq('id', id).single(),
    supabaseAdmin.from('cities').select('*'),
    getProductTags()
  ]);
  const cities = dbCities || [];

  if (!dbEvent) {
      return <div className="p-8">Event not found.</div>;
  }

  const mappedEvent = {
     ...dbEvent,
     targetCities: dbEvent.target_cities || []
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
      <EventForm initialData={mappedEvent as any} availableCities={cities} availableTags={availableTags} />
    </div>
  );
}
