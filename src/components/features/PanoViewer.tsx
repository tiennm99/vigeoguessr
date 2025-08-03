'use client';

import { useEffect, useRef } from 'react';
import { Viewer } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';

interface ImageData {
  id: string;
  url: string;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

interface PanoViewerProps {
  imageData: ImageData | null;
  isLoading: boolean;
  onPreciseLocationLoad?: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    mapillaryViewer?: Viewer;
  }
}

export default function PanoViewer({ imageData, isLoading, onPreciseLocationLoad }: PanoViewerProps) {
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const currentImageIdRef = useRef<string | null>(null);
  const isInitializingRef = useRef(false);

  // Clean up viewer on unmount only
  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        try {
          // Only remove if navigable to avoid the error
          if (viewerRef.current.isNavigable) {
            viewerRef.current.remove();
          } else {
            // If not navigable, just clear the reference
            console.log('Viewer not navigable during cleanup, skipping remove()');
          }
        } catch (error) {
          // Ignore cleanup errors on unmount
        }
        viewerRef.current = null;
      }
    };
  }, []);

  // Handle image changes
  useEffect(() => {
    if (!panoRef.current || !imageData || isLoading) return;
    
    // Skip if same image
    if (currentImageIdRef.current === imageData.id) return;
    
    // Skip if already initializing
    if (isInitializingRef.current) return;

    const initOrUpdateViewer = async () => {
      isInitializingRef.current = true;
      currentImageIdRef.current = imageData.id;

      try {
        // If viewer exists, try to navigate to new image instead of recreating
        if (viewerRef.current) {
          try {
            // Check if viewer is navigable before attempting moveTo
            if (viewerRef.current.isNavigable) {
              await viewerRef.current.moveTo(imageData.id);
              isInitializingRef.current = false;
              return;
            } else {
              console.log('Viewer is not navigable, will recreate');
              // Wait for navigation to be possible or recreate
              const checkNavigable = () => {
                if (viewerRef.current && viewerRef.current.isNavigable) {
                  viewerRef.current.moveTo(imageData.id).then(() => {
                    isInitializingRef.current = false;
                  }).catch(() => {
                    // If moveTo fails, recreate viewer
                    if (viewerRef.current) {
                      viewerRef.current.remove();
                      viewerRef.current = null;
                      initOrUpdateViewer(); // Recreate
                    }
                  });
                } else {
                  // Viewer still not navigable, recreate immediately
                  if (viewerRef.current) {
                    viewerRef.current.remove();
                    viewerRef.current = null;
                  }
                  // Continue with new viewer creation below
                }
              };
              
              // Give it a brief moment to become navigable
              setTimeout(checkNavigable, 100);
              return;
            }
          } catch (error) {
            console.log('Navigation failed, will recreate viewer:', error instanceof Error ? error.message : 'Unknown error');
            // Only remove if viewer is navigable or wait for it to be
            if (viewerRef.current && viewerRef.current.isNavigable) {
              viewerRef.current.remove();
              viewerRef.current = null;
            } else {
              console.log('Cannot remove non-navigable viewer, will replace');
              viewerRef.current = null;
            }
          }
        }

        // Create new viewer
        const newViewer = new Viewer({
          accessToken: process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || 'MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65',
          container: panoRef.current!,
          imageId: imageData.id,
          component: {
            attribution: false,
            bearing: false,
            cache: false,
            cover: false,
            direction: false,
            image: true,
            keyboard: false,
            loading: true,
            marker: false,
            mouse: true,
            pointer: false,
            popup: false,
            sequence: false,
            spatial: false,
            tag: false,
            zoom: true
          }
        });

        viewerRef.current = newViewer;

        newViewer.on('image', async (image) => {
          console.log('MapillaryJS image loaded successfully:', image.id);
          
          try {
            // Get precise position from MapillaryJS
            const precisePosition = await newViewer.getPosition();
            console.log('Precise MapillaryJS coordinates:', precisePosition);
            
            // Notify parent component of precise coordinates
            if (onPreciseLocationLoad) {
              onPreciseLocationLoad(precisePosition.lat, precisePosition.lng);
            }
          } catch (error) {
            console.warn('Could not get precise position from MapillaryJS:', error);
            // Fall back to original coordinates if precise coordinates fail
            if (onPreciseLocationLoad) {
              onPreciseLocationLoad(imageData.lat, imageData.lng);
            }
          }
        });

        newViewer.on('error', (error) => {
          console.error('Error loading MapillaryJS image:', error);
          // Fallback to regular image
          if (panoRef.current) {
            panoRef.current.innerHTML = `
              <img src="${imageData.url}" 
                   style="width:100%; height:100%; object-fit:cover; border-radius:10px;" 
                   alt="Street view" />
            `;
          }
          // Use original coordinates if MapillaryJS fails
          if (onPreciseLocationLoad) {
            onPreciseLocationLoad(imageData.lat, imageData.lng);
          }
        });

      } catch (error) {
        console.error('Error initializing MapillaryJS:', error);
        // Fallback to regular image
        if (panoRef.current) {
          panoRef.current.innerHTML = `
            <img src="${imageData.url}" 
                 style="width:100%; height:100%; object-fit:cover; border-radius:10px;" 
                 alt="Street view" />
          `;
        }
        // Use original coordinates if MapillaryJS initialization fails
        if (onPreciseLocationLoad) {
          onPreciseLocationLoad(imageData.lat, imageData.lng);
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    initOrUpdateViewer();
  }, [imageData, onPreciseLocationLoad, isLoading]);

  // Expose viewer instance for potential coordinate synchronization
  useEffect(() => {
    if (viewerRef.current && typeof window !== 'undefined') {
      window.mapillaryViewer = viewerRef.current;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.mapillaryViewer;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="pano flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground font-medium">Loading street view...</div>
          <div className="text-sm text-muted-foreground">Getting the perfect angle for you</div>
        </div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="pano flex items-center justify-center bg-destructive/10 rounded-lg border-2 border-dashed border-destructive/25">
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <div className="text-lg font-semibold text-destructive">Error loading image</div>
          <div className="text-sm text-muted-foreground">Please try again or select a different location</div>
        </div>
      </div>
    );
  }

  return <div ref={panoRef} className="pano" style={{ minHeight: '400px' }} />;
}