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
      console.log('Lobby ID set to:', lobby.id);
      console.log('Lobby subject set to:', lobby.subject);
      console.log('Lobby status:', lobby.status);
    }
  }, [lobby]);

  // Generic shuffle function using Fisher-Yates algorithm
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Shuffle answers helper for each question
  const shuffleAnswers = useCallback(
    (question: RawQuestion): string[] => {
      const shuffled = shuffleArray([
        ...question.wrong_answers,
        question.correct_answer,
      ]);
      return shuffled;
    },
    [shuffleArray]
  );

  // Function to load questions based on subject
  const loadQuestionsBySubject = useCallback(
    async (subjectId: string): Promise<RawQuestion[]> => {
      try {
        const questionsModule = await import(`../data/${subjectId}.json`);
        console.log(`Loaded questions for subject "${subjectId}":`, questionsModule.default);
        return questionsModule.default;
      } catch (error) {
        console.error(`Error loading questions for subject "${subjectId}":`, error);
        return [];
      }
    },
    []
  );

  // Function to initialize the quiz
  const initializeQuiz = useCallback(async () => {
    if (!lobbyId || !subject) {
      console.log('initializeQuiz: Missing lobbyId or subject.');
      return;
    }

    try {
      console.log(`Initializing quiz for subject: ${subject}`);
      const rawQuestions = await loadQuestionsBySubject(subject);

      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        console.warn(`No questions found for subject "${subject}".`);
        setQuestions([]);
        setIsQuizOver(true);
        return;
      }

      // Shuffle all questions
      const shuffledQuestions = shuffleArray(rawQuestions);

      // Select up to 15 questions
      const selectedQuestions = shuffledQuestions.slice(0, 15);

      // Shuffle answers for each selected question
      const formattedQuestions: Question[] = selectedQuestions.map(
        (q: RawQuestion) => ({
          ...q,
          all_answers: shuffleAnswers(q),
        })
      );

      console.log('Formatted Questions:', formattedQuestions);

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsQuizOver(false);
    } catch (error) {
      console.error('Error initializing quiz:', error);
    }
  }, [lobbyId, loadQuestionsBySubject, shuffleArray, shuffleAnswers, subject]);

  // Load quiz state from localStorage on mount or when subject changes
  useEffect(() => {
    if (subject && lobby && user) {
      const storedQuizState = localStorage.getItem(
        `quiz_state_${lobby.id}_${user.id}`
      );
      if (storedQuizState) {
        try {
          const parsedState = JSON.parse(storedQuizState);

          // Validate and set currentQuestionIndex
          if (
            typeof parsedState.currentQuestionIndex === 'number' &&
            parsedState.currentQuestionIndex >= 0 &&
            parsedState.currentQuestionIndex < (parsedState.questions?.length || 0)
          ) {
            setCurrentQuestionIndex(parsedState.currentQuestionIndex);
          } else {
            setCurrentQuestionIndex(0);
          }

          // Validate and set score
          if (typeof parsedState.score === 'number' && parsedState.score >= 0) {
            setScore(parsedState.score);
          } else {
            setScore(0);
          }

          // Validate and set isQuizOver
          if (typeof parsedState.isQuizOver === 'boolean') {
            setIsQuizOver(parsedState.isQuizOver);
          } else {
            setIsQuizOver(false);
          }

          // Validate and set questions
          if (
            Array.isArray(parsedState.questions) &&
            parsedState.questions.length > 0
          ) {
            setQuestions(parsedState.questions);
          } else {
            setQuestions([]);
            initializeQuiz();
          }

          console.log('Loaded quiz state from localStorage:', parsedState);
        } catch (error) {
          console.error('Error parsing stored quiz state:', error);
          // Reset state if parsing fails
          setCurrentQuestionIndex(0);
          setScore(0);
          setIsQuizOver(false);
          setQuestions([]);
          initializeQuiz();
        }
      } else {
        console.log('No stored quiz state found. Initializing quiz.');
        initializeQuiz();
      }
    }
  }, [subject, lobby, user, initializeQuiz]);

  // Save quiz state to localStorage whenever relevant states change
  useEffect(() => {
    if (lobby && user) {
      const quizState = {
        questions,
        currentQuestionIndex,
        score,
        isQuizOver,
        // Exclude 'subject' from being saved
      };
      localStorage.setItem(
        `quiz_state_${lobby.id}_${user.id}`,
        JSON.stringify(quizState)
      );
      console.log('Saved quiz state to localStorage:', quizState);
    }
  }, [questions, currentQuestionIndex, score, isQuizOver, lobby, user]);

  // Clear quiz state from localStorage when the quiz is over
  useEffect(() => {
    if (isQuizOver && lobbyId && user) {
      localStorage.removeItem(`quiz_state_${lobbyId}_${user.id}`);
      console.log('Cleared quiz state from localStorage.');
    }
  }, [isQuizOver, lobbyId, user]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!questions.length || isQuizOver || !lobbyId || !user) {
        console.log('submitAnswer: Missing data.', {
          questionsLength: questions.length,
          isQuizOver,
          lobbyId,
          user: user?.id,
        });
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = answer === currentQuestion.correct_answer;

      console.log(
        `Submitting answer: "${answer}", Correct: ${isCorrect} for question ID: ${currentQuestion.id}`
      );

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

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

      // Move to next question or end quiz
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        console.log(`Moved to question index: ${currentQuestionIndex + 1}`);
      } else {
        // Player has finished all questions
        setIsQuizOver(true);
        console.log('Quiz is now over.');

        try {
          console.log('Marking player as finished.');
          const { error: finishError } = await supabase
            .from('lobby_players')
            .update({ finished: true, completed_at: new Date().toISOString() })
            .eq('lobby_id', lobbyId)
            .eq('player_id', user.id)
            .single();

          if (finishError) {
            console.error('Error marking player as finished:', finishError.message);
          } else {
            console.log('Player marked as finished.');
          }
        } catch (error) {
          console.error('Error marking player as finished:', error);
        }

        // Check if all players have finished
        try {
          console.log('Checking if all players have finished.');
          const { data, error } = await supabase
            .from('lobby_players')
            .select('finished')
            .eq('lobby_id', lobbyId);

          if (error) {
            console.error("Error checking players' finished status:", error.message);
          } else {
            const allFinished = data.every((player: any) => player.finished);
            console.log('All players finished:', allFinished);
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
              // Optionally, notify the player to wait for others
            }
          }
        } catch (error) {
          console.error('Error checking if all players have finished:', error);
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
      shuffleArray,
      shuffleAnswers,
    ]
  );

  const fetchQuestions = useCallback(async () => {
    if (!lobbyId || !subject) {
      console.log('fetchQuestions: Missing lobbyId or subject.');
      return;
    }

    try {
      console.log(`Fetching questions for subject: ${subject}`);
      const rawQuestions = await loadQuestionsBySubject(subject);

      if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        console.warn(`No questions found for subject "${subject}".`);
        setQuestions([]);
        setIsQuizOver(true);
        return;
      }

      // Shuffle all questions
      const shuffledQuestions = shuffleArray(rawQuestions);

      // Select up to 15 questions
      const selectedQuestions = shuffledQuestions.slice(0, 15);

      // Shuffle answers for each selected question
      const formattedQuestions: Question[] = selectedQuestions.map(
        (q: RawQuestion) => ({
          ...q,
          all_answers: shuffleAnswers(q),
        })
      );

      console.log('Formatted Questions:', formattedQuestions);

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsQuizOver(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }, [lobbyId, shuffleArray, shuffleAnswers, loadQuestionsBySubject, subject]);

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
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};