import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global fetch interceptor to catch database/server 500 errors
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  try {
    const response = await originalFetch(...args);
    // If the backend returns a 500 Internal Server Error (often DB failure)
    // and the request was an API call, redirect to error page.
    if (response.status === 500 && args[0] && args[0].includes('/api/')) {
      if (window.location.pathname !== '/error') {
        window.location.href = '/error';
      }
    }
    return response;
  } catch (error) {
    // Catch network errors (e.g. backend completely down)
    if (args[0] && args[0].includes('/api/') && window.location.pathname !== '/error') {
      window.location.href = '/error';
    }
    throw error;
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
