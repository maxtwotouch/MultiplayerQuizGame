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

  if (!lobby) return <p className="text-center mt-8">Please join a lobby to play the quiz.</p>;
  if (!questions.length) return <p className="text-center mt-8">Loading questions...</p>;

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCorrect !== null) {
      timer = setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCorrect]);

  if (isQuizOver) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-3xl mb-4 text-custom-blue">You have completed the quiz!</h2>
        <p className="text-lg">Waiting for other players to finish...</p>
        {/* Optionally, add a spinner or progress indicator */}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-base-100 dark:bg-base-200 p-8 rounded-lg shadow-lg mt-8">
      <h2 className="text-3xl mb-4 text-custom-blue">Quiz Time!</h2>
      {subject && (
        <p className="mb-2 font-semibold text-white-700 dark:text-white-300">
          Subject: {subject}
        </p>
      )}
      <p className="mb-4 text-xl">
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <Question
        question={currentQuestion.question}
        answers={currentQuestion.all_answers}
        correctAnswer={currentQuestion.correct_answer}
        onAnswer={setSelectedAnswer}
        selectedAnswer={selectedAnswer}
        isSubmitted={isCorrect !== null}
        isCorrect={isCorrect}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {isCorrect === null && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || submitting}
          className={`mt-4 btn btn-primary w-full ${
            !selectedAnswer || submitting ? 'btn-disabled' : ''
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )}
      {isCorrect !== null && (
        <p className={`mt-4 text-lg font-semibold ${
          isCorrect ? 'text-green-500' : 'text-red-500'
        }`}>
        </p>
      )}
      <p className="mt-4 text-lg">
        Current Score: <span className="text-custom-blue font-bold">{score}</span>
      </p>
      <PlayerStatus />
    </div>
  );
};

export default Quiz;
