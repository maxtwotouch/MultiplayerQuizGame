import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mt-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Multiplayer Quiz Game!</h1>
      {user ? (
        <p className="text-lg">
          Ready to join a lobby? Go to the{' '}
          <Link to="/lobby" className="text-custom-blue underline">
            Lobby
          </Link>{' '}
          page.
        </p>
      ) : (
        <p className="text-lg">
          Please{' '}
          <Link to="/register" className="text-custom-blue underline">
            register
          </Link>{' '}
          to start playing.
        </p>
      )}
    </div>
  );
};

export default Home;
