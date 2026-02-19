'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3514/3514491.png', // Shop Icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png', // User Home
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', // Scooter
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

export default function TrackingMap({ status }: { status: string }) {
    const [riderPos, setRiderPos] = useState<[number, number]>([19.0760, 72.8777]); // Store Pos
    const storePos: [number, number] = [19.0760, 72.8777]; // Mumbai Center
    const userPos: [number, number] = [19.0860, 72.8877]; // Slightly away

    useEffect(() => {
        if (status === 'Out for Delivery' || status === 'Shipped') {
            const interval = setInterval(() => {
                setRiderPos(prev => {
                    const latDiff = (userPos[0] - prev[0]) * 0.05;
                    const lngDiff = (userPos[1] - prev[1]) * 0.05;
                    
                    if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
                        return userPos;
                    }
                    return [prev[0] + latDiff, prev[1] + lngDiff];
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0">
            <MapContainer center={[19.0800, 72.8827]} zoom={14} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={storePos} icon={storeIcon}>
                    <Popup>Zepto Store</Popup>
                </Marker>
                <Marker position={userPos} icon={userIcon}>
                    <Popup>Your Location</Popup>
                </Marker>
                
                {/* Rider */}
                {(status === 'Out for Delivery' || status === 'Shipped') && (
                     <Marker position={riderPos} icon={riderIcon} zIndexOffset={100}>
                         <Popup>Rider is here</Popup>
                    </Marker>
                )}

                <Polyline positions={[storePos, userPos]} pathOptions={{ color: 'blue', dashArray: '5, 10' }} />
            </MapContainer>
        </div>
    );
}
