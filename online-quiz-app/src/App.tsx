// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { LobbyProvider } from './contexts/LobbyContext';
import { QuizProvider } from './contexts/QuizContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import { useLobby } from './contexts/LobbyContext';
import { useQuiz } from './contexts/QuizContext';



const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const { lobby } = useLobby();
  const { isQuizOver } = useQuiz(); // Access isQuizOver

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Register Route */}
      <Route
        path="/register"
        element={user && !lobby ? <Navigate to="/lobby" replace /> : <Register />}
      />

      {/* Lobby Route */}
      <Route
        path="/lobby"
        element={user ? <Lobby /> : <Navigate to="/register" replace />}
      />

      {/* Quiz Route */}
      <Route
        path="/quiz"
        element={
          lobby && lobby.status === 'in progress' ? <Quiz /> : <Navigate to="/" replace />
        }
      />

      {/* Results Route */}
      <Route
        path="/results"
        element={
          lobby && (lobby.status === 'completed' || isQuizOver) ? (
            <Results />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// src/App.tsx

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LobbyProvider>
            <QuizProvider>
              <Navbar />
              <AppRoutes />
            </QuizProvider>
          </LobbyProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;