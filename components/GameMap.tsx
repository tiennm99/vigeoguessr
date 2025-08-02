'use client';

import { useEffect, useRef } from 'react';
import { boundingBoxVN, LocationKey } from '@/lib/gameUtils';

interface GameMapProps {
  choiceLocation: LocationKey;
  onLocationSelect: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function GameMap({ choiceLocation, onLocationSelect }: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.L) {
        setTimeout(initMap, 100);
        return;
      }

      const [minLong, minLat, maxLong, maxLat] = boundingBoxVN[choiceLocation];
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLong + maxLong) / 2;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      mapInstanceRef.current = window.L.map(mapRef.current).setView([centerLat, centerLng], 10);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on('click', (event: any) => {
        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Add new marker
        const marker = window.L.marker(event.latlng).addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
        
        onLocationSelect(event.latlng.lat, event.latlng.lng);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [choiceLocation, onLocationSelect]);

  return <div ref={mapRef} className="disclaimer" style={{ height: '300px', width: '100%' }} />;
}