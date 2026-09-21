import React from 'react';
import ReactDOM from 'react-dom/client';
import AnalyticsApp from './AnalyticsApp.jsx';
import '@mfe/shared-ui/src/tokens.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <AnalyticsApp standalone={true} />
    </div>
  </React.StrictMode>
);
