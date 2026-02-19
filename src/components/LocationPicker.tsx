'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
});

interface LocationPickerProps {
  onConfirm: (address: string) => void;
  onClose: () => void;
}

export const LocationPicker = ({ onConfirm, onClose }: LocationPickerProps) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleConfirm = () => {
    if (coords) {
      // In a real app, call a Reverse Geocoding API here
      // For now, return a mock address based on lat/lng
      const mockAddress = `Selected Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
      onConfirm(mockAddress);
    } else {
        alert("Please tap on the map to select a location");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[600px] animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white z-10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="text-indigo-600" size={20} />
            Select Delivery Location
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gray-50">
           <Map 
             initialLat={18.5204} 
             initialLng={73.8567} 
             onLocationSelect={(lat, lng) => setCoords({ lat, lng })} 
           />
           
           {!coords && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow-md text-xs font-medium text-gray-600 pointer-events-none z-[400]">
               Tap anywhere to pin location
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white space-y-3">
          {coords ? (
             <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <MapPin className="text-indigo-600 mt-0.5" size={18} />
                <div>
                   <p className="font-bold text-gray-900 dark:text-gray-900 text-sm">Pinned Location</p>
                   <p className="text-xs text-indigo-700 mt-0.5">
                      Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                   </p>
                </div>
             </div>
          ) : (
            <p className="text-center text-gray-400 text-sm py-2">No location selected</p>
          )}

          <button 
            disabled={!coords}
            onClick={handleConfirm}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};
