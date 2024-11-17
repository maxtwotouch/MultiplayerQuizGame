// src/contexts/LobbyContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// Define the Lobby interface
interface Lobby {
  id: string;
  code: string;
  host: boolean;
  subject: string | null;
  status: 'waiting' | 'in progress' | 'completed';
}

// Define the LobbyContextProps interface
interface LobbyContextProps {
  lobby: Lobby | null;
  createLobby: () => Promise<void>;
  joinLobby: (name: string, code: string) => Promise<void>;
  startGame: () => Promise<void>;
  leaveLobby: () => Promise<void>;
  updateSubject: (subject: string) => Promise<void>;
  loading: boolean;
}

// Create the LobbyContext
const LobbyContext = createContext<LobbyContextProps | undefined>(undefined);

// LobbyProvider component
export const LobbyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth(); // Access updateUser from AuthContext
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Load lobby state from localStorage on mount
  useEffect(() => {
    const storedLobby = localStorage.getItem('lobby');
    if (storedLobby) {
      const parsedLobby: Lobby = JSON.parse(storedLobby);
      setLobby(parsedLobby);
      // Optionally, verify the lobby exists and the user is part of it
    }
    setLoading(false);
  }, []);

  // Update localStorage whenever lobby state changes
  useEffect(() => {
    if (lobby) {
      localStorage.setItem('lobby', JSON.stringify(lobby));
    } else {
      localStorage.removeItem('lobby');
    }
  }, [lobby]);

  // Real-time subscription to lobby status and subject changes
  useEffect(() => {
    if (!lobby) return;

    const lobbyStatusChannel = supabase
      .channel(`lobby-status-${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${lobby.id}`,
        },
        payload => {
          console.log('Lobby updated:', payload);
          const { status, subject } = payload.new;
          setLobby(prev =>
            prev
              ? { ...prev, status, subject }
              : prev
          );

          if (status === 'in progress') {
            navigate('/quiz'); // Navigate all users to /quiz
          } else if (status === 'completed') {
            navigate('/results'); // Navigate all users to /results
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lobbyStatusChannel);
    };
  }, [lobby, navigate]);

  // Function to generate a unique lobby code
  const generateLobbyCode = async (): Promise<string> => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check if code already exists
      const { data, error } = await supabase
        .from('lobbies')
        .select('code')
        .eq('code', code)
        .single();

      if (error && error.code === 'PGRST116') {
        // No existing lobby with this code
        exists = false;
      } else if (data) {
        // Code exists, generate a new one
        exists = true;
      }
    }

    return code;
  };

  // Create a new lobby
  const createLobby = async () => {
    if (!user) throw new Error('User not authenticated');

    const code = await generateLobbyCode();

    try {
      // Insert new lobby with subject as null
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .insert([{ code, host_id: user.id, status: 'waiting', subject: null }])
        .select('*')
        .single();

      if (lobbyError) {
        console.error('Error creating lobby:', lobbyError.message);
        throw lobbyError;
      }

      // Add host to lobby_players
      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert([{ lobby_id: lobbyData.id, player_id: user.id }])
        .single();

      if (playerError) {
        console.error('Error adding host to lobby:', playerError.message);
        throw playerError;
      }

      setLobby({
        id: lobbyData.id,
        code: lobbyData.code,
        host: true,
        status: lobbyData.status,
        subject: lobbyData.subject,
      });
    } catch (error: any) {
      console.error('Create Lobby Error:', error.message || error);
      throw error;
    }
  };

  // Join an existing lobby
 // Joining a lobby
const joinLobby = async (name: string, code: string) => {
  if (!user) throw new Error('User not authenticated');

  try {
    // Update user's profile with the name if not already set
    const { data: existingProfile, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchProfileError && fetchProfileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchProfileError.message);
      throw fetchProfileError;
    }

    if (!existingProfile || !existingProfile.name) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error updating profile:', profileError.message);
        throw profileError;
      }

      const updatedUser = { ...user, name, created_at: existingProfile?.created_at || new Date().toISOString() };
      updateUser(updatedUser);
    }

    // Find lobby by code
    const { data: lobbyData, error: lobbyError } = await supabase
      .from('lobbies')
      .select('*')
      .eq('code', code)
      .single();

    if (lobbyError) {
      console.error('Error finding lobby:', lobbyError.message);
      throw lobbyError;
    }

    if (lobbyData.status !== 'waiting') {
      throw new Error('Cannot join a lobby that is already in progress or completed');
    }

    // Check if the user is already part of the lobby
    const { data: existingPlayer } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('lobby_id', lobbyData.id)
      .eq('player_id', user.id)
      .single();

    if (existingPlayer) {
      throw new Error('You are already a member of this lobby');
    }

    // Add player to lobby_players
    const { error: playerError } = await supabase
      .from('lobby_players')
      .insert([{ lobby_id: lobbyData.id, player_id: user.id }])
      .single();

    if (playerError) {
      console.error('Error joining lobby:', playerError.message);
      throw playerError;
    }

    setLobby({
      id: lobbyData.id,
      code: lobbyData.code,
      host: false,
      status: lobbyData.status,
      subject: lobbyData.subject,
    });
  } catch (error: any) {
    console.error('Join Lobby Error:', error.message || error);
    throw error;
  }
};


  // Start the game (only for host)
  const startGame = async () => {
    if (!lobby || !lobby.host) throw new Error('Only the host can start the game');

    try {
      // Update lobby status to 'in progress'
      const { error } = await supabase
        .from('lobbies')
        .update({ status: 'in progress' })
        .eq('id', lobby.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error starting game:', error.message);
        throw error;
      }

      // Update lobby state locally
      setLobby(prev => (prev ? { ...prev, status: 'in progress' } : prev));

      // Navigate the host to /quiz immediately
      console.log('Host is navigating to /quiz');
      navigate('/quiz');
    } catch (error: any) {
      console.error('Start Game Error:', error.message || error);
      throw error;
    }
  };

  // Leave the lobby
  const leaveLobby = async () => {
    if (!lobby || !user) return;

    try {
      // Remove player from lobby_players
      const { error } = await supabase
        .from('lobby_players')
        .delete()
        .eq('lobby_id', lobby.id)
        .eq('player_id', user.id);

      if (error) {
        console.error('Error leaving lobby:', error.message);
        throw error;
      }

      // If host leaves, delete the lobby and associated players
      if (lobby.host) {
        await supabase.from('lobbies').delete().eq('id', lobby.id);
        await supabase.from('lobby_players').delete().eq('lobby_id', lobby.id);
      }

      setLobby(null);
      navigate('/register'); // Redirect to registration after leaving
    } catch (error: any) {
      console.error('Leave Lobby Error:', error.message || error);
      throw error;
    }
  };

  // Update the lobby's subject
  const updateSubject = async (subject: string) => {
    if (!lobby) {
      console.error('No lobby available to update the subject.');
      return;
    }

    try {
      // Update the lobby's subject in the database
      const { data, error } = await supabase
        .from('lobbies')
        .update({ subject })
        .eq('id', lobby.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating subject:', error.message);
        throw error;
      }

      // Update the local lobby state
      setLobby((prev) =>
        prev
          ? {
              ...prev,
              subject: data.subject,
            }
          : prev
      );
    } catch (error: any) {
      console.error('Update Subject Error:', error.message || error);
      throw error;
    }
  };

  return (
    <LobbyContext.Provider
      value={{
        lobby,
        createLobby,
        joinLobby,
        startGame,
        leaveLobby,
        updateSubject,
        loading,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

// Custom hook to use LobbyContext
export const useLobby = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobby must be used within LobbyProvider');
  }
  return context;
};