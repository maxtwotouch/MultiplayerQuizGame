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
// import { subjects } from '../data/subjects';

interface RawQuestion {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
}

interface Question extends RawQuestion {
  all_answers: string[];
}

interface QuizContextProps {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  isQuizOver: boolean;
  lobbyId: string | null;
  submitAnswer: (answer: string) => Promise<void>;
  fetchQuestions: () => Promise<void>;
  subject: string | null;
}

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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isQuizOver, setIsQuizOver] = useState<boolean>(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);

  // Set lobbyId and subject when lobby is available
  useEffect(() => {
    if (lobby) {
      setLobbyId(lobby.id);
      setSubject(lobby.subject || null);
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

  // Function to load questions based on subject
  const loadQuestionsBySubject = useCallback(
    async (subjectId: string): Promise<RawQuestion[]> => {
      try {
        const questionsModule = await import(`../data/${subjectId}.json`);
        return questionsModule.default;
      } catch (error) {
        console.error(`Error loading questions for subject ${subjectId}:`, error);
        return [];
      }
    },
    []
  );

  // Fetch questions when lobby status is "in progress" and subject is selected
  useEffect(() => {
    if (!lobby || lobby.status !== 'in progress' || !subject) return;

    const fetchQuestionsInternal = async () => {
      try {
        // Fetch questions based on the selected subject
        const rawQuestions = await loadQuestionsBySubject(subject);

        const shuffledQuestions: Question[] = rawQuestions.map((q: RawQuestion) => ({
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
  }, [lobby, shuffleAnswers, subject, loadQuestionsBySubject]);

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
              onConflict: 'lobby_id,player_id',
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
              onConflict: 'lobby_id,player_id,question_id',
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
        // Player has finished all questions
        setIsQuizOver(true);

        // Update player's 'finished' flag and 'completed_at' timestamp in 'lobby_players'
        if (lobbyId) {
          try {
            console.log('Marking player as finished.');
            const { error: finishError } = await supabase
              .from('lobby_players')
              .update({ finished: true, completed_at: new Date().toISOString() })
              .eq('lobby_id', lobbyId)
              .eq('player_id', user!.id)
              .single();

            if (finishError) {
              console.error('Error marking player as finished:', finishError.message);
            } else {
              console.log('Player marked as finished.');
            }
          } catch (error) {
            console.error('Error marking player as finished:', error);
          }
        }

        // Check if all players have finished
        if (lobbyId) {
          try {
            console.log('Checking if all players have finished.');
            const { data, error } = await supabase
              .from('lobby_players')
              .select('finished')
              .eq('lobby_id', lobbyId);

            if (error) {
              console.error('Error checking players\' finished status:', error.message);
            } else {
              const allFinished = data.every((player: any) => player.finished);
              if (allFinished) {
                console.log('All players have finished. Updating lobby status to completed.');
                const { error: statusError } = await supabase
                  .from('lobbies')
                  .update({ status: 'completed' })
                  .eq('id', lobbyId)
                  .single();

                if (statusError) {
                  console.error('Error updating lobby status to completed:', statusError.message);
                } else {
                  console.log('Lobby status updated to completed.');
                  // LobbyContext's real-time subscription will handle navigation to /results
                }
              } else {
                console.log('Not all players have finished yet.');
                // Optionally, you can notify the player to wait for others
              }
            }
          } catch (error) {
            console.error('Error checking if all players have finished:', error);
          }
        }

        // Removed navigate('/results'); since LobbyContext handles navigation
      }
    },
    [
      questions,
      currentQuestionIndex,
      isQuizOver,
      user,
      lobbyId,
    ]
  );

  const fetchQuestions = useCallback(async () => {
    if (!lobbyId || !subject) return;

    const rawQuestions = await loadQuestionsBySubject(subject);

    const shuffledQuestions: Question[] = rawQuestions.map((q: RawQuestion) => ({
      ...q,
      all_answers: shuffleAnswers(q),
    }));

    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsQuizOver(false);
  }, [lobbyId, shuffleAnswers, loadQuestionsBySubject, subject]);

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
        subject, // Provide subject
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
