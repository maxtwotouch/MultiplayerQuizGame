// src/components/Lobby/CreateLobby.tsx
import React, { useState } from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const CreateLobby: React.FC = () => {
  const { createLobby, lobby } = useLobby();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleCreateLobby = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    try {
      await createLobby(name.trim());
      toast.success('Lobby created successfully!');
      navigate('/lobby'); // Redirect to lobby page
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to create lobby. Try a different name or code.');
    }
  };

  return (
    <div>
      <h3>Create a Lobby</h3>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ margin: '0.5rem', padding: '0.5rem' }}
      />
      <button
        onClick={handleCreateLobby}
        style={{ padding: '0.5rem 1rem' }}
        disabled={!!lobby} // Disable if already in a lobby
      >
        Create Lobby
      </button>
      <ToastContainer />
    </div>
  );
};

export default CreateLobby;
