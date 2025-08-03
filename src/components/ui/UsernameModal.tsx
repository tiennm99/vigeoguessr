'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
}

export default function UsernameModal({ isOpen, onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content username-modal">
        <h2 className="modal-title">Welcome to VIET NAM GUESSR!</h2>
        <p className="modal-subtitle">Enter your username to start playing</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={handleInputChange}
            placeholder="Your username"
            className="username-input"
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            className="username-submit-btn"
            disabled={!username.trim()}
          >
            START PLAYING
          </button>
        </form>
      </div>
    </div>
  );
}