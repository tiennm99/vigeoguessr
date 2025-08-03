'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LOCATION_BOUNDS } from '@/constants/locations';

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
      try {
        const [minLong, minLat, maxLong, maxLat] = LOCATION_BOUNDS[choiceLocation];
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLong + maxLong) / 2;

        console.log('Initializing MapLibre map for location:', choiceLocation);
        
        // Create new MapLibre map
        mapInstanceRef.current = new maplibregl.Map({
          container: mapRef.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster',
                source: 'osm-tiles'
              }
            ]
          },
          center: [centerLng, centerLat],
          zoom: 9
        });

        // Add click event listener
        mapInstanceRef.current.on('click', (event) => {
          const { lng, lat } = event.lngLat;
          console.log('MapLibre map clicked at:', { lat, lng });
          
          // Clear existing markers
          markersRef.current.forEach(markerId => {
            if (mapInstanceRef.current.getLayer(markerId)) {
              mapInstanceRef.current.removeLayer(markerId);
            }
            if (mapInstanceRef.current.getSource(markerId)) {
              mapInstanceRef.current.removeSource(markerId);
            }
          });
          markersRef.current = [];

          // Add new marker
          const markerId = `marker-${Date.now()}`;
          markersRef.current.push(markerId);
          
          mapInstanceRef.current.addSource(markerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            }
          });

          mapInstanceRef.current.addLayer({
            id: markerId,
            type: 'circle',
            source: markerId,
            paint: {
              'circle-radius': 8,
              'circle-color': '#ff4444',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2
            }
          });
          
          // Call the callback using the ref
          if (onLocationSelectRef.current) {
            onLocationSelectRef.current(lat, lng);
          }
        });

        mapInstanceRef.current.on('load', () => {
          setIsMapReady(true);
          setIsInitialized(true);
          console.log('MapLibre map initialized successfully');
        });

      } catch (error) {
        console.error('Error initializing MapLibre map:', error);
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

    const [minLong, minLat, maxLong, maxLat] = LOCATION_BOUNDS[choiceLocation];
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLong + maxLong) / 2;

    console.log('Updating MapLibre map center for location:', choiceLocation);
    mapInstanceRef.current.flyTo({
      center: [centerLng, centerLat],
      zoom: 9
    });

    // Clear existing markers when location changes
    markersRef.current.forEach(markerId => {
      if (mapInstanceRef.current.getLayer(markerId)) {
        mapInstanceRef.current.removeLayer(markerId);
      }
      if (mapInstanceRef.current.getSource(markerId)) {
        mapInstanceRef.current.removeSource(markerId);
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
          console.warn('Error removing MapLibre map:', e);
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