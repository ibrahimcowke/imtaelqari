import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically handle dynamic chunk load failures after new deployments
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const reloadKey = 'imta_chunk_reload_count';
  const count = parseInt(sessionStorage.getItem(reloadKey) || '0', 10);
  if (count < 2) {
    sessionStorage.setItem(reloadKey, String(count + 1));
    window.location.reload();
  }
});

// Clear reload counter on clean successful boot
window.addEventListener('load', () => {
  sessionStorage.removeItem('imta_chunk_reload_count');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

