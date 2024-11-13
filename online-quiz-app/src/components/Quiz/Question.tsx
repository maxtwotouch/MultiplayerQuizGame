// src/components/Quiz/Question.tsx
import React from 'react';

interface QuestionProps {
  question: string;
  answers: string[];
  onAnswer: (answer: string) => void;
}

const Question: React.FC<QuestionProps> = ({ question, answers, onAnswer }) => {
  return (
    <div className="mx-auto max-w-md">
      <h3 className="text-xl mb-4">{question}</h3>
      <div className="flex flex-col items-center">
        {answers.map((answer) => (
          <button
            key={answer}
            onClick={() => onAnswer(answer)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 m-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Question;
