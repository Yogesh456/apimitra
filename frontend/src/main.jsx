import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// API base URL:
//  - Production: set VITE_API_URL to your deployed backend, e.g. https://apimitra-api.onrender.com
//  - Local dev:  leave unset — requests hit '/api' and Vite's proxy forwards to :5000
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) axios.defaults.baseURL = apiUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Fade out the instant boot splash once the app has mounted
requestAnimationFrame(() => {
  const splash = document.getElementById('boot-splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('bs-hide');
      setTimeout(() => splash.remove(), 450);
    }, 500);
  }
});
