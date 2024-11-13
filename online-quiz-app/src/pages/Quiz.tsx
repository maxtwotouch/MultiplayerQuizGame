// src/pages/Quiz.tsx
import { useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../contexts/LobbyContext';
import Question from '../components/Quiz/Question';
import { supabase } from '../supabaseClient';

interface LobbyUpdatePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  commit_timestamp: string;
  new: {
    id: string;
    code: string;
    host_id: string;
    status: 'waiting' | 'in progress' | 'completed';
    // Add other relevant fields
  };
  old: {
    id: string;
    code: string;
    host_id: string;
    status: 'waiting' | 'in progress' | 'completed';
    // Add other relevant fields
  };
}

const Quiz: React.FC = () => {
  const { questions, currentQuestionIndex, submitAnswer, isQuizOver, score, fetchQuestions } = useQuiz();
  const { lobby } = useLobby();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lobby) return;

    const initializeQuiz = async () => {
      await fetchQuestions();
    };

    if (lobby.status === 'in progress') {
      initializeQuiz();
    }

    // Subscribe to lobby status changes using Supabase v2's channel
    const channel = supabase
      .channel(`lobby-${lobby.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lobbies',
          filter: `id=eq.${lobby.id}`,
        },
        (payload: LobbyUpdatePayload) => {
          if (payload.new.status === 'completed') {
            navigate('/results');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobby, fetchQuestions, navigate]);

  useEffect(() => {
    if (isQuizOver) {
      navigate('/results');
    }
  }, [isQuizOver, navigate]);

  if (!lobby) return <p>Please join a lobby to play the quiz.</p>;
  if (!questions.length) return <p>Loading questions...</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="text-center mt-8">
      <h2 className="text-2xl mb-4">Quiz Time!</h2>
      <p className="mb-4">
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <Question
        question={currentQuestion.question}
        answers={[currentQuestion.correct_answer, ...currentQuestion.wrong_answers].sort(() => Math.random() - 0.5)}
        onAnswer={submitAnswer}
      />
      <p className="mt-4">Current Score: {score}</p>
    </div>
  );
};

export default Quiz;
