// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Adjusted base path for Cloudflare deployment
  build: {
    // Additional build options if necessary
  },
});
