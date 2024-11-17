// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LobbyProvider, useLobby } from './contexts/LobbyContext';
import { QuizProvider, useQuiz } from './contexts/QuizContext'; // Assuming there's a QuizContext
import ErrorBoundary from './components/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LobbyProvider>
            <QuizProvider>
              <div className="min-h-screen bg-base-100 text-base-content">
                <Navbar />
                <div className="container mx-auto px-4 py-6">
                  <AppRoutes />
                </div>
              </div>
              {/* Centralized ToastContainer can be added here if needed */}
            </QuizProvider>
          </LobbyProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

// Separate component for routes to use hooks
const AppRoutes: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { lobby, loading: lobbyLoading } = useLobby();
  const { isQuizOver } = useQuiz(); // Access isQuizOver from QuizContext

  // Show loading indicator until both contexts have loaded
  if (authLoading || lobbyLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-100">
        <div className="flex flex-col items-center">
          {/* DaisyUI Spinner */}
          <div
            className="radial-progress animate-spin bg-primary text-primary-content"
            style={{ '--value': 70 } as React.CSSProperties}
          >
            70%
          </div>
          <span className="mt-4 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Home Route */}
      <Route path="/" element={<Home />} />

      {/* Register Route */}
      <Route
        path="/register"
        element={
          user ? (
            lobby ? (
              <Navigate to="/lobby" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Register />
          )
        }
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
          lobby && lobby.status === 'in progress' ? <Quiz /> : <Navigate to="/lobby" replace />
        }
      />

      {/* Results Route */}
      <Route
        path="/results"
        element={
          lobby && (lobby.status === 'completed' || isQuizOver) ? (
            <Results />
          ) : (
            <Navigate to="/lobby" replace />
          )
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
