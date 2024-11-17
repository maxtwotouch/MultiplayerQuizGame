// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed: npm install uuid

// Define the UserProfile interface
interface UserProfile {
  id: string;
  name: string;
  created_at: string;
}

// Define the AuthContextType interface
interface AuthContextType {
  user: UserProfile | null;
  register: (name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (user: UserProfile) => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name: string) => {
    setLoading(true);
    try {
      // Generate a unique ID for the user
      const userId = uuidv4();

      // Insert new profile into Supabase
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, name, created_at: new Date().toISOString() }])
        .select();

      if (error) throw error;

      const newUser = data[0];
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error: any) {
      console.error('Registration error:', error.message);
      throw new Error('Database error saving new user');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // UpdateUser function
  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
