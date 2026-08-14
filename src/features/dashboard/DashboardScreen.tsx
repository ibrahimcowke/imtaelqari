import React, { useState } from 'react';
import { HomeTab } from './tabs/HomeTab';
import { ChaptersTab } from './tabs/ChaptersTab';
import { AnnotationsTab } from './tabs/AnnotationsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { BookOpen, List, Bookmark, Search, Feather, UserCircle, BookOpenCheck } from 'lucide-react';
import { SearchSheet } from '../search/SearchSheet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'home' | 'chapters' | 'annotations' | 'profile';

const TAB_LABELS: Record<Tab, string> = {
  home: 'الرئيسية',
  chapters: 'الفصول',
  annotations: 'الملاحظات',
  profile: 'الملف الشخصي',
};

export const DashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const renderTab = () => {
    switch (activeTab) {
      case 'home':        return <HomeTab onNavigate={() => navigate('/read')} />;
      case 'chapters':    return <ChaptersTab onNavigate={() => navigate('/read')} />;
      case 'annotations': return <AnnotationsTab onNavigate={() => navigate('/read')} />;
      case 'profile':     return <ProfileTab />;
    }
  };

  return (
    <div
      className="flex flex-col h-screen md:flex-row relative"
      style={{ background: 'var(--app-bg)', color: 'var(--app-text)', overflow: 'hidden' }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full opacity-35 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, var(--app-brand-glow) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, var(--app-brand-dim) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-[-15%] left-[25%] w-[50%] h-[50%] rounded-full opacity-20 animate-blob animation-delay-4000"
          style={{ background: 'radial-gradient(circle, var(--app-brand-glow) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-72 sidebar-dark z-20 relative flex-shrink-0">
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: 'var(--app-brand-grad)', boxShadow: '0 4px 16px var(--app-brand-glow)' }}>
              <Feather className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold font-arabic leading-tight shimmer-text">إمتاع القارئ</h1>
              <p className="text-[10px] font-sans tracking-wide uppercase mt-0.5 opacity-60">Digital Reader</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <p className="text-[10px] font-sans uppercase tracking-widest px-4 mb-3 opacity-50" style={{ color: 'var(--app-brand)' }}>القائمة</p>
          <SidebarNavItem active={activeTab === 'home'}        onClick={() => setActiveTab('home')}        icon={<BookOpen />}    label="الرئيسية" />
          <SidebarNavItem active={activeTab === 'chapters'}    onClick={() => setActiveTab('chapters')}    icon={<List />}        label="الفصول" />
          <SidebarNavItem active={activeTab === 'annotations'} onClick={() => setActiveTab('annotations')} icon={<Bookmark />}    label="الملاحظات" />
          <SidebarNavItem active={activeTab === 'profile'}     onClick={() => setActiveTab('profile')}     icon={<UserCircle />}  label="الملف الشخصي" />

          <div className="pt-4 border-t border-white/5 mt-4">
            <p className="text-[10px] font-sans uppercase tracking-widest px-4 mb-3 opacity-50" style={{ color: 'var(--app-brand)' }}>أدوات</p>
            <SidebarNavItem active={false} onClick={() => setIsSearchOpen(true)} icon={<Search />} label="البحث في الكتاب" />
          </div>
        </nav>

        {/* Bottom brand */}
        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-[10px] font-arabic text-center opacity-40">محمد بن سعد النهاري</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-h-0 overflow-y-auto z-10 relative custom-scrollbar">
        {/* Mobile Header */}
        <header
          className="md:hidden sticky top-0 z-20 px-4 pt-4 pb-3"
          style={{ background: 'var(--app-bar)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--app-bar-border)' }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: 'var(--app-brand-grad)' }}>
                  <Feather className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-base font-bold font-arabic" style={{ color: 'var(--app-text)' }}>{TAB_LABELS[activeTab]}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Back to reading button */}
              <button
                onClick={() => navigate('/read')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95 font-arabic text-xs font-semibold shadow-md"
                style={{ background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 2px 12px var(--app-brand-glow)' }}
              >
                <BookOpenCheck className="w-3.5 h-3.5" />
                القراءة
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' }}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content with safe-area padding for mobile */}
        <div className="p-4 md:p-8 pb-32 md:pb-8 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div
          className="flex items-center justify-around rounded-2xl px-2 py-2"
          style={{
            background: 'var(--sidebar-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--sidebar-border)',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <MobileNavItem active={activeTab === 'home'}        onClick={() => setActiveTab('home')}        icon={<BookOpen />}   label="الرئيسية" />
          <MobileNavItem active={activeTab === 'chapters'}    onClick={() => setActiveTab('chapters')}    icon={<List />}       label="الفصول" />
          <MobileNavItem active={activeTab === 'annotations'} onClick={() => setActiveTab('annotations')} icon={<Bookmark />}   label="الملاحظات" />
          <MobileNavItem active={activeTab === 'profile'}     onClick={() => setActiveTab('profile')}     icon={<UserCircle />} label="ملفي" />
        </div>
      </nav>

      <SearchSheet open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
};

/* ── Sidebar Nav Item ── */
const SidebarNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm text-right ${
      active ? 'nav-item-active' : 'text-white/60 hover:text-white hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, {
      className: `w-4 h-4 flex-shrink-0 ${active ? 'text-current' : 'opacity-60'}`,
    })}
    <span className="font-arabic">{label}</span>
    {active && <span className="mr-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--app-brand)' }} />}
  </button>
);

/* ── Mobile Nav Item ── */
const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 active:scale-95"
    style={active ? { background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' } : { color: 'rgba(255,255,255,0.45)' }}
  >
    {React.cloneElement(icon as React.ReactElement<any>, {
      className: `w-5 h-5 ${active ? 'text-current' : 'opacity-60'}`,
    })}
    <span className={`text-[10px] font-arabic font-medium ${active ? 'text-current font-bold' : 'opacity-60'}`}>
      {label}
    </span>
  </button>
);
