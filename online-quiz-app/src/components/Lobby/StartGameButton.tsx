// src/components/Lobby/StartGameButton.tsx

import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';

const StartGameButton: React.FC = () => {
  const { lobby, startGame } = useLobby();

  const handleStartGame = async () => {
    if (!lobby?.subject) {
      alert('Please select a subject before starting the game.');
      return;
    }

    try {
      await startGame();
    } catch (error) {
      console.error('Failed to start the game:', error);
      alert('Failed to start the game. Please try again.');
    }
  };

  return (
    <button
      onClick={handleStartGame}
      className="bg-blue-500 text-white px-4 py-2 rounded"
      disabled={!lobby?.subject} // Disable if no subject selected
    >
      Start Game
    </button>
  );
};

export default StartGameButton;
