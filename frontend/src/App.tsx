import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './i18n';
import { SessionProvider } from './hooks/useSession.tsx';
import WelcomePage from './pages/WelcomePage';
import MainPage from './pages/MainPage';
import { trackPageView } from './services/clarityService';

/** Map route paths to human-readable page names for Clarity tracking. */
const PAGE_NAMES: Record<string, string> = {
  '/': 'welcome',
  '/play': 'play',
};

/** Tracks virtual page views on route changes. Must be rendered inside a Router. */
function ClarityPageTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageName = PAGE_NAMES[pathname] ?? pathname;
    trackPageView(pageName);
  }, [pathname]);

  return null;
}

/** Root application component with routing and session context. */
export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <ClarityPageTracker />
        <SessionProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/play" element={<MainPage />} />
          </Routes>
        </SessionProvider>
      </HashRouter>
    </LanguageProvider>
  );
}
