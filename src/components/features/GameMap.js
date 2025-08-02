'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { boundingBoxVN } from '@/constants/locations';

export default function GameMap({ choiceLocation, onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const onLocationSelectRef = useRef(onLocationSelect);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update the ref when the callback changes
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || isInitialized) return;

    const initMap = () => {
      if (!window.L || !window.L.map) {
        console.log('Leaflet not loaded yet, retrying...');
        setTimeout(initMap, 200);
        return;
      }

      try {
        const [minLong, minLat, maxLong, maxLat] = boundingBoxVN[choiceLocation];
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLong + maxLong) / 2;

        console.log('Initializing map for location:', choiceLocation);
        
        // Create new map
        mapInstanceRef.current = window.L.map(mapRef.current, {
          center: [centerLat, centerLng],
          zoom: 10,
          zoomControl: true,
          attributionControl: true
        });
        
        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Add click event listener
        mapInstanceRef.current.on('click', (event) => {
          console.log('Map clicked at:', event.latlng);
          
          // Clear existing markers
          markersRef.current.forEach(marker => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.removeLayer(marker);
            }
          });
          markersRef.current = [];

          // Add new marker
          const marker = window.L.marker(event.latlng).addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
          
          // Call the callback using the ref
          if (onLocationSelectRef.current) {
            onLocationSelectRef.current(event.latlng.lat, event.latlng.lng);
          }
        });

        // Force map to update its size
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            setIsMapReady(true);
            setIsInitialized(true);
            console.log('Map initialized successfully');
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
        setTimeout(initMap, 500);
      }
    };

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  // Update map center when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isInitialized) return;

    const [minLong, minLat, maxLong, maxLat] = boundingBoxVN[choiceLocation];
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLong + maxLong) / 2;

    console.log('Updating map center for location:', choiceLocation);
    mapInstanceRef.current.setView([centerLat, centerLng], 10);

    // Clear existing markers when location changes
    markersRef.current.forEach(marker => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  }, [choiceLocation, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      setIsMapReady(false);
      setIsInitialized(false);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        className="disclaimer" 
        style={{ 
          height: '300px', 
          width: '100%',
          cursor: 'crosshair'
        }} 
      />
      {!isMapReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontSize: '14px'
        }}>
          Loading map...
        </div>
      )}
    </div>
  );
}