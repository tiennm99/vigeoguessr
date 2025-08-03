'use client';

import { useState } from 'react';

export default function UsernameModal({ isOpen, onSubmit }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
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
            onChange={(e) => setUsername(e.target.value)}
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