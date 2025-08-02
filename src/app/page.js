'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import DonateModal from '@/components/ui/DonateModal';
import { locationNames } from '@/constants/locations';

export default function Home() {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const router = useRouter();

  const startGame = (location) => {
    router.push(`/game?location=${location}`);
  };

  return (
    <div className="main-container">
      <div className="background-layer"></div>

      <div className="content-wrapper">
        <div className="gradient-overlay">
          <Header onDonateClick={() => setShowDonateModal(true)} />

          <div className="game-section">
            <div className="score-header">
              <span className="score-text">WELCOME TO VIET NAM GUESSR GAME</span>
            </div>

            <div className="play-section">
              <div className="play-title-row">
                <h1 className="play-title">PLAY NOW</h1>
              </div>
            </div>

            <div className="game-content">
              <div className="pano">
                <h2 className="how-title">HOW 2 PLAY</h2>

                <div className="instruction-list">
                  <p className="instruction">1. Choose your city</p>
                  <p className="instruction">2. Guess the location of the picture as accurately as possible</p>
                </div>
              </div>

              <div className="right-panel">
                {Object.entries(locationNames).map(([key, name]) => (
                  <button
                    key={key}
                    className="bridge-btn"
                    onClick={() => startGame(key)}
                  >
                    <div className="bridge-text">{name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />
    </div>
  );
}
