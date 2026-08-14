import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useReaderStore } from './store/readerStore';
import { useEffect } from 'react';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ReaderScreen } from './features/reader/ReaderScreen';

function App() {
  const { preferences } = useReaderStore();

  useEffect(() => {
    // Apply theme to document body
    document.body.className = '';
    document.body.classList.add(`theme-${preferences.theme}`);
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, [preferences.theme]);

  return (
    <BrowserRouter>
      <div
        dir="rtl"
        className={`min-h-screen font-sans selection:bg-brand-500 selection:text-white theme-${preferences.theme}`}
        style={{ background: 'var(--app-bg)', color: 'var(--app-text)', transition: 'background 0.4s ease, color 0.4s ease' }}
      >
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/read" element={<ReaderScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
