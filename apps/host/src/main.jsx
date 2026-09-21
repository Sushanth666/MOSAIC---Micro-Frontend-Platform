import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@mfe/shared-ui/src/tokens.css';
// Ensure browser tab favicon updates immediately to the latest 3D Solar Amber logo
(() => {
  const updateFavicon = () => {
    const existing = document.querySelectorAll("link[rel*='icon']");
    existing.forEach((el) => el.remove());
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = `/mosaic-logo.png?v=${Date.now()}`;
    document.head.appendChild(link);
  };
  if (typeof document !== 'undefined') {
    updateFavicon();
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
