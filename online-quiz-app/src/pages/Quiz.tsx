// src/pages/Quiz.tsx

import React, { useEffect, useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { useLobby } from '../contexts/LobbyContext';
import Question from '../components/Quiz/Question';
import PlayerStatus from '../components/Quiz/PlayerStatus';

const Quiz: React.FC = () => {
  const { questions, currentQuestionIndex, submitAnswer, score, isQuizOver, subject } = useQuiz();
  const { lobby } = useLobby();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!lobby) return <p>Please join a lobby to play the quiz.</p>;
  if (!questions.length) return <p>Loading questions...</p>;

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      setError('Please select an answer before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);
    const correct = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    await submitAnswer(selectedAnswer);
    setSubmitting(false);
  };

  const handleNextQuestion = () => {
    setIsCorrect(null);
    setSelectedAnswer('');
  };

  // useEffect to handle the 1-second display of feedback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCorrect !== null) {
      timer = setTimeout(() => {
        handleNextQuestion();
      }, 1000); // 1000 milliseconds = 1 second
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCorrect]);

  if (isQuizOver) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-2xl mb-4">You have completed the quiz!</h2>
        <p>Waiting for other players to finish...</p>
        {/* Optionally, add a spinner or progress indicator */}
      </div>
    );
  }

  return (
    <div className="text-center mt-8">
      <h2 className="text-2xl mb-4">Quiz Time!</h2>
      {subject && (
        <p className="mb-2 font-semibold">
          Subject: {subject}
        </p>
      )}
      <p className="mb-4">
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <Question
        question={currentQuestion.question}
        answers={currentQuestion.all_answers} // Now string[] is guaranteed
        correctAnswer={currentQuestion.correct_answer}
        onAnswer={setSelectedAnswer}
        selectedAnswer={selectedAnswer}
        isSubmitted={isCorrect !== null} // Pass isSubmitted
        isCorrect={isCorrect}
      />
      {error && <p className="text-red-500">{error}</p>}
      {/* Show Submit Button only if not yet submitted */}
      {isCorrect === null && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || submitting}
          className={`mt-4 px-4 py-2 rounded ${
            !selectedAnswer || submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-700 text-white'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )}
      {/* Display feedback message */}
      {isCorrect !== null && (
        <p className={`mt-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect.'}
        </p>
      )}
      <p className="mt-4">Current Score: {score}</p>
      <PlayerStatus /> {/* Display Player Statuses */}
    </div>
  );
};

export default Quiz;
