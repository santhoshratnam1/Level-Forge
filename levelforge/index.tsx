import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Environment Variable Debug
console.log('Environment check:', {
  hasApiKey: !!process.env.API_KEY,
  // Safely access substring
  apiKeyPrefix: process.env.API_KEY ? process.env.API_KEY.substring(0, 10) + '...' : 'Not set',
  nodeEnv: process.env.NODE_ENV,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
