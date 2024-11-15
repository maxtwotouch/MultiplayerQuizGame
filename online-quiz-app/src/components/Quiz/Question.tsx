// src/components/Quiz/Question.tsx

import React from 'react';

interface QuestionProps {
  question: string;
  answers: string[];
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  selectedAnswer: string;
}

const Question: React.FC<QuestionProps> = ({
  question,
  answers,
  onAnswer,
  selectedAnswer,
}) => {
  return (
    <div>
      <p className="text-xl mb-4">{question}</p>
      {answers.map((answer, index) => (
        <div key={index} className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-blue-600"
              name="quiz-answer"
              value={answer}
              checked={selectedAnswer === answer}
              onChange={() => onAnswer(answer)}
            />
            <span className="ml-2">{answer}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default Question;
