import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  release: 'ecosmarthomes-seo-hub@0.0.0',
  integrations: [],
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
