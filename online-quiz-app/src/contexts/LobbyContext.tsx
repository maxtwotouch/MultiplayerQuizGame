// src/contexts/LobbyContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface Lobby {
  id: string;
  code: string;
  host: boolean;
  status: 'waiting' | 'in progress' | 'completed';
}

interface LobbyContextProps {
    lobby: Lobby | null;
    createLobby: (name: string) => Promise<void>;
    joinLobby: (name: string, code: string) => Promise<void>;
    startGame: () => Promise<void>;
    leaveLobby: () => Promise<void>;
  }
  

const LobbyContext = createContext<LobbyContextProps | undefined>(undefined);

export const LobbyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [lobby, setLobby] = useState<Lobby | null>(null);

  // Load lobby state from localStorage on mount
  useEffect(() => {
    const storedLobby = localStorage.getItem('lobby');
    if (storedLobby) {
      setLobby(JSON.parse(storedLobby));
    }
  }, []);

  // Update localStorage whenever lobby state changes
  useEffect(() => {
    if (lobby) {
      localStorage.setItem('lobby', JSON.stringify(lobby));
    } else {
      localStorage.removeItem('lobby');
    }
  }, [lobby]);

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

  const createLobby = async () => {
    if (!user) throw new Error('User not authenticated');

    const code = await generateLobbyCode();

    try {
      // Insert new lobby
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .insert([{ code, host_id: user.id, status: 'waiting' }])
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
      });
    } catch (error: any) {
      console.error('Create Lobby Error:', error.message || error);
      throw error;
    }
  };

// src/contexts/LobbyContext.tsx
const joinLobby = async (name: string, code: string) => {
    if (!user) throw new Error('User not authenticated');
  
    try {
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
  
      // Add player to lobby_players
      const { error: playerError } = await supabase
        .from('lobby_players')
        .insert([{ lobby_id: lobbyData.id, player_id: user.id, name }]) // Assuming 'name' field exists
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
      });
    } catch (error: any) {
      console.error('Join Lobby Error:', error.message || error);
      throw error;
    }
  };
  
  const startGame = async () => {
    if (!lobby || !lobby.host) throw new Error('Only the host can start the game');

    try {
      // Update lobby status to 'in progress'
      const { error } = await supabase
        .from('lobbies')
        .update({ status: 'in progress' })
        .eq('id', lobby.id);

      if (error) {
        console.error('Error starting game:', error.message);
        throw error;
      }

      setLobby(prev => (prev ? { ...prev, status: 'in progress' } : prev));
    } catch (error: any) {
      console.error('Start Game Error:', error.message || error);
      throw error;
    }
  };

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
    } catch (error: any) {
      console.error('Leave Lobby Error:', error.message || error);
      throw error;
    }
  };

  return (
    <LobbyContext.Provider value={{ lobby, createLobby, joinLobby, startGame, leaveLobby }}>
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobby = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobby must be used within a LobbyProvider');
  }
  return context;
};
