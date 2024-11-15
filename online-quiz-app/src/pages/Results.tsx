import React, { useEffect, useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../contexts/LobbyContext';

interface Result {
  player_id: string;
  name: string;
  score: number;
}

const Results: React.FC = () => {
  const { lobbyId, questions } = useQuiz();
  const { lobby } = useLobby();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
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
          .order('score', { ascending: false, foreignTable: 'scores' });

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
    return <p className="text-center mt-8">Loading results...</p>;
  }

  const totalQuestions = questions.length;

  return (
    <div className="text-center mt-8 px-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6">Quiz Results</h2>
      {results.length > 0 ? (
        <ul className="list-none p-0">
          {results.map((result, index) => (
            <li key={result.player_id} className="mb-2">
              <div className="card bg-base-200 shadow-md p-4 rounded-lg">
                <p className="text-lg">
                  <span className="font-bold">{index + 1}.</span> {result.name}: <span className="text-custom-blue font-bold">{result.score}</span> out of {totalQuestions} points
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results available.</p>
      )}
      <button
        onClick={handleReturnHome}
        className="btn btn-primary mt-6"
      >
        Return Home
      </button>
    </div>
  );
};

export default Results;
