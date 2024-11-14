// src/components/Lobby/StartGameButton.tsx
import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const StartGameButton: React.FC = () => {
  const { startGame } = useLobby();
  const navigate = useNavigate(); // Initialize navigate

  const handleStartGame = async () => {
    try {
      await startGame();
      toast.success('Game has started!');
      navigate('/quiz'); // Navigate to quiz page
    } catch (error: any) {
      console.error('Start Game Error:', error.message || error);
      toast.error('Failed to start the game. Please try again.');
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        onClick={handleStartGame}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Start Game
      </button>
      <ToastContainer />
    </div>
  );
};

export default StartGameButton;
