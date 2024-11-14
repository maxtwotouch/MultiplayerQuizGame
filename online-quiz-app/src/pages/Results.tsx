// src/pages/Results.tsx
import React, { useEffect, useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Result {
  player_id: string;
  name: string;
  score: number;
}

const Results: React.FC = () => {
  const { isQuizOver, lobbyId } = useQuiz();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!isQuizOver || !lobbyId) {
          console.log('Quiz is not over or lobby ID is missing. Redirecting to quiz.');
          navigate('/quiz');
          return;
        }

        console.log('Fetching results for lobby:', lobbyId);
        const { data, error } = await supabase
          .from('lobby_players')
          .select(`
            player_id,
            profiles (name),
            scores (score)
          `)
          .eq('lobby_id', lobbyId)
          .order('score', { ascending: false, foreignTable: 'scores' }); // Updated line

        if (error) {
          console.error('Error fetching results:', error);
        } else if (data.length === 0) {
          console.warn('No results found for this lobby.');
        } else {
          const formattedResults: Result[] = data.map((item: any) => ({
            player_id: item.player_id,
            name: item.profiles?.name || 'Unknown',
            score: item.scores?.score || 0,
          }));
          setResults(formattedResults);
          console.log('Fetched results:', formattedResults);
        }
      } catch (error) {
        console.error('Unexpected error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [isQuizOver, lobbyId, navigate]);

  const handleReturnHome = () => {
    console.log('Returning to home page.');
    navigate('/');
  };

  if (loading) {
    return <p>Loading results...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Quiz Results</h2>
      {results.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map((result, index) => (
            <li key={result.player_id} style={{ margin: '0.5rem 0' }}>
              {index + 1}. {result.name}: {result.score} points
            </li>
          ))}
        </ul>
      ) : (
        <p>No results available.</p>
      )}
      <button
        onClick={handleReturnHome}
        style={{
          padding: '0.5rem 1rem',
          marginTop: '1rem',
          backgroundColor: '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
        onMouseOver={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#007BFF';
        }}
      >
        Return Home
      </button>
    </div>
  );
};

export default Results;
