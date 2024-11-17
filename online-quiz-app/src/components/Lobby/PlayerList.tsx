import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLobby } from '../../contexts/LobbyContext';

interface Player {
  id: string;
  name: string;
  score: number;
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
      setLoading(true); // Start loading
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
        setPlayers(formattedPlayers);
      }
      setLoading(false); // End loading
    };

    fetchPlayers();

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
          fetchPlayers();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobby]);

  if (loading) {
    return <p className="text-center mt-4">Loading players...</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2">Players in Lobby:</h3>
      {players.length === 0 ? (
        <p className="text-gray-500">No players yet.</p>
      ) : (
        <ul className="list-disc list-inside">
          {players.map(player => (
            <li key={player.id} className="text-lg">
              {player.name} <span className="text-custom-blue">({player.score} pts)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerList;