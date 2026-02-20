'use client';

import { useEffect, useState } from 'react';
import { useLocationStore } from '@/store/location-store';
import { CityService } from '@/services/city-service';
import { City } from '@/types';
import { MapPin, Search, X, Crosshair, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LocationGuard({ children }: { children: React.ReactNode }) {
  const { selectedCity, setCity, clearCity } = useLocationStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [mounted, setMounted] = useState(false);
  const [detecting, setDetecting] = useState(false);

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

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => { // Async for API call
            const { latitude, longitude } = position.coords;
            const nearestCity = CityService.getNearestCity(latitude, longitude);

            if (nearestCity) {
                if (nearestCity.isActive) {
                     // Reverse Geocoding for Granular Area
                     try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`);
                        if (response.ok) {
                            const data = await response.json();
                            const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.village || nearestCity.name;
                            
                            // Specific User Requirement: "Tilak Nagar, New Delhi"
                            const granularName = area === nearestCity.name ? nearestCity.name : `${area}, ${nearestCity.name}`;
                            
                            toast.success(`Location detected: ${granularName}`);
                            
                            // We need to store this granular name in the store, 
                            // but our City type is rigid. 
                            // Ideally, we update the store to accept a "displayName" override.
                            // For now, let's create a transient city object.
                            handleSelectCity({
                                ...nearestCity,
                                displayName: granularName 
                            });
                        } else {
                             // Fallback
                             toast.success(`Location detected: ${nearestCity.name}`);
                             handleSelectCity(nearestCity);
                        }
                     } catch (e) {
                         console.error("Reverse geocoding failed", e);
                         toast.success(`Location detected: ${nearestCity.name}`);
                         handleSelectCity(nearestCity);
                     }
                } else {
                    toast.error(`We are currently not operational in ${nearestCity.name}`);
                }
            } else {
                toast.error('We do not deliver to your detected location yet.');
            }
            setDetecting(false);
        },
        (error) => {
            setDetecting(false);
            if (error.code === error.PERMISSION_DENIED) {
                toast.error('Location permission denied. Please select manually.');
            } else {
                toast.error('Failed to detect location.');
            }
        }
    );
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
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={handleDetectLocation}
                        disabled={detecting}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 py-3 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50"
                    >
                        {detecting ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} />}
                        {detecting ? 'Detecting...' : 'Detect my location'}
                    </button>
                </div>

              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 top-[60px]"> {/* Adjusted top for search icon */}
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
                          <p className="font-semibold text-gray-900 dark:text-white">{city.displayName || city.name}</p>
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
