'use client';

import { useEffect, useState } from 'react';
import { useLocationStore } from '@/store/location-store';
import { CityService } from '@/services/city-service';
import { City } from '@/types';
import { MapPin, Search, X } from 'lucide-react';

export default function LocationGuard({ children }: { children: React.ReactNode }) {
  const { selectedCity, setCity, clearCity } = useLocationStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!selectedCity) {
        setShowModal(true);
      } else {
        // Validate if selected city is still active
        const activeCities = CityService.getAllCities();
        const isValid = activeCities.find(c => c.id === selectedCity.id);
        
        if (!isValid) {
            // City became inactive or invalid
            clearCity();
            setShowModal(true);
        } else {
            setShowModal(false);
        }
      }
    }
  }, [selectedCity, mounted, setCity]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setResults(CityService.searchCities(searchQuery));
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const handleSelectCity = (city: City) => {
    setCity(city);
    setShowModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      {children}
      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-transparent dark:border-gray-800">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <MapPin size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select your Location</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                We need your location to show available products and accurate delivery times.
              </p>
            </div>

            <div className="relative mb-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by City or Pincode..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {results.length > 0 ? (
                <ul className="space-y-2">
                  {results.map((city) => (
                    <li key={city.id}>
                      <button
                        onClick={() => handleSelectCity(city)}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{city.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Pincodes: {city.pincodes.join(', ')}</p>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">Select</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  {searchQuery.length > 1 ? (
                    <p className="text-gray-500 dark:text-gray-400">No cities found.</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Popular Cities</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {CityService.getAllCities().slice(0, 3).map(city => (
                           <button
                           key={city.id}
                           onClick={() => handleSelectCity(city)}
                           className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
                         >
                           {city.name}
                         </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!selectedCity && (
                <div className="mt-6 border-t pt-4 text-center">
                    <p className="text-xs text-red-500">You must select a location to proceed.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
