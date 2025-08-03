'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import DonateModal from '@/components/ui/DonateModal';
import UsernameModal from '@/components/ui/UsernameModal';
import { LOCATION_NAMES } from '@/constants/locations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Play, Target, Users } from 'lucide-react';

export default function Home() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const cachedUsername = localStorage.getItem('vigeoguessr_username');
    if (cachedUsername) {
      setUsername(cachedUsername);
    } else {
      setShowUsernameModal(true);
    }
  }, []);

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('vigeoguessr_username', newUsername);
    setShowUsernameModal(false);
  };

  const startGame = (location: string) => {
    if (!username) {
      setShowUsernameModal(true);
      return;
    }
    router.push(`/game?location=${location}&username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header onDonateClick={() => setShowDonateModal(true)} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
              <MapPin className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            VIGEOGUESSR
          </h1>
          <Badge variant="secondary" className="text-lg px-6 py-2 mb-6">
            <MapPin className="h-4 w-4 mr-2" />
            Welcome to Vietnam Geography Game
          </Badge>
          {username && (
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Playing as: <strong>{username}</strong></span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* How to Play Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Target className="h-6 w-6" />
                <span>How to Play</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Badge variant="default" className="bg-blue-600 text-white">1</Badge>
                  <div>
                    <h3 className="font-semibold text-blue-900">Choose your city</h3>
                    <p className="text-sm text-blue-700">Select from Vietnamese cities to explore</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Badge variant="default" className="bg-green-600 text-white">2</Badge>
                  <div>
                    <h3 className="font-semibold text-green-900">Guess the location</h3>
                    <p className="text-sm text-green-700">View street images and guess where you are on the map</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* City Selection Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-2xl">
                <Play className="h-6 w-6" />
                <span>Choose Your City</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(LOCATION_NAMES).map(([key, name]) => (
                  <Button
                    key={key}
                    onClick={() => startGame(key)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <MapPin className="h-5 w-5 mr-3" />
                    {name}
                    <Play className="h-4 w-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats or Additional Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Test your geography knowledge by exploring Vietnam through street view images. 
                Earn points based on how close your guesses are to the actual locations!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />

      <UsernameModal
        isOpen={showUsernameModal}
        onSubmit={handleUsernameSubmit}
      />
    </div>
  );
}