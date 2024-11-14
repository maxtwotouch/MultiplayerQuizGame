// src/components/Lobby/JoinLobby.tsx

import React, { useState } from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const JoinLobby: React.FC = () => {
  const { joinLobby, lobby } = useLobby();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleJoinLobby = async () => {
    if (!name.trim() || !code.trim()) {
      toast.error('Please enter your name and lobby code.');
      return;
    }
    try {
      await joinLobby(name.trim(), code.trim().toUpperCase()); // Pass both name and code
      toast.success('Joined lobby successfully!');
      navigate('/lobby'); // Redirect to lobby page
    } catch (error) {
      if (error instanceof Error) {
        console.error('Join Lobby Error:', error.message);
      } else {
        console.error('Join Lobby Error:', error);
      }
      toast.error('Failed to join lobby. Please check the code and try again.');
    }
  };

  return (
    <div>
      <h3>Join a Lobby</h3>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ margin: '0.5rem', padding: '0.5rem', width: '80%' }}
        disabled={!!lobby} // Disable input if already in a lobby
      />
      <input
        type="text"
        placeholder="Enter Lobby Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ margin: '0.5rem', padding: '0.5rem', width: '80%' }}
        disabled={!!lobby} // Disable input if already in a lobby
      />
      <button
        onClick={handleJoinLobby}
        style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}
        disabled={!!lobby} // Disable if already in a lobby
      >
        Join Lobby
      </button>
      {lobby && (
        <p style={{ color: 'gray', marginTop: '1rem' }}>
          You are already in a lobby. Leave the current lobby to join another.
        </p>
      )}
      <ToastContainer />
    </div>
  );
};

export default JoinLobby;
