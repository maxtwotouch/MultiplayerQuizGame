// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LobbyProvider } from './contexts/LobbyContext'; // Ensure you have this context
import './main.css'; // If you have global styles

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <LobbyProvider>
        <App />
      </LobbyProvider>
    </AuthProvider>
  </React.StrictMode>
);
