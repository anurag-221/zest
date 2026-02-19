import { db } from '@/lib/fs-db';
import EventForm from '@/components/admin/EventForm';

export default async function NewEventPage() {
  const cities = await db.cities.getAll();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
      <EventForm availableCities={cities} />
    </div>
  );
}
