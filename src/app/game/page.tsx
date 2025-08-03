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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Target } from 'lucide-react';

interface ImageData {
  id: string;
  lat: number;
  lng: number;
  [key: string]: unknown;
}

function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [choiceLocation, setChoiceLocation] = useState('HN');
  const [username, setUsername] = useState('');
  const [trueLocation, setTrueLocation] = useState<[number, number]>([0, 0]);
  const [guessLocation, setGuessLocation] = useState<[number, number]>([0, 0]);
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

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    console.log('Location selected:', lat, lng);
    setGuessLocation([lat, lng]);
    setHasGuessed(true);
  }, []);

  const handlePreciseLocationLoad = useCallback((lat: number, lng: number) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onDonateClick={() => setShowDonateModal(true)} />

      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            onClick={goBack}
            variant="outline"
            className="bg-white/80 hover:bg-white border-gray-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
          {/* Street View - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
                <h2 className="text-white font-semibold flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Street View - Where are you?</span>
                </h2>
              </div>
              <div className="p-4 h-full">
                <PanoViewer 
                  imageData={imageData} 
                  isLoading={isLoading} 
                  onPreciseLocationLoad={handlePreciseLocationLoad}
                />
              </div>
            </div>
          </div>

          {/* Map and Controls - Takes 1 column */}
          <div className="space-y-4">
            {/* Map Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                <h3 className="text-white font-semibold flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Make your guess</span>
                </h3>
              </div>
              <div className="p-4">
                <GameMap
                  choiceLocation={choiceLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>

            {/* Status and Submit */}
            <div className="space-y-4">
              {hasGuessed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <MapPin className="h-3 w-3 mr-1" />
                      Location Selected
                    </Badge>
                    <div className="text-xs text-green-600 font-mono mt-2">
                      {guessLocation[0].toFixed(4)}, {guessLocation[1].toFixed(4)}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!hasGuessed}
                size="lg"
                className={`w-full py-4 text-lg font-semibold ${
                  hasGuessed
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                    : ''
                }`}
              >
                {hasGuessed ? (
                  <>
                    <Target className="h-5 w-5 mr-2" />
                    Submit Guess
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 mr-2" />
                    Click map to guess
                  </>
                )}
              </Button>
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