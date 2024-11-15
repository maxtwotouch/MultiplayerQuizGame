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
    <div className="mt-4">
      <button
        onClick={handleLeaveLobby}
        className="btn btn-error w-full"
      >
        Leave Lobby
      </button>
      <ToastContainer />
    </div>
  );
};

export default LeaveLobbyButton;
