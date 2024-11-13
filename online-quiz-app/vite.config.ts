// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Adjust if your app is served from a subpath
  build: {
    // Additional build options if necessary
  },
});
