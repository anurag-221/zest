'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect, initialHasLocation }: { onLocationSelect: (lat: number, lng: number) => void, initialHasLocation: boolean }) {
  const [position, setPosition] = useState<L.LatLng | null>(initialHasLocation ? null : null);
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (initialHasLocation) {
        // center map if needed
    }
  }, [initialHasLocation]);

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

export default function Map({ onLocationSelect, initialLat = 18.5204, initialLng = 73.8567 }: MapProps) {
  // Default to Pune if no location
  return (
    <MapContainer center={[initialLat, initialLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} initialHasLocation={!!initialLat} />
      {/* Initial marker if provided */}
      <Marker position={[initialLat, initialLng]} icon={icon} />
    </MapContainer>
  );
}
