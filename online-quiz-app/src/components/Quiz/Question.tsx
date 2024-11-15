// src/components/Quiz/Question.tsx

import React from 'react';

interface QuestionProps {
  question: string;
  answers: string[];
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  selectedAnswer: string;
  isSubmitted: boolean;
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
    <div className="mt-4">
      <h3 className="text-2xl font-semibold mb-4 text-white-800 dark:text-white">{question}</h3>
      <ul className="space-y-2">
        {answers.map((answer) => (
          <li key={answer}>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="answer"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={() => onAnswer(answer)}
                disabled={isSubmitted} // Disable after submission
                className="radio radio-primary"
              />
              <span className="text-lg text-white-700 dark:text-white-200">{answer}</span>
            </label>
          </li>
        ))}
      </ul>
      {/* Display feedback only after submission */}
      {isSubmitted && (
        <p className={`mt-4 text-lg font-semibold ${
          isCorrect ? 'text-green-500' : 'text-red-500'
        }`}>
          {isCorrect ? '✅ Correct!' : '❌ Incorrect.'}
        </p>
      )}
    </div>
  );
};

export default Question;
