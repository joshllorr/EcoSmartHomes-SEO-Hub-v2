import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

// Gracefully handle benign Vite HMR websocket reconnection noise in controlled sandbox environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (String(event.reason).includes('WebSocket closed without opened') ||
        String(event.reason?.message).includes('WebSocket closed without opened') ||
        String(event.reason).includes('failed to connect to websocket'))
    ) {
      event.preventDefault();
    }
  });
}

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (
  sentryDsn &&
  typeof sentryDsn === 'string' &&
  (sentryDsn.startsWith('http://') || sentryDsn.startsWith('https://')) &&
  !sentryDsn.includes('MY_VITE_SENTRY_DSN')
) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE || 'development',
      release: 'ecosmarthomes-seo-hub@0.0.0',
      integrations: [],
    });
  } catch (err) {
    console.warn('Sentry initialization skipped due to invalid configuration:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
