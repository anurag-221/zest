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
  center?: [number, number];
}

function MapUpdater({ center }: { center?: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationSelect, initialHasLocation, center }: { onLocationSelect: (lat: number, lng: number) => void, initialHasLocation: boolean, center?: [number, number] }) {
  const [position, setPosition] = useState<L.LatLng | null>(initialHasLocation ? null : null);
  
  useEffect(() => {
    if (center) {
        setPosition(new L.LatLng(center[0], center[1]));
    }
  }, [center]);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

export default function Map({ onLocationSelect, initialLat = 18.5204, initialLng = 73.8567, center }: MapProps) {
  // Default to Pune if no location
  return (
    <MapContainer center={center || [initialLat, initialLng]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <LocationMarker onLocationSelect={onLocationSelect} initialHasLocation={!!initialLat} center={center} />
      {/* Initial marker if provided and no center override */}
      {!center && <Marker position={[initialLat, initialLng]} icon={icon} />}
    </MapContainer>
  );
}
