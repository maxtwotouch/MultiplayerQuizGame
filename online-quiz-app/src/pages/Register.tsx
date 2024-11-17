// src/pages/Register.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      await register(name.trim());
      navigate('/lobby'); // Redirect to lobby after successful registration
    } catch (err: any) {
      setError(err.message || 'Failed to register.');
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col space-y-4 w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold">Register</h3>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="input input-bordered w-full"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default Register;
