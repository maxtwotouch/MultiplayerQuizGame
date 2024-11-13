// src/pages/Register.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const { register, user, loading } = useAuth();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/lobby');
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return alert('Please enter a valid name.');
    }
    try {
      await register(name.trim());
      // Navigation is handled by useEffect
    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (user) return <p>You are already registered as {user.name}!</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div style={{ margin: '0.5rem' }}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ margin: '0.5rem', padding: '0.5rem' }}
            />
          </label>
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Register</button>
      </form>
    </div>
  );
};

export default Register;
