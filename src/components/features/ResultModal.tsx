'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Viewer } from 'mapillary-js';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapillary-js/dist/mapillary.css';

interface ImageData {
  id: string;
  url: string;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

interface ResultModalProps {
  isOpen: boolean;
  distance: number;
  points: number;
  trueLocation: [number, number];
  guessLocation: [number, number];
  imageData: ImageData | null;
  onNextRound: () => void;
}

export default function ResultModal({ 
  isOpen, 
  distance, 
  points,
  trueLocation, 
  guessLocation, 
  imageData,
  onNextRound 
}: ResultModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersRef = useRef<string[]>([]);

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
          container: mapRef.current!,
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
          if (!mapInstanceRef.current) return;

          // Add true location marker (green)
          mapInstanceRef.current.addSource('true-location', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [trueLng, trueLat]
              },
              properties: {}
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
              },
              properties: {}
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
              },
              properties: {}
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

  // Initialize MapillaryJS viewer in result phase with navigation enabled
  useEffect(() => {
    if (!isOpen || !panoRef.current || !imageData) return;

    const initResultViewer = async () => {
      try {
        if (viewerRef.current) {
          viewerRef.current.remove();
        }

        viewerRef.current = new Viewer({
          accessToken: process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || 'MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65',
          container: panoRef.current!,
          imageId: imageData.id,
          component: {
            attribution: false,
            bearing: true,
            cache: false,
            cover: false,
            direction: true,
            image: true,
            keyboard: true,
            loading: true,
            marker: false,
            mouse: true,
            pointer: true,
            popup: false,
            sequence: true,
            spatial: false,
            tag: false,
            zoom: true
          }
        });

        viewerRef.current.on('image', (image) => {
          console.log('Result phase MapillaryJS loaded with navigation:', image.id);
        });

      } catch (error) {
        console.error('Error initializing result MapillaryJS viewer:', error);
      }
    };

    const timer = setTimeout(initResultViewer, 200);

    return () => {
      clearTimeout(timer);
      if (viewerRef.current) {
        viewerRef.current.remove();
        viewerRef.current = null;
      }
    };
  }, [isOpen, imageData]);

  if (!isOpen) return null;

  const formatDistance = (dist: number): string => {
    if (dist > 1000) {
      return `${(dist / 1000).toFixed(2)} KM`;
    }
    return `${dist} M`;
  };

  const getResultMessage = (dist: number, pts: number): string => {
    if (pts >= 5) return "Perfect! 🎯";
    if (pts >= 4) return "Excellent! 🎉";
    if (pts >= 3) return "Great job! 👍";
    if (pts >= 2) return "Good guess! 👌";
    if (pts >= 1) return "Nice try! 🎯";
    return "Keep practicing! 💪";
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content" style={{ maxWidth: '90vw', width: '800px' }}>
        <div className="score-text">RESULT</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
          <span className="distance-text">{formatDistance(distance)}</span>
          <div style={{ 
            background: '#05A38C', 
            padding: '8px 16px', 
            borderRadius: '8px',
            fontFamily: 'Jersey 15, cursive',
            fontSize: '24px',
            color: 'white'
          }}>
            {points} POINTS
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', height: '300px', marginBottom: '15px' }}>
          <div ref={mapRef} style={{ flex: 1, minHeight: '300px' }}></div>
          <div ref={panoRef} style={{ flex: 1, minHeight: '300px', borderRadius: '8px' }}></div>
        </div>
        
        <p style={{ marginBottom: '15px' }}>{getResultMessage(distance, points)}</p>
        <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '15px' }}>
          You can now explore around the actual location using the street view!
        </p>
        
        <button onClick={onNextRound} className="next-btn">
          <div className="next-text">NEXT ROUND</div>
        </button>
      </div>
    </div>
  );
}