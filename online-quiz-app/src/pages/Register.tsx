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

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (user) return <p className="text-center mt-8">You are already registered as {user.name}!</p>;

  return (
    <div className="flex flex-col items-center mt-8 px-4">
      <h2 className="text-3xl font-semibold mb-6">Register</h2>
      <form onSubmit={handleRegister} className="w-full max-w-sm">
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Name:</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input input-bordered w-full"
            placeholder="Enter your name"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
