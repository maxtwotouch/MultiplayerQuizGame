// src/components/Quiz/Question.tsx
import React, { useState, useEffect } from 'react';

interface QuestionProps {
  question: string;
  answers: string[];
  correctAnswer: string; // Added correctAnswer prop
  onAnswer: (answer: string) => Promise<void>;
}

const shuffleArray = (array: string[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const Question: React.FC<QuestionProps> = ({ question, answers, correctAnswer, onAnswer }) => {
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Shuffle answers only when the question or answers change
  useEffect(() => {
    setShuffledAnswers(shuffleArray(answers));
    setSelectedAnswer(null); // Reset selected answer when question changes
    setIsSubmitted(false);  // Reset submission state when question changes
    setIsCorrect(null);     // Reset correctness feedback when question changes
  }, [question, answers]); // Added 'answers' as a dependency

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitted(true);

    // Check if the selected answer is correct
    setIsCorrect(selectedAnswer === correctAnswer);

    // Pass the answer to the parent function
    await onAnswer(selectedAnswer);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.questionText}>{question}</h3>
      <div style={styles.answersContainer}>
        {shuffledAnswers.map((answer, index) => (
          <label
            key={index}
            style={{
              ...styles.answerLabel,
              ...(isSubmitted && selectedAnswer === answer
                ? isCorrect
                  ? styles.correctAnswer
                  : styles.incorrectAnswer
                : {}),
            }}
          >
            <input
              type="radio"
              name="answer"
              value={answer}
              disabled={isSubmitted}
              checked={selectedAnswer === answer}
              onChange={() => setSelectedAnswer(answer)}
              style={styles.radioInput}
            />
            {answer}
          </label>
        ))}
      </div>
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          style={styles.submitButton}
          disabled={!selectedAnswer}
        >
          Submit Answer
        </button>
      ) : (
        <p style={{ ...styles.feedback, color: isCorrect ? 'green' : 'red' }}>
          {isCorrect ? 'Correct!' : 'Wrong!'}
        </p>
      )}
    </div>
  );
};

// Styles with specific border properties
const styles = {
  container: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ddd',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  questionText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
  },
  answersContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  answerLabel: {
    padding: '0.75rem 1rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ddd',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#333',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s, border-color 0.3s',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  correctAnswer: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  incorrectAnswer: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  radioInput: {
    marginRight: '0.75rem',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
    marginTop: '1rem',
    ':hover': {
      backgroundColor: '#0056b3',
    },
    ':disabled': {
      backgroundColor: '#ddd',
      cursor: 'not-allowed',
    },
  },
  feedback: {
    marginTop: '1rem',
    fontWeight: 'bold',
    fontSize: '1.25rem',
  },
};

export default Question;
