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
    <div className="card bg-base-100 shadow-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">Join a Lobby</h3>
      <div className="form-control mb-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
          disabled={!!lobby} // Disable input if already in a lobby
        />
      </div>
      <div className="form-control mb-4">
        <input
          type="text"
          placeholder="Enter Lobby Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input input-bordered w-full"
          disabled={!!lobby} // Disable input if already in a lobby
        />
      </div>
      <button
        onClick={handleJoinLobby}
        className={`btn btn-secondary w-full ${!!lobby ? 'btn-disabled' : ''}`}
        disabled={!!lobby} // Disable if already in a lobby
      >
        Join Lobby
      </button>
      {lobby && (
        <p className="text-center text-gray-500 mt-4">
          You are already in a lobby. Leave the current lobby to join another.
        </p>
      )}
      <ToastContainer />
    </div>
  );
};

export default JoinLobby;
