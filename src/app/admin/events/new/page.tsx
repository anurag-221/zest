import { supabaseAdmin } from '@/lib/supabase';
import { getProductTags } from '@/actions/event-actions';
import EventForm from '@/components/admin/EventForm';

export default async function NewEventPage() {
  const [{ data: dbCities }, availableTags] = await Promise.all([
    supabaseAdmin.from('cities').select('*'),
    getProductTags()
  ]);
  const cities = dbCities || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      <EventForm availableCities={cities} availableTags={availableTags} />
    </div>
  );
}
