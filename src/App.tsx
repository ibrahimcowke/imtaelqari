import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useReaderStore } from './store/readerStore';
import { useEffect, useState, Suspense, lazy } from 'react';
import { Capacitor } from '@capacitor/core';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initCapacitorApp, updateNativeStatusBar } from './lib/capacitor';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

// Lazy load screen routes for maximum initial load performance
const DashboardScreen = lazy(() => import('./features/dashboard/DashboardScreen').then(m => ({ default: m.DashboardScreen })));
const ReaderScreen = lazy(() => import('./features/reader/ReaderScreen').then(m => ({ default: m.ReaderScreen })));
const WelcomeScreen = lazy(() => import('./features/welcome/WelcomeScreen').then(m => ({ default: m.WelcomeScreen })));

// Ultra lightweight route loader
const RouteLoader = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="w-10 h-10 rounded-2xl animate-pulse shadow-lg flex items-center justify-center"
        style={{ background: 'var(--app-brand-grad)' }}>
        <img src="/app-logo.png" alt="Loading" className="w-8 h-8 rounded-xl object-cover" />
      </div>
      <span className="font-arabic text-xs font-semibold opacity-70">{t('dashboard')}...</span>
    </div>
  );
};

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
    <Suspense fallback={<RouteLoader />}>
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
    </Suspense>
  );
}

function AppContent() {
  const { preferences } = useReaderStore();
  const { dir, isRTL, language } = useLanguage();

  useEffect(() => {
    initCapacitorApp();
  }, []);

  useEffect(() => {
    // Apply theme and dynamic font variable across document root & body
    const themeClass = `theme-${preferences.theme}`;
    document.documentElement.className = themeClass;
    document.body.className = themeClass;
    document.documentElement.setAttribute('data-theme', preferences.theme);

    const fontValue = isRTL
      ? `"${preferences.fontFamily}", "Noto Naskh Arabic", "Amiri", sans-serif`
      : `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    document.documentElement.style.setProperty('--app-font-family', fontValue);
    document.body.style.fontFamily = fontValue;
    document.documentElement.dir = dir;
    document.documentElement.lang = language;

    // Update Android Native Status Bar
    updateNativeStatusBar(preferences.theme);
  }, [preferences.theme, preferences.fontFamily, dir, isRTL, language]);

  return (
    <BrowserRouter>
      <div
        dir={dir}
        className={`min-h-screen selection:bg-brand-500 selection:text-white theme-${preferences.theme}`}
        style={{
          background: 'var(--app-bg)',
          color: 'var(--app-text)',
          fontFamily: 'var(--app-font-family)',
          transition: 'background 0.35s ease, color 0.35s ease',
        }}
      >
        <RootRouter />
        {!Capacitor.isNativePlatform() && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
