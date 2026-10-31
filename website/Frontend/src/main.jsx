import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Automatically reload on stale dynamic import / vite preload error after a new deployment
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const hasRefreshed = sessionStorage.getItem('vite-preload-refreshed');
  if (!hasRefreshed) {
    sessionStorage.setItem('vite-preload-refreshed', 'true');
    window.location.reload();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const errorMsg = event.reason?.message || '';
  if (
    errorMsg.includes('Failed to fetch dynamically imported module') ||
    errorMsg.includes('Expected a JavaScript-or-Wasm module script') ||
    errorMsg.includes('error loading dynamically imported module')
  ) {
    const hasRefreshed = sessionStorage.getItem('vite-preload-refreshed');
    if (!hasRefreshed) {
      sessionStorage.setItem('vite-preload-refreshed', 'true');
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
