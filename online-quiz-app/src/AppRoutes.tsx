// src/AppRoutes.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AppRoutes: React.FC = () => {
  const { user } = useAuth(); // Now useAuth is defined

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default AppRoutes;