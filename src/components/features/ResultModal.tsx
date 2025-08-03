'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Viewer } from 'mapillary-js';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapillary-js/dist/mapillary.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Trophy, MapPin, Target } from 'lucide-react';

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
      return `${(dist / 1000).toFixed(2)} km`;
    }
    return `${Math.round(dist)} m`;
  };

  const getResultMessage = (dist: number, pts: number): string => {
    if (pts >= 5) return "Perfect! 🎯";
    if (pts >= 4) return "Excellent! 🎉";
    if (pts >= 3) return "Great job! 👍";
    if (pts >= 2) return "Good guess! 👌";
    if (pts >= 1) return "Nice try! 🎯";
    return "Keep practicing! 💪";
  };

  const getScoreColor = (pts: number): string => {
    if (pts >= 5) return "bg-green-500";
    if (pts >= 4) return "bg-blue-500";
    if (pts >= 3) return "bg-yellow-500";
    if (pts >= 2) return "bg-orange-500";
    if (pts >= 1) return "bg-red-400";
    return "bg-gray-500";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Game Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Distance</div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {formatDistance(distance)}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Score</div>
                  <Badge className={`text-lg px-4 py-2 text-white ${getScoreColor(points)}`}>
                    <Target className="h-4 w-4 mr-2" />
                    {points} POINTS
                  </Badge>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Badge variant="secondary" className="text-lg px-6 py-2">
                  {getResultMessage(distance, points)}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Maps Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80">
            <Card className="overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Result Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div ref={mapRef} className="h-full w-full" />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Explore Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div ref={panoRef} className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
          
          {/* Instructions */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-muted-foreground">
                You can now explore around the actual location using the street view! Use your mouse to look around and navigate.
              </p>
            </CardContent>
          </Card>
          
          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={onNextRound}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold hover:scale-105"
            >
              Next Round
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}