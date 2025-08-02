'use client';

import { useEffect, useRef } from 'react';

export default function PanoViewer({ imageData, isLoading }) {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoRef.current || !imageData) return;

    const initViewer = () => {
      if (!window.mapillary?.Viewer) {
        setTimeout(initViewer, 100);
        return;
      }

      try {
        if (viewerRef.current) {
          viewerRef.current.remove();
        }

        viewerRef.current = new window.mapillary.Viewer({
          accessToken: 'MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65',
          container: panoRef.current,
          imageId: imageData.id
        });

        viewerRef.current.on('image', (image) => {
          console.log('MapillaryJS image loaded successfully:', image.id);
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
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.remove();
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