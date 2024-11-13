// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Welcome to the Multiplayer Quiz Game!</h1>
      {user ? (
        <p>Ready to join a lobby? Go to the <Link to="/lobby" style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>Lobby</Link> page.</p>
      ) : (
        <p>Please <Link to="/register" style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>register</Link> to start playing.</p>
      )}
    </div>
  );
};

export default Home;
