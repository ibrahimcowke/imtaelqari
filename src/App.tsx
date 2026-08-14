import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useReaderStore } from './store/readerStore';
import { useEffect, useState } from 'react';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ReaderScreen } from './features/reader/ReaderScreen';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function RootRouter() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('imta_welcome_seen') !== 'true';
  });

  const handleStart = () => {
    localStorage.setItem('imta_welcome_seen', 'true');
    setShowWelcome(false);
    navigate('/');
  };

  const handleOpenReader = () => {
    localStorage.setItem('imta_welcome_seen', 'true');
    setShowWelcome(false);
    navigate('/read');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          showWelcome ? (
            <WelcomeScreen onStart={handleStart} onOpenReader={handleOpenReader} />
          ) : (
            <DashboardScreen />
          )
        }
      />
      <Route path="/read" element={<ReaderScreen />} />
      <Route
        path="/welcome"
        element={
          <WelcomeScreen
            onStart={() => {
              localStorage.setItem('imta_welcome_seen', 'true');
              navigate('/');
            }}
            onOpenReader={() => {
              localStorage.setItem('imta_welcome_seen', 'true');
              navigate('/read');
            }}
          />
        }
      />
    </Routes>
  );
}

function App() {
  const { preferences } = useReaderStore();

  useEffect(() => {
    // Apply theme and font to document body
    document.body.className = '';
    document.body.classList.add(`theme-${preferences.theme}`);
    document.body.style.fontFamily = `"${preferences.fontFamily}", "Noto Naskh Arabic", sans-serif`;
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, [preferences.theme, preferences.fontFamily]);

  return (
    <BrowserRouter>
      <div
        dir="rtl"
        className={`min-h-screen selection:bg-brand-500 selection:text-white theme-${preferences.theme}`}
        style={{
          background: 'var(--app-bg)',
          color: 'var(--app-text)',
          fontFamily: `"${preferences.fontFamily}", "Noto Naskh Arabic", sans-serif`,
          transition: 'background 0.35s ease, color 0.35s ease',
        }}
      >
        <RootRouter />
        <Analytics />
        <SpeedInsights />
      </div>
    </BrowserRouter>
  );
}

export default App;
