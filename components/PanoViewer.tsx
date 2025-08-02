'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageData } from '@/types/game';

interface PanoViewerProps {
  imageData: ImageData | null;
  isLoading: boolean;
}

declare global {
  interface Window {
    PhotoSphereViewer: any;
  }
}

export default function PanoViewer({ imageData, isLoading }: PanoViewerProps) {
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!panoRef.current || !imageData) return;

    const initViewer = () => {
      if (!window.PhotoSphereViewer?.Viewer) {
        setTimeout(initViewer, 100);
        return;
      }

      try {
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }

        viewerRef.current = new window.PhotoSphereViewer.Viewer({
          container: panoRef.current,
          panorama: imageData.url,
          loadingImg: null,
          defaultYaw: 0,
          defaultZoomLvl: -60,
          navbar: ['zoom', 'fullscreen'],
          mousewheel: true,
          touchmoveTwoFingers: true
        });

        viewerRef.current.addEventListener('ready', () => {
          console.log('Photo Sphere Viewer loaded successfully');
        });

        viewerRef.current.addEventListener('panorama-loaded', () => {
          console.log('Panorama image loaded');
        });

        viewerRef.current.addEventListener('panorama-error', (error: any) => {
          console.error('Error loading panorama:', error);
          // Fallback to regular image
          if (panoRef.current) {
            panoRef.current.innerHTML = `
              <img src="${imageData.url}" 
                   style="width:100%; height:100%; object-fit:cover; border-radius:10px;" 
                   alt="Street view" />
            `;
          }
        });
      } catch (error) {
        console.error('Error initializing Photo Sphere Viewer:', error);
        // Fallback to regular image
        if (panoRef.current) {
          panoRef.current.innerHTML = `
            <img src="${imageData.url}" 
                 style="width:100%; height:100%; object-fit:cover; border-radius:10px;" 
                 alt="Street view" />
          `;
        }
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageData]);

  if (isLoading) {
    return (
      <div className="pano" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <div style={{ color: '#666', fontSize: '16px' }}>Loading image...</div>
        </div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="pano" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️ Error loading image</div>
          <div style={{ fontSize: '14px' }}>Please try again</div>
        </div>
      </div>
    );
  }

  return <div ref={panoRef} className="pano" style={{ minHeight: '400px' }} />;
}