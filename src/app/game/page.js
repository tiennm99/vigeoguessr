'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import DonateModal from '@/components/ui/DonateModal';
import PanoViewer from '@/components/features/PanoViewer';
import GameMap from '@/components/features/GameMap';
import ResultModal from '@/components/features/ResultModal';
import { getRandomMapillaryImage } from '@/utils/mapillary';
import { calculateDistance } from '@/utils/distance';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [choiceLocation, setChoiceLocation] = useState('HN');
  const [trueLocation, setTrueLocation] = useState([0, 0]);
  const [guessLocation, setGuessLocation] = useState([0, 0]);
  const [distance, setDistance] = useState(0);
  const [hasGuessed, setHasGuessed] = useState(false);

  const loadRandomImage = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRandomMapillaryImage(choiceLocation);
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
    if (location) {
      setChoiceLocation(location);
    }
  }, [searchParams]);

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

  const handleSubmit = () => {
    if (!hasGuessed) return;

    const dist = calculateDistance(
      guessLocation[0],
      guessLocation[1],
      trueLocation[0],
      trueLocation[1]
    );

    setDistance(dist);
    setShowResultModal(true);
  };

  const handleNextRound = () => {
    setShowResultModal(false);
    setHasGuessed(false);
    setDistance(0);
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
        trueLocation={trueLocation}
        guessLocation={guessLocation}
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
