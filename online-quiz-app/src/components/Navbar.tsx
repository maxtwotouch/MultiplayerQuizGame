import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLobby } from '../contexts/LobbyContext';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle'; // Assuming ThemeToggle component exists

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
    <div className="navbar bg-primary text-primary-content px-4">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Quiz App
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            {lobby && (
              <Link to="/lobby" className="btn btn-ghost">
                Lobby
              </Link>
            )}
            <span className="text-lg">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="btn btn-error"
            >
              Logout
            </button>
          </>
        )}
        {/* Optional: Include Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
