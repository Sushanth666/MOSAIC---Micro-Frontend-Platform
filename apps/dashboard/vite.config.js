import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dashboard_app',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardApp': './src/DashboardApp.jsx'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: {
    port: 5002,
    cors: true
  },
  preview: {
    port: 5002,
    cors: true,
    host: true
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
