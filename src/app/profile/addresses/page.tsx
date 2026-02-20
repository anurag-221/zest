'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, Address } from '@/store/auth-store';
import Header from '@/components/Header';
import { Plus, MapPin, Trash2, Home, Briefcase, Map, Navigation, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddressesPage() {
  const { user, addAddress, removeAddress } = useAuthStore();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  
  // New Address State
  const [newAddr, setNewAddr] = useState<Partial<Address>>({ type: 'Home' });
  const [isDetecting, setIsDetecting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
        router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  const handleDetectLocation = () => {
      if (!navigator.geolocation) {
          toast.error('Geolocation is not supported by your browser');
          return;
      }

      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
          async (position) => {
              try {
                  const { latitude, longitude } = position.coords;
                  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                  
                  if (!response.ok) throw new Error('Failed to fetch address');
                  
                  const data = await response.json();
                  
                  if (data && data.address) {
                      const address = data.address;
                      
                      const line1Arr = [address.house_number, address.building, address.road].filter(Boolean);
                      const line1 = line1Arr.length > 0 ? line1Arr.join(', ') : address.propertyName || '';
                      
                      const line2Arr = [address.neighbourhood, address.suburb, address.village, address.county, address.district].filter(Boolean);
                      const line2 = line2Arr.length > 0 ? line2Arr.join(', ') : '';
                      
                      const city = address.city || address.town || address.state_district || address.state || '';
                      const zip = address.postcode || '';

                      setNewAddr(prev => ({
                          ...prev,
                          line1: line1 || (data.display_name ? data.display_name.split(',')[0] : ''),
                          line2: line2 || (data.display_name ? data.display_name.split(',').slice(1,3).join(',').trim() : ''),
                          city,
                          zip
                      }));
                      toast.success('Location auto-filled successfully!');
                  } else {
                      toast.error('Could not resolve location address');
                  }
              } catch (error) {
                  console.error("Location detection error:", error);
                  toast.error('Failed to detect location address');
              } finally {
                  setIsDetecting(false);
              }
          },
          (error) => {
              console.error("Geolocation error:", error);
              toast.error('Failed to get your location. Please check permissions.');
              setIsDetecting(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newAddr.line1 || !newAddr.city || !newAddr.zip) {
          toast.error('Please fill all required fields');
          return;
      }

      addAddress({
          id: Math.random().toString(36).substring(7),
          type: newAddr.type as any || 'Home',
          line1: newAddr.line1,
          line2: newAddr.line2 || '',
          city: newAddr.city,
          zip: newAddr.zip
      });

      toast.success('Address added successfully');
      setShowForm(false);
      setNewAddr({ type: 'Home' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Addresses</h1>
            <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
                <Plus size={18} /> Add New
            </button>
        </div>

        {/* Address List */}
        <div className="space-y-4">
            {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr) => (
                    <div key={addr.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-start group relative overflow-hidden">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                {addr.type === 'Home' && <Home size={18} />}
                                {addr.type === 'Work' && <Briefcase size={18} />}
                                {addr.type === 'Other' && <MapPin size={18} />}
                            </div>
                            <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mb-1 inline-block">
                                    {addr.type}
                                </span>
                                <h3 className="font-bold text-gray-900 dark:text-white">{addr.line1}</h3>
                                <p className="text-sm text-gray-500">{addr.line2}</p>
                                <p className="text-sm text-gray-500 font-medium mt-1">{addr.city}, {addr.zip}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeAddress(addr.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No addresses saved yet.</p>
                </div>
            )}
        </div>

        {/* Add Address Modal */}
        {showForm && (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in pb-24 md:pb-4">
                <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Address</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {['Home', 'Work', 'Other'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setNewAddr({ ...newAddr, type: type as any })}
                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${newAddr.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isDetecting}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isDetecting ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} className="text-indigo-600 dark:text-indigo-400" />}
                            {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
                        </button>

                        <input 
                            placeholder="Flat / House No / Building" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newAddr.line1 || ''}
                            onChange={e => setNewAddr({ ...newAddr, line1: e.target.value })}
                            required
                        />
                         <input 
                            placeholder="Area / Sector / Locality" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newAddr.line2 || ''}
                            onChange={e => setNewAddr({ ...newAddr, line2: e.target.value })}
                        />
                        <div className="flex gap-4">
                             <input 
                                placeholder="City" 
                                className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newAddr.city || ''}
                                onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                                required
                            />
                             <input 
                                placeholder="Pincode" 
                                className="w-32 p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newAddr.zip || ''}
                                onChange={e => setNewAddr({ ...newAddr, zip: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            >
                                Save Address
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
