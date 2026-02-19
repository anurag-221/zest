import { db } from '@/lib/fs-db';
import Link from 'next/link';
import { Plus, Edit, MapPin } from 'lucide-react';

export default async function CitiesPage() {
  const cities = await db.cities.getAll();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">City Management</h1>
            <p className="text-gray-500">Manage operational cities and pincodes.</p>
        </div>
        <Link href="/admin/cities/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={18} />
            Add City
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(city => (
            <div key={city.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-indigo-600" size={20} />
                        <h3 className="font-bold text-lg text-gray-900">{city.name}</h3>
                    </div>
                    <Link href={`/admin/cities/${city.id}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                        <Edit size={18} />
                    </Link>
                </div>
                
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pincodes</p>
                    <div className="flex flex-wrap gap-1">
                        {city.pincodes.slice(0, 5).map(pin => (
                            <span key={pin} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-mono">
                                {pin}
                            </span>
                        ))}
                        {city.pincodes.length > 5 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">+{city.pincodes.length - 5} more</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${city.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-600">{city.isActive ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
