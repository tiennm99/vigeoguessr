'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function ResultModal({ 
  isOpen, 
  distance, 
  trueLocation, 
  guessLocation, 
  onNextRound 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const initResultMap = () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Clear previous markers
        markersRef.current = [];

        const [trueLat, trueLng] = trueLocation;
        const [guessLat, guessLng] = guessLocation;

        // Create MapLibre map
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
          center: [trueLng, trueLat],
          zoom: 12
        });

        mapInstanceRef.current.on('load', () => {
          // Add true location marker (green)
          mapInstanceRef.current.addSource('true-location', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [trueLng, trueLat]
              }
            }
          });

          mapInstanceRef.current.addLayer({
            id: 'true-location-marker',
            type: 'circle',
            source: 'true-location',
            paint: {
              'circle-radius': 12,
              'circle-color': '#00ff00',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 3
            }
          });

          // Add guess location marker (red)
          mapInstanceRef.current.addSource('guess-location', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [guessLng, guessLat]
              }
            }
          });

          mapInstanceRef.current.addLayer({
            id: 'guess-location-marker',
            type: 'circle',
            source: 'guess-location',
            paint: {
              'circle-radius': 12,
              'circle-color': '#ff0000',
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 3
            }
          });

          // Add line between markers
          mapInstanceRef.current.addSource('connection-line', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [[trueLng, trueLat], [guessLng, guessLat]]
              }
            }
          });

          mapInstanceRef.current.addLayer({
            id: 'connection-line-layer',
            type: 'line',
            source: 'connection-line',
            paint: {
              'line-color': '#0066ff',
              'line-width': 3,
              'line-opacity': 0.8
            }
          });

          // Fit map to show both markers
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend([trueLng, trueLat]);
          bounds.extend([guessLng, guessLat]);
          
          mapInstanceRef.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        });

      } catch (error) {
        console.error('Error initializing result map:', error);
      }
    };

    const timer = setTimeout(initResultMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [isOpen, trueLocation, guessLocation]);

  if (!isOpen) return null;

  const formatDistance = (dist) => {
    if (dist > 1000) {
      return `${(dist / 1000).toFixed(2)} KM`;
    }
    return `${dist} M`;
  };

  const getResultMessage = (dist) => {
    if (dist > 1000) {
      return "Hmm! Nice try.";
    } else if (dist > 200) {
      return "Good job!";
    }
    return "Excellent!";
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <div className="score-text">RESULT</div>
        <span className="distance-text">{formatDistance(distance)}</span>
        <div className="container" ref={mapRef} style={{ height: '300px' }}></div>
        <p>{getResultMessage(distance)}</p>
        <button onClick={onNextRound} className="next-btn">
          <div className="next-text">NEXT ROUND</div>
        </button>
      </div>
    </div>
  );
}