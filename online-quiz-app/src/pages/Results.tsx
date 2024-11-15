// src/pages/Results.tsx

import React, { useEffect, useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../contexts/LobbyContext'; // Import useLobby

interface Result {
  player_id: string;
  name: string;
  score: number;
}

const Results: React.FC = () => {
  const { lobbyId, questions } = useQuiz(); // Access questions from QuizContext
  const { lobby } = useLobby(); // Access lobby status
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Ensure the lobby exists and is completed
        if (!lobby || lobby.status !== 'completed') {
          console.log('Quiz is not completed or lobby is missing. Redirecting to home.');
          navigate('/');
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
          .order('score', { ascending: false, foreignTable: 'scores' }); // Sort by score descendingly

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
  }, [lobby, lobbyId, navigate]);

  const handleReturnHome = () => {
    console.log('Returning to home page.');
    navigate('/');
  };

  if (loading) {
    return <p>Loading results...</p>;
  }

  // Calculate total number of questions
  const totalQuestions = questions.length;

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
      <h2>Quiz Results</h2>
      {results.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map((result, index) => (
            <li key={result.player_id} style={{ margin: '0.5rem 0' }}>
              {index + 1}. {result.name}: {result.score} out of {totalQuestions} points
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
