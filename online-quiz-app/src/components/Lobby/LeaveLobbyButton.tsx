// src/components/Lobby/LeaveLobbyButton.tsx
import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LeaveLobbyButton: React.FC = () => {
  const { leaveLobby } = useLobby();
  const navigate = useNavigate();

  const handleLeaveLobby = async () => {
    try {
      await leaveLobby();
      toast.info('You have left the lobby.');
      navigate('/'); // Redirect to home or desired page
    } catch (error: any) {
      console.error('Leave Lobby Error:', error.message || error);
      toast.error('Failed to leave the lobby. Please try again.');
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        onClick={handleLeaveLobby}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Leave Lobby
      </button>
      <ToastContainer />
    </div>
  );
};

export default LeaveLobbyButton;
