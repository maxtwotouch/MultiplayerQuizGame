// src/components/Navbar.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLobby } from '../contexts/LobbyContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { lobby } = useLobby();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/register');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
          <h1>Quiz App</h1>
        </Link>
      </div>
      <div>
        {user && (
          <>
            {lobby && (
              <Link to="/lobby" style={{ marginRight: '1rem', color: '#fff', textDecoration: 'none' }}>
                Lobby
              </Link>
            )}
            <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
