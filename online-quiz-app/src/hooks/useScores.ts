// src/hooks/useScores.ts

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useLobby } from '../contexts/LobbyContext';

interface ScoreEntry {
  player_id: string;
  name: string;
  score: number;
}

const useScores = () => {
  const { lobby } = useLobby();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchScores = useCallback(async () => {
    if (!lobby) {
      setScores([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('scores')
      .select(`
        player_id,
        profiles (name),
        score
      `)
      .eq('lobby_id', lobby.id)
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching scores:', error.message);
      setScores([]);
    } else {
      const formattedScores: ScoreEntry[] = data.map((scoreEntry: any) => ({
        player_id: scoreEntry.player_id,
        name: scoreEntry.profiles ? scoreEntry.profiles.name : 'Unknown',
        score: scoreEntry.score,
      }));
      setScores(formattedScores);
    }
    setLoading(false);
  }, [lobby]);

  useEffect(() => {
    fetchScores();

    if (!lobby) return;

    // Subscribe to real-time changes in the 'scores' table for this lobby
    const scoresChannel = supabase
      .channel(`scores-${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'scores',
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          console.log('Change detected in scores. Re-fetching.');
          fetchScores();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(scoresChannel);
      console.log(`Removed channel: scores-${lobby.id}`);
    };
  }, [lobby, fetchScores]);

  return { scores, loading };
};

export default useScores;
