import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['framer-motion', 'react', 'react-dom', 'react-router-dom', 'lucide-react', 'zustand', 'axios', 'nanoid', 'sonner', 'clsx', 'tailwind-merge', 'class-variance-authority'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
