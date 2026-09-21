import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'analytics_app',
      filename: 'remoteEntry.js',
      exposes: {
        './AnalyticsApp': './src/AnalyticsApp.jsx'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: {
    port: 5004,
    cors: true
  },
  preview: {
    port: 5004,
    cors: true,
    host: true
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
