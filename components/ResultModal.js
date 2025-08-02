'use client';

import { useEffect, useRef } from 'react';

export default function ResultModal({ 
  isOpen, 
  distance, 
  trueLocation, 
  guessLocation, 
  onNextRound 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    const initResultMap = () => {
      if (!window.L) {
        setTimeout(initResultMap, 100);
        return;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      mapInstanceRef.current = window.L.map(mapRef.current).setView(trueLocation, 12);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);

      // Add true location marker (green)
      const trueLocationMarker = window.L.marker(trueLocation, {
        icon: window.L.icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          iconSize: [32, 32]
        })
      }).addTo(mapInstanceRef.current).bindPopup('Actual Location');

      // Add guess marker (red)
      const guessMarker = window.L.marker(guessLocation, {
        icon: window.L.icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          iconSize: [32, 32]
        })
      }).addTo(mapInstanceRef.current).bindPopup('Your Guess');

      // Fit map to show both markers
      const featureGroup = new window.L.featureGroup([trueLocationMarker, guessMarker]);
      mapInstanceRef.current.fitBounds(featureGroup.getBounds().pad(0.1));

      // Add line between markers
      window.L.polyline([trueLocation, guessLocation], { color: 'blue' }).addTo(mapInstanceRef.current);
    };

    initResultMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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