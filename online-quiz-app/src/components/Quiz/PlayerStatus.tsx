import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLobby } from '../../contexts/LobbyContext';

interface Player {
  id: string;
  name: string;
  score: number;
  currentAnswer?: string;
  isCorrect?: boolean;
}

const PlayerStatus: React.FC = () => {
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
      setLoading(true);
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
      setLoading(false);
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

  if (loading) {
    return <p className="text-center mt-4">Loading players...</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Players</h3>
      {players.length === 0 ? (
        <p className="text-gray-500">No players yet.</p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li key={player.id} className="flex justify-between items-center p-4 bg-base-200 rounded-lg shadow">
              <span className="font-medium">{player.name}</span>
              <span className="text-custom-blue font-semibold">Score: {player.score}</span>
              {player.currentAnswer !== undefined && (
                <span className={`font-semibold ${player.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {player.isCorrect ? '✅ Correct' : '❌ Wrong'}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerStatus;