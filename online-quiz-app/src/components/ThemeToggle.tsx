// src/components/ThemeToggle.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<string>('synthwave');

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'synthwave' ? 'light' : 'synthwave'));
    toast.info(`Switched to ${theme === 'synthwave' ? 'Light' : 'synthwave'} Theme`);
  };

  return (
    <button onClick={toggleTheme} className="btn btn-outline">
      Switch to {theme === 'synthwave' ? 'Light' : 'synthwave'} Theme
    </button>
  );
};

export default ThemeToggle;
