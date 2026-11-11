import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — чтобы сайт работал и на GitHub Pages из любой папки
export default defineConfig({
  plugins: [react()],
  base: './',
});
