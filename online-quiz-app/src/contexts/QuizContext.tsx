// src/contexts/QuizContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { useLobby } from './LobbyContext';
import { useAuth } from './AuthContext';

interface Question {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

interface QuizContextProps {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  isQuizOver: boolean;
  submitAnswer: (answer: string) => Promise<void>;
  fetchQuestions: () => Promise<void>;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { lobby } = useLobby();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isQuizOver, setIsQuizOver] = useState<boolean>(false);

  useEffect(() => {
    if (!lobby || lobby.status !== 'in progress') return;

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(10); // Fetch 10 questions, adjust as needed

      if (error) {
        console.error('Error fetching questions:', error);
      } else {
        setQuestions(data || []);
      }
    };

    fetchQuestions();
  }, [lobby]);

  const submitAnswer = async (answer: string) => {
    if (!questions.length || isQuizOver) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Update the player's score in the scores table
    if (user && lobby) {
      const { data, error } = await supabase
        .from('scores')
        .select('id, score')
        .eq('lobby_id', lobby.id)
        .eq('player_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') { // Record not found
        // Insert new score
        const { error: insertError } = await supabase
          .from('scores')
          .insert([{ lobby_id: lobby.id, player_id: user.id, score: isCorrect ? score + 1 : score }]);

        if (insertError) {
          console.error('Error inserting score:', insertError);
        }
      } else if (data) {
        // Update existing score
        const { error: updateError } = await supabase
          .from('scores')
          .update({ score: isCorrect ? data.score + 1 : data.score })
          .eq('id', data.id);

        if (updateError) {
          console.error('Error updating score:', updateError);
        }
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizOver(true);

      // Update lobby status to 'completed'
      if (lobby) {
        const { error } = await supabase
          .from('lobbies')
          .update({ status: 'completed' })
          .eq('id', lobby.id);

        if (error) {
          console.error('Error completing lobby:', error);
        }
      }
    }
  };

  const fetchQuestions = async () => {
    if (!lobby) return;

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .limit(10); // Adjust the number of questions as needed

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data || []);
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsQuizOver(false);
    }
  };

  return (
    <QuizContext.Provider
      value={{ questions, currentQuestionIndex, score, isQuizOver, submitAnswer, fetchQuestions }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
