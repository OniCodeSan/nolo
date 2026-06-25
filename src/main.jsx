import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { SearchProvider } from './state/SearchContext.jsx';
import { AuthProvider } from './state/AuthContext.jsx';
import { ToastProvider } from './state/ToastContext.jsx';
import { ConsentProvider } from './state/ConsentContext.jsx';
import { initSentry } from './lib/sentry.js';
import { initAnalytics } from './lib/analytics.js';
import i18n from './i18n/index.js';
import { langFromPath, basenameFor } from './i18n/langs.js';

// Fire-and-forget: Sentry e Analytics rispettano il consent via subscribeConsent.
// Senza env keys diventano no-op.
initSentry();
initAnalytics();

// La lingua è guidata dall'URL: /en/… → 'en'; root → 'it'. Il router monta sotto
// il basename della lingua, così tutte le rotte e i link esistenti restano invariati.
const LANG = langFromPath(window.location.pathname);
i18n.changeLanguage(LANG);
document.documentElement.lang = LANG;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basenameFor(LANG)} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ConsentProvider>
        <ToastProvider>
          <AuthProvider>
            <SearchProvider>
              <App />
            </SearchProvider>
          </AuthProvider>
        </ToastProvider>
      </ConsentProvider>
    </BrowserRouter>
  </StrictMode>,
);
