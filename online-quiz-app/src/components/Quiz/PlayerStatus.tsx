// src/components/Quiz/PlayerStatus.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLobby } from '../../contexts/LobbyContext';
import { useAuth } from '../../contexts/AuthContext';

interface Player {
  id: string;
  name: string;
  score: number;
  currentAnswer?: string;
  isCorrect?: boolean;
}

const PlayerStatus: React.FC = () => {
  const { lobby } = useLobby();
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!lobby) return;

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('lobby_players')
        .select(`
          player_id,
          profiles(name),
          scores(score)
        `)
        .eq('lobby_id', lobby.id);
    
      if (error) {
        console.error('Error fetching players:', error.message);
      } else {
        const formattedPlayers: Player[] = data.map((lp: any) => ({
          id: lp.player_id,
          name: lp.profiles.name,
          score: lp.scores ? lp.scores.score : 0,
        }));
        setPlayers(formattedPlayers); // Ensure players are updated in state
      }
    };
    

    fetchPlayers();

    // Subscribe to changes in lobby_players, scores, and answers
    const playerChannel = supabase
      .channel(`lobby_players-${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    const scoreChannel = supabase
      .channel(`scores-${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    const answersChannel = supabase
      .channel(`answers-${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(playerChannel);
      supabase.removeChannel(scoreChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [lobby]);

  return (
    <div style={styles.container}>
      <h3>Players</h3>
      <ul style={styles.list}>
        {players.map((player) => (
          <li key={player.id} style={styles.listItem}>
            <span>{player.name}</span>
            <span>Score: {player.score}</span>
            {player.currentAnswer !== undefined && (
              <span style={{ color: player.isCorrect ? 'green' : 'red' }}>
                {player.isCorrect ? '✅ Correct' : '❌ Wrong'}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '2rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  list: {
    listStyleType: 'none' as const,
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
};

export default PlayerStatus;
