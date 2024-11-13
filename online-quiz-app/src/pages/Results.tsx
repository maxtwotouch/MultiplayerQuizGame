// src/pages/Results.tsx
import React, { useEffect, useState } from 'react';
import { useLobby } from '../contexts/LobbyContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Result {
  player_id: string;
  name: string;
  score: number;
}

const Results: React.FC = () => {
  const { lobby } = useLobby();
  const [results, setResults] = useState<Result[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!lobby) return;

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('player_id, profiles(name), score')
        .eq('lobby_id', lobby.id)
        .order('score', { ascending: false });

      if (error) {
        console.error('Error fetching results:', error);
      } else {
        const formattedResults = data.map((item: any) => ({
          player_id: item.player_id,
          name: item.profiles.name,
          score: item.score,
        }));
        setResults(formattedResults);
      }
    };

    fetchResults();
  }, [lobby]);

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Quiz Results</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map((result, index) => (
          <li key={result.player_id} style={{ margin: '0.5rem 0' }}>
            {index + 1}. {result.name}: {result.score} points
          </li>
        ))}
      </ul>
      <button onClick={handleReturnHome} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
        Return Home
      </button>
    </div>
  );
};

export default Results;
