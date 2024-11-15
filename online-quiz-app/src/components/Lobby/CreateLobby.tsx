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
      await createLobby();
      toast.success('Lobby created successfully!');
      navigate('/lobby'); // Redirect to lobby page
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to create lobby. Try a different name or code.');
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">Create a Lobby</h3>
      <div className="form-control mb-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
          disabled={!!lobby}
        />
      </div>
      <button
        onClick={handleCreateLobby}
        className={`btn btn-primary w-full ${!!lobby ? 'btn-disabled' : ''}`}
        disabled={!!lobby} // Disable if already in a lobby
      >
        Create Lobby
      </button>
      {lobby && (
        <p className="text-center text-gray-500 mt-4">
          You are already in a lobby. Leave the current lobby to create a new one.
        </p>
      )}
      <ToastContainer />
    </div>
  );
};

export default CreateLobby;
