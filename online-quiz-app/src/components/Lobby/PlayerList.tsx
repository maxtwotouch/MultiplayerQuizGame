// src/components/Lobby/PlayerList.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLobby } from '../../contexts/LobbyContext';

interface Player {
  id: string;
  name: string;
}

const PlayerList: React.FC = () => {
  const { lobby } = useLobby();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!lobby) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
        const { data, error } = await supabase
          .from('lobby_players')
          .select(`
            player_id,
            name,
            scores(score)
          `)
          .eq('lobby_id', lobby.id);
      
        if (error) {
          console.error('Error fetching players:', error.message);
        } else {
          const formattedPlayers: Player[] = data.map((lp: any) => ({
            id: lp.player_id,
            name: lp.name, // Name is now fetched directly from lobby_players
            score: lp.scores ? lp.scores.score : 0, // Fetch scores, if available
          }));
          setPlayers(formattedPlayers);
        }
      };
      

    fetchPlayers();

    // Real-time subscription using supabase.channel() (v2)
    const channel = supabase
      .channel(`lobby-${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_id=eq.${lobby.id}`,
        },
        payload => {
          console.log('Change received!', payload);
          fetchPlayers(); // Refresh player list on any change
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobby]);

  if (loading) {
    return <p>Loading players...</p>;
  }

  return (
    <div>
      <h3>Players in Lobby:</h3>
      {players.length === 0 ? (
        <p>No players yet.</p>
      ) : (
        <ul>
          {players.map(player => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerList;
