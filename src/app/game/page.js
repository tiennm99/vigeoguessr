'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import DonateModal from '@/components/ui/DonateModal';
import PanoViewer from '@/components/features/PanoViewer';
import GameMap from '@/components/features/GameMap';
import ResultModal from '@/components/features/ResultModal';
import { fetchRandomGameImage } from '@/services/game-image.service';
import { calculateDistance } from '@/services/geography.service';
import { calculatePoints } from '@/services/scoring.service';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [choiceLocation, setChoiceLocation] = useState('HN');
  const [username, setUsername] = useState('');
  const [trueLocation, setTrueLocation] = useState([0, 0]);
  const [guessLocation, setGuessLocation] = useState([0, 0]);
  const [distance, setDistance] = useState(0);
  const [points, setPoints] = useState(0);
  const [hasGuessed, setHasGuessed] = useState(false);

  const loadRandomImage = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRandomGameImage(choiceLocation);
      if (data) {
        setImageData(data);
        setTrueLocation([data.lat, data.lng]);
      } else {
        console.error('Failed to load image');
      }
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [choiceLocation]);

  useEffect(() => {
    const location = searchParams.get('location');
    const usernameParam = searchParams.get('username');
    
    if (location) {
      setChoiceLocation(location);
    }
    
    if (usernameParam) {
      setUsername(decodeURIComponent(usernameParam));
    } else {
      const cachedUsername = localStorage.getItem('vigeoguessr_username');
      if (cachedUsername) {
        setUsername(cachedUsername);
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    loadRandomImage();
  }, [loadRandomImage]);

  const handleLocationSelect = useCallback((lat, lng) => {
    console.log('Location selected:', lat, lng);
    setGuessLocation([lat, lng]);
    setHasGuessed(true);
  }, []);

  const handlePreciseLocationLoad = useCallback((lat, lng) => {
    console.log('Precise MapillaryJS coordinates loaded:', lat, lng);
    setTrueLocation([lat, lng]);
  }, []);

  const handleSubmit = async () => {
    if (!hasGuessed || !username || !imageData) return;

    try {
      const response = await fetch('/api/scoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          guessLat: guessLocation[0],
          guessLng: guessLocation[1],
          trueLat: trueLocation[0],
          trueLng: trueLocation[1],
          imageId: imageData.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDistance(result.distance);
        setPoints(result.points);
        setShowResultModal(true);
      } else {
        console.error('Failed to submit score');
        const fallbackDistance = await calculateDistance(
          guessLocation[0],
          guessLocation[1],
          trueLocation[0],
          trueLocation[1]
        );
        setDistance(fallbackDistance);
        setPoints(calculatePoints(fallbackDistance)); // Service expects meters
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      const fallbackDistance = await calculateDistance(
        guessLocation[0],
        guessLocation[1],
        trueLocation[0],
        trueLocation[1]
      );
      setDistance(fallbackDistance);
      setPoints(calculatePoints(fallbackDistance / 1000)); // Convert to km
      setShowResultModal(true);
    }
  };

  const handleNextRound = () => {
    setShowResultModal(false);
    setHasGuessed(false);
    setDistance(0);
    setPoints(0);
    loadRandomImage();
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <div className="main-container">
      <div className="background-layer"></div>

      <div className="content-wrapper">
        <div className="gradient-overlay">
          <Header onDonateClick={() => setShowDonateModal(true)} />

          <div className="game-section">
            <div className="score-header">
              <button className="back-btn" onClick={goBack}>
                <div className="diamond-icon">&lt;</div>
              </button>
            </div>

            <div className="game-content">
              <PanoViewer 
                imageData={imageData} 
                isLoading={isLoading} 
                onPreciseLocationLoad={handlePreciseLocationLoad}
              />

              <div className="right-panel">
                <GameMap
                  choiceLocation={choiceLocation}
                  onLocationSelect={handleLocationSelect}
                />
                <button
                  className="check-btn"
                  disabled={!hasGuessed}
                  onClick={handleSubmit}
                  style={{ opacity: hasGuessed ? 1 : 0.5 }}
                >
                  <div className="check-text">
                    {hasGuessed ? 'SUBMIT GUESS' : 'CLICK MAP TO GUESS'}
                  </div>
                </button>
                {hasGuessed && (
                  <div style={{
                    color: '#05A38C',
                    fontSize: '12px',
                    textAlign: 'center',
                    marginTop: '10px'
                  }}>
                    Location selected: {guessLocation[0].toFixed(4)}, {guessLocation[1].toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResultModal
        isOpen={showResultModal}
        distance={distance}
        points={points}
        trueLocation={trueLocation}
        guessLocation={guessLocation}
        imageData={imageData}
        onNextRound={handleNextRound}
      />

      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
