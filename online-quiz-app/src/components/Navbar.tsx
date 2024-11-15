// src/components/Navbar.tsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLobby } from '../contexts/LobbyContext';
import { Link, useNavigate } from 'react-router-dom';
// import ThemeToggle from './ThemeToggle';

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
      {/* Navbar Start */}
      <div className="navbar-start">
        {/* Dropdown for Mobile */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            {/* Hamburger Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </label>
          {/* Dropdown Menu */}
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-primary rounded-box w-52"
          >
            {user && (
              <>
                {lobby && (
                  <li>
                    <Link to="/lobby">Lobby</Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
            {!user && (
              <>
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
              </>
            )}
            {/* Theme Toggle in Mobile Menu
            <li>
              <ThemeToggle />
            </li> */}
          </ul>
        </div>
        {/* Brand */}
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Quiz App
        </Link>
      </div>

      {/* Navbar Center for Large Screens */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {user && (
            <>
              {lobby && (
                <li>
                  <Link to="/lobby">Lobby</Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
          {!user && (
            <>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </>
          )}
          {/* Theme Toggle in Large Screens
          {user && (
            <li>
              <ThemeToggle />
            </li>
          )} */}
        </ul>
      </div>

      {/* Navbar End (Optional: Additional Icons or Buttons) */}
      <div className="navbar-end">
        {/* You can add additional buttons or icons here if needed */}
      </div>
    </div>
  );
};

export default Navbar;
