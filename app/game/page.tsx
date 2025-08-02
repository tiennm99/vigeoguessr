'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import DonateModal from '@/components/DonateModal';
import PanoViewer from '@/components/PanoViewer';
import GameMap from '@/components/GameMap';
import ResultModal from '@/components/ResultModal';
import { getRandomMapillaryImage, calculateDistance, LocationKey } from '@/lib/gameUtils';
import { ImageData } from '@/types/game';

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [choiceLocation, setChoiceLocation] = useState<LocationKey>('HN');
  const [trueLocation, setTrueLocation] = useState<[number, number]>([0, 0]);
  const [guessLocation, setGuessLocation] = useState<[number, number]>([0, 0]);
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
    const location = searchParams.get('location') as LocationKey;
    if (location) {
      setChoiceLocation(location);
    }
  }, [searchParams]);

  useEffect(() => {
    loadRandomImage();
  }, [loadRandomImage]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setGuessLocation([lat, lng]);
    setHasGuessed(true);
  };

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
                <div className="diamond-icon" style={{ backgroundImage: 'url(/back.svg)' }}></div>
              </button>
            </div>
            
            <div className="game-content">
              <PanoViewer imageData={imageData} isLoading={isLoading} />
              
              <div className="right-panel">
                <GameMap 
                  choiceLocation={choiceLocation}
                  onLocationSelect={handleLocationSelect}
                />
                <button 
                  className="check-btn" 
                  disabled={!hasGuessed}
                  onClick={handleSubmit}
                >
                  <div className="check-text">SUBMIT</div>
                </button>
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