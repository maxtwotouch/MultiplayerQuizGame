// src/pages/Quiz.tsx
import React, { useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../contexts/LobbyContext';
import { useAuth } from '../contexts/AuthContext';
import Question from '../components/Quiz/Question';
import { supabase } from '../supabaseClient'; // Ensure supabase is correctly imported

const Quiz: React.FC = () => {
  const { questions, currentQuestionIndex, submitAnswer, isQuizOver, score, fetchQuestions } = useQuiz();
  const { lobby } = useLobby();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lobby) return;

    const initializeQuiz = async () => {
      await fetchQuestions();
    };

    if (lobby.status === 'in progress') {
      initializeQuiz();
    }

    // Subscribe to lobby status changes
    const subscription = supabase
      .from(`lobbies:id=eq.${lobby.id}`)
      .on('UPDATE', (payload) => {
        if (payload.new.status === 'completed') {
          navigate('/results');
        }
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
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
      <p className="mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
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
