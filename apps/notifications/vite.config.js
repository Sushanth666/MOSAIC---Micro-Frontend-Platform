import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'notifications_app',
      filename: 'remoteEntry.js',
      exposes: {
        './NotificationsApp': './src/NotificationsApp.jsx'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: {
    port: 5005,
    cors: true
  },
  preview: {
    port: 5005,
    cors: true,
    host: true
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
