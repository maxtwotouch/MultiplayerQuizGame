// src/contexts/QuizContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { supabase } from '../supabaseClient';
import { useLobby } from './LobbyContext';
import { useAuth } from './AuthContext';
import questionsData from '../data/dummyQuestions.json';
import { useNavigate } from 'react-router-dom';

interface RawQuestion {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

interface Question extends RawQuestion {
  all_answers: string[]; // Made required
}

interface QuizContextProps {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  isQuizOver: boolean;
  lobbyId: string | null;
  submitAnswer: (answer: string) => Promise<void>;
  fetchQuestions: () => Promise<void>;
}

// Define interfaces for the data structures being upserted
interface LobbyPlayer {
  lobby_id: string;
  player_id: string;
}

interface PlayerAnswer {
  lobby_id: string;
  player_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { lobby } = useLobby();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isQuizOver, setIsQuizOver] = useState<boolean>(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);

  // Set lobbyId when lobby is available
  useEffect(() => {
    if (lobby) {
      setLobbyId(lobby.id);
    }
  }, [lobby]);

  // Shuffle answers helper using Fisher-Yates shuffle for better randomness
  const shuffleAnswers = useCallback((question: RawQuestion): string[] => {
    const shuffled = [...question.wrong_answers, question.correct_answer];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Fetch questions when lobby status is "in progress"
  useEffect(() => {
    if (!lobby || lobby.status !== 'in progress') return;

    const fetchQuestionsInternal = async () => {
      try {
        const shuffledQuestions: Question[] = questionsData.map((q: RawQuestion) => ({
          ...q,
          all_answers: shuffleAnswers(q),
        }));

        setQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsQuizOver(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestionsInternal();
  }, [lobby, shuffleAnswers]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!questions.length || isQuizOver || !lobbyId) return;

      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correct_answer;

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      if (user && lobbyId) {
        try {
          // Ensure player exists in lobby_players
          const lobbyPlayer: LobbyPlayer = {
            lobby_id: lobbyId,
            player_id: user.id,
          };

          const { error: upsertError } = await supabase
            .from('lobby_players')
            .upsert(lobbyPlayer, {
              onConflict: 'lobby_id,player_id', // Changed to comma-separated string
            });

          if (upsertError) {
            console.error('Error upserting lobby player:', upsertError.message);
          }

          if (isCorrect) {
            // Call the RPC function to increment the score
            const { error: rpcError } = await supabase.rpc(
              'increment_score',
              {
                p_lobby_id: lobbyId,
                p_player_id: user.id,
              }
            );

            if (rpcError) {
              console.error(
                'Error incrementing score via RPC:',
                rpcError.message
              );
            } else {
              console.log('Score incremented successfully via RPC.');
            }
          }

          // Insert the player's answer into the 'answers' table using upsert
          const playerAnswer: PlayerAnswer = {
            lobby_id: lobbyId,
            player_id: user.id,
            question_id: currentQuestion.id,
            answer: answer,
            is_correct: isCorrect,
          };

          const { data: answerData, error: answerError } = await supabase
            .from('answers')
            .upsert(playerAnswer, {
              onConflict: 'lobby_id,player_id,question_id', // Changed to comma-separated string
            })
            .single();

          if (answerError) {
            console.error('Error upserting player answer:', answerError.message);
          } else {
            console.log('Player answer recorded/updated:', answerData);
          }
        } catch (error) {
          console.error('Error updating scores and recording answers:', error);
        }
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsQuizOver(true);

        // Update lobby status to 'completed'
        if (lobbyId) {
          try {
            console.log('Updating lobby status to completed.');
            const { data, error } = await supabase
              .from('lobbies')
              .update({ status: 'completed' })
              .eq('id', lobbyId)
              .select('*')
              .single();

            if (error) {
              console.error('Error completing lobby:', error.message);
            } else {
              console.log('Lobby status updated to completed:', data);
            }
          } catch (error) {
            console.error('Error completing lobby:', error);
          }
        }

        // Navigate to the results page
        navigate('/results');
      }
    },
    [
      questions,
      currentQuestionIndex,
      isQuizOver,
      user,
      lobbyId,
      navigate,
    ]
  );

  const fetchQuestions = useCallback(async () => {
    if (!lobbyId) return;

    const shuffledQuestions: Question[] = questionsData.map((q: RawQuestion) => ({
      ...q,
      all_answers: shuffleAnswers(q),
    }));

    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsQuizOver(false);
  }, [lobbyId, shuffleAnswers]);

  return (
    <QuizContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        score,
        isQuizOver,
        lobbyId,
        submitAnswer,
        fetchQuestions,
      }}
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
