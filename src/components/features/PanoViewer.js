'use client';

import { useEffect, useRef } from 'react';
import { Viewer } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';

export default function PanoViewer({ imageData, isLoading, onPreciseLocationLoad }) {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoRef.current || !imageData) return;

    const initViewer = async () => {
      try {
        if (viewerRef.current) {
          viewerRef.current.remove();
        }

        viewerRef.current = new Viewer({
          accessToken: process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || 'MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65',
          container: panoRef.current,
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

        viewerRef.current.on('image', async (image) => {
          console.log('MapillaryJS image loaded successfully:', image.id);
          
          try {
            // Get precise position from MapillaryJS
            const precisePosition = await viewerRef.current.getPosition();
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

        viewerRef.current.on('error', (error) => {
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
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.remove();
        viewerRef.current = null;
      }
    };
  }, [imageData, onPreciseLocationLoad]);

  // Expose viewer instance for potential coordinate synchronization
  useEffect(() => {
    if (viewerRef.current && window) {
      window.mapillaryViewer = viewerRef.current;
    }
    return () => {
      if (window) {
        delete window.mapillaryViewer;
      }
    };
  }, []);

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