import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exposes the server to external network requests
    port: 5173,
    strictPort: true, // Prevents Vite from automatically switching ports if 5173 is busy
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist'
  }
});
