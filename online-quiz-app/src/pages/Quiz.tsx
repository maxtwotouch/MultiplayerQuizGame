// src/pages/Quiz.tsx
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { useLobby } from '../contexts/LobbyContext';
import Question from '../components/Quiz/Question';
import PlayerStatus from '../components/Quiz/PlayerStatus';

const Quiz: React.FC = () => {
  const { questions, currentQuestionIndex, submitAnswer, score } = useQuiz();
  const { lobby } = useLobby();

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
        answers={currentQuestion.all_answers}
        correctAnswer={currentQuestion.correct_answer}
        onAnswer={submitAnswer}
      />
      <p className="mt-4">Current Score: {score}</p>
      <PlayerStatus /> {/* Display Player Statuses */}
    </div>
  );
};

export default Quiz;
