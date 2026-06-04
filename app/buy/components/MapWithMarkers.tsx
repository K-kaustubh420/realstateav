// app/buy/components/MapWithMarkers.tsx
// @ts-nocheck
'use client';

import React, { useEffect, JSX, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import { Property } from '@/lib/properties/property.types';
import 'leaflet/dist/leaflet.css';

interface MapWithMarkersProps {
  properties: Property[];
}

function formatPrice(price: number) {
  if (!price) return '';
  if (price >= 1000000) return '$' + (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (price >= 1000) return '$' + (price / 1000).toFixed(0) + 'k';
  return '$' + price.toLocaleString();
}

const createPriceIcon = (price: number) => {
  return L.divIcon({
    className: 'custom-price-marker bg-transparent border-none',
    html: `
      <div style="
        background-color: #d97706; /* amber-600 */
        color: white;
        font-weight: bold;
        font-size: 14px;
        padding: 4px 10px;
        border-radius: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
      ">
        ${formatPrice(price)}
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #d97706;
        "></div>
      </div>
    `,
    iconSize: undefined, // Let it adapt to content
    iconAnchor: [35, 34], // Approximate anchor to point to bottom tip
  });
};

// Component to recenter map based on markers
function MapUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    // Filter out properties with default (0,0) coordinates if any
    const validProps = properties.filter(p => p.coordinates?.lat !== 0 && p.coordinates?.lng !== 0);
    if (validProps.length > 0) {
      const bounds = L.latLngBounds(validProps.map(p => [p.coordinates.lat, p.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [properties, map]);
  return null;
}

export default function MapWithMarkers({ properties }: MapWithMarkersProps): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [mappedProperties, setMappedProperties] = useState<Property[]>(properties);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Start with the provided properties
    setMappedProperties(properties);
    let isMounted = true;

    const geocodeProperties = async () => {
      const updated = [...properties];
      let hasChanges = false;

      for (let i = 0; i < updated.length; i++) {
        const prop = updated[i];
        
        // Build geocoding query
        let query = '';
        if (prop.pincode) {
          query = `${prop.pincode}, ${prop.city || ''}, ${prop.state || ''}`;
        } else if (prop.addressLine1 || prop.city || prop.state) {
          query = `${prop.addressLine1 || ''}, ${prop.city || ''}, ${prop.state || ''}`;
        } else {
          query = prop.location || '';
        }
        
        if (!query.trim()) continue;

        try {
          // Nominatim usage policy requires 1 req/sec limit and a valid User-Agent if possible, 
          // but from browser we just fetch directly.
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          const data = await res.json();
          
          if (data && data.length > 0 && isMounted) {
            const newLat = parseFloat(data[0].lat);
            const newLng = parseFloat(data[0].lon);
            
            // If the coordinates differ significantly from DB, update our local array
            if (prop.coordinates?.lat !== newLat || prop.coordinates?.lng !== newLng) {
              updated[i] = {
                ...prop,
                coordinates: { lat: newLat, lng: newLng }
              };
              hasChanges = true;
              
              // Incrementally update the map so user sees pins appear/move
              setMappedProperties([...updated]);
            }
          }
          // Sleep for 1 second to respect Nominatim limits
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error("Geocoding failed for", query, err);
        }
      }
    };

    geocodeProperties();

    return () => { isMounted = false; };
  }, [properties]);

  if (!mounted) return <div className="w-full h-full bg-zinc-900 animate-pulse rounded-xl"></div>;

  // Use the geocoded properties for rendering
  const validProps = mappedProperties.filter(p => p.coordinates?.lat !== 0 && p.coordinates?.lng !== 0);
  const defaultCenter: [number, number] = validProps.length > 0
    ? [validProps[0].coordinates.lat, validProps[0].coordinates.lng]
    : [28.6139, 77.2090]; // Default Delhi coordinates

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-full overflow-hidden relative z-0 shadow-sm border-l border-gray-200">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater properties={mappedProperties} />
        {mappedProperties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.coordinates.lat || 0, prop.coordinates.lng || 0]}
            icon={createPriceIcon(prop.expectedPrice)}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="w-56 bg-white rounded-xl overflow-hidden border border-gray-200 text-gray-800 shadow-xl p-0 m-0">
                <div className="relative w-full h-32 bg-gray-100">
                  {prop.images && prop.images.length > 0 ? (
                    <Image
                      src={prop.images[0]}
                      alt={prop.title || 'Property'}
                      fill
                      sizes="200px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏢</div>
                  )}
                  <span className="absolute top-2 left-2 bg-white text-gray-900 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                    ${prop.expectedPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 space-y-2 bg-white">
                  <h4 className="font-bold text-sm line-clamp-1 text-gray-900 leading-tight">{prop.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">
                    {prop.addressLine1}, {prop.city}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-600 border-t border-gray-100 pt-2 font-medium">
                    {prop.bedrooms && <span>🛏️ {prop.bedrooms}</span>}
                    {prop.bathrooms && <span>🛁 {prop.bathrooms}</span>}
                    {prop.carpetArea && <span>📐 {prop.carpetArea}</span>}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
