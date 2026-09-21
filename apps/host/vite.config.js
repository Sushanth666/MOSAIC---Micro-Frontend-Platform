import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host_app',
      remotes: {
        auth_app: 'http://localhost:5001/assets/remoteEntry.js',
        dashboard_app: 'http://localhost:5002/assets/remoteEntry.js',
        users_app: 'http://localhost:5003/assets/remoteEntry.js',
        analytics_app: 'http://localhost:5004/assets/remoteEntry.js',
        notifications_app: 'http://localhost:5005/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: {
    port: 5000,
    cors: true
  },
  preview: {
    port: 5000,
    cors: true,
    host: true
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
