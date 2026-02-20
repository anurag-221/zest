'use client';

import { useState } from 'react';
import { X, MapPin, Plus, Home, Briefcase, ChevronRight, Navigation, Loader2 } from 'lucide-react';
import { useAuthStore, Address } from '@/store/auth-store';
import { toast } from 'sonner';

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (addressId: string) => void;
}

export default function AddressSelectionModal({ isOpen, onClose, onSelect }: AddressSelectionModalProps) {
  const { user, addAddress } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState<Partial<Address>>({ type: 'Home' });
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

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

      const newId = Math.random().toString(36).substring(7);
      
      addAddress({
          id: newId,
          type: newAddr.type as any || 'Home',
          line1: newAddr.line1,
          line2: newAddr.line2 || '',
          city: newAddr.city,
          zip: newAddr.zip
      });

      toast.success('Address added and selected!');
      setShowAddForm(false);
      setNewAddr({ type: 'Home' });
      onSelect(newId); // auto select new address
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {showAddForm ? 'Add New Address' : 'Select Delivery Address'}
            </h2>
            <button 
                onClick={showAddForm ? () => setShowAddForm(false) : onClose} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
                <X size={20} className="text-gray-500" />
            </button>
        </div>

        {/* Scrollable Content Range */}
        <div className="overflow-y-auto p-4 flex-1">
            {!showAddForm ? (
                <div className="space-y-4">
                    {user?.addresses && user.addresses.length > 0 ? (
                        user.addresses.map((addr) => (
                            <div 
                                key={addr.id} 
                                onClick={() => onSelect(addr.id)}
                                className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border-2 border-transparent hover:border-indigo-600 cursor-pointer flex justify-between items-center group transition-all"
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                        {addr.type === 'Home' && <Home size={18} />}
                                        {addr.type === 'Work' && <Briefcase size={18} />}
                                        {addr.type === 'Other' && <MapPin size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white">{addr.type}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{addr.line1}</p>
                                        <p className="text-xs text-gray-500 mt-1">{addr.line2}</p>
                                        <p className="text-xs text-gray-500">{addr.city}, {addr.zip}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <MapPin size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No saved addresses found.</p>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                        <Plus size={20} /> Add New Address
                    </button>
                </div>
            ) : (
                /* Inline Add Form */
                <form onSubmit={handleAdd} className="space-y-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {['Home', 'Work', 'Other'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setNewAddr({ ...newAddr, type: type as any })}
                                className={`py-2 rounded-lg text-sm font-bold border transition-all ${newAddr.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                        className="w-full flex items-center justify-center gap-2 py-3 mb-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDetecting ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} className="text-indigo-600 dark:text-indigo-400" />}
                        {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
                    </button>

                    <div className="space-y-3">
                        <input 
                            placeholder="Flat / House No / Building" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            value={newAddr.line1 || ''}
                            onChange={e => setNewAddr({ ...newAddr, line1: e.target.value })}
                            required
                        />
                         <input 
                            placeholder="Area / Sector / Locality" 
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            value={newAddr.line2 || ''}
                            onChange={e => setNewAddr({ ...newAddr, line2: e.target.value })}
                        />
                        <div className="flex gap-4">
                             <input 
                                placeholder="City" 
                                className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                value={newAddr.city || ''}
                                onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                                required
                            />
                             <input 
                                placeholder="Pincode" 
                                className="w-32 p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                value={newAddr.zip || ''}
                                onChange={e => setNewAddr({ ...newAddr, zip: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full mt-4 py-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        Save & Use Address
                    </button>
                </form>
            )}
        </div>

      </div>
    </div>
  );
}
