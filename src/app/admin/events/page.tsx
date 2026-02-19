import { db } from '@/lib/fs-db';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { deleteEvent } from '@/actions/event-actions';

export default async function EventsPage() {
  const events = await db.events.getAll();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Events & Campaigns</h1>
            <p className="text-gray-500">Manage time-based sales and festivals.</p>
        </div>
        <Link href="/admin/events/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={18} />
            Create Event
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Event Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Schedule</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Type</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {events.map(event => {
                    const isActive = new Date() >= new Date(event.schedule.start) && new Date() <= new Date(event.schedule.end);
                    return (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{event.name}</div>
                                <div className="text-xs text-gray-500">ID: {event.id}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={14} />
                                    <span>{new Date(event.schedule.start).toLocaleDateString()} - {new Date(event.schedule.end).toLocaleDateString()}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded uppercase">
                                    {event.type}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {isActive ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                        Scheduled
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/admin/events/${event.id}`} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit size={16} />
                                    </Link>
                                    <form action={async () => {
                                        'use server';
                                        await deleteEvent(event.id);
                                    }}>
                                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                {events.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No events found. Create one to get started.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
