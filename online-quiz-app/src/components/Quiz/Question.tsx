// src/components/Quiz/Question.tsx

import React from 'react';

interface QuestionProps {
  question: string;
  answers: string[];
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  selectedAnswer: string;
  isSubmitted: boolean; // Added property
  isCorrect: boolean | null;
}

const Question: React.FC<QuestionProps> = ({
  question,
  answers,
  onAnswer,
  selectedAnswer,
  isSubmitted,
  isCorrect,
}) => {
  return (
    <div>
      <h3>{question}</h3>
      <ul>
        {answers.map((answer) => (
          <li key={answer}>
            <label>
              <input
                type="radio"
                name="answer"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={() => onAnswer(answer)}
                disabled={isSubmitted} // Disable after submission
              />
              {answer}
            </label>
          </li>
        ))}
      </ul>
      {/* Display feedback only after submission */}
      {isSubmitted && (
        <p className={isCorrect ? 'text-green-500' : 'text-red-500'}>
          {isCorrect ? 'Correct!' : 'Incorrect.'}
        </p>
      )}
    </div>
  );
};

export default Question;
