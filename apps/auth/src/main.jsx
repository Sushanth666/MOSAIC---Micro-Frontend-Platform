import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthApp from './AuthApp.jsx';
import '@mfe/shared-ui/src/tokens.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AuthApp standalone={true} />
    </div>
  </React.StrictMode>
);
