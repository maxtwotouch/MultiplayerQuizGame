// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': {
          light: '#3B82F6',
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
        },
      },
    },
  },
  darkMode: 'class', // Enables class-based dark mode
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["synthwave", "light", "dark"],
    defaultTheme: "synthwave",
  },
};
