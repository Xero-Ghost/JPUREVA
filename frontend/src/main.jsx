import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
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
      let errMsg = "Internal Server Error (500)";
      try {
        const cloned = response.clone();
        const data = await cloned.json();
        if (data.error) errMsg = data.error;
        else if (data.message) errMsg = data.message;
      } catch (e) {
        try {
          const text = await response.clone().text();
          if (text) errMsg = text.substring(0, 200);
        } catch (e2) {}
      }
      if (window.location.pathname !== '/error') {
        window.location.href = `/error?message=${encodeURIComponent(errMsg)}`;
      }
    }
    return response;
  } catch (error) {
    // Catch network errors (e.g. backend completely down)
    if (args[0] && args[0].includes('/api/') && window.location.pathname !== '/error') {
      window.location.href = `/error?message=${encodeURIComponent(error.message || "Network Error")}`;
    }
    throw error;
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
)
