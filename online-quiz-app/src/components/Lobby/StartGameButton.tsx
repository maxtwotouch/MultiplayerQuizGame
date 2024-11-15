import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { toast } from 'react-toastify';

const StartGameButton: React.FC = () => {
  const { lobby, startGame } = useLobby();

  const handleStartGame = async () => {
    if (!lobby?.subject) {
      toast.error('Please select a subject before starting the game.');
      return;
    }

    try {
      await startGame();
      toast.success('Game started successfully!');
    } catch (error) {
      console.error('Failed to start the game:', error);
      toast.error('Failed to start the game. Please try again.');
    }
  };

  return (
    <button
      onClick={handleStartGame}
      className={`btn btn-success w-full ${!lobby?.subject ? 'btn-disabled' : ''}`}
      disabled={!lobby?.subject} // Disable if no subject selected
    >
      Start Game
    </button>
  );
};

export default StartGameButton;
