import React, { useState } from 'react';
import { HomeTab } from './tabs/HomeTab';
import { ChaptersTab } from './tabs/ChaptersTab';
import { AnnotationsTab } from './tabs/AnnotationsTab';
import { ProfileTab } from './tabs/ProfileTab';
import {
  BookOpen, List, Bookmark, Search, UserCircle,
  BookOpenCheck, Music, BookMarked, Layers, Sparkles,
  ChevronLeft
} from 'lucide-react';
import { SearchSheet } from '../search/SearchSheet';
import { AmbientSoundModal } from '../audio/AmbientSoundModal';
import { ArabicDictionaryModal } from '../dictionary/ArabicDictionaryModal';
import { TopicsModal } from '../topics/TopicsModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReaderStore } from '../../store/readerStore';

type Tab = 'home' | 'chapters' | 'annotations' | 'profile';

const TAB_LABELS: Record<Tab, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  home: { label: 'الرئيسية', icon: BookOpen },
  chapters: { label: 'الفصول', icon: List },
  annotations: { label: 'الملاحظات', icon: Bookmark },
  profile: { label: 'الملف الشخصي', icon: UserCircle },
};

export const DashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSoundOpen, setIsSoundOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const navigate = useNavigate();
  const { currentPage } = useReaderStore();

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
      className="flex flex-col h-screen md:flex-row relative selection:bg-brand-500 selection:text-white"
      style={{ background: 'var(--app-bg)', color: 'var(--app-text)', overflow: 'hidden' }}
    >
      {/* Animated Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full opacity-35 animate-blob animation-delay-2000"
          style={{ background: 'radial-gradient(circle, var(--app-brand-glow) 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute top-[20%] right-[-15%] w-[50%] h-[50%] rounded-full opacity-25 animate-blob"
          style={{ background: 'radial-gradient(circle, var(--app-brand-dim) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute bottom-[-15%] left-[20%] w-[60%] h-[60%] rounded-full opacity-20 animate-blob animation-delay-4000"
          style={{ background: 'radial-gradient(circle, var(--app-brand-glow) 0%, transparent 75%)', filter: 'blur(90px)' }}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP SIDEBAR
          ══════════════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col w-72 sidebar-dark z-20 relative shrink-0 border-l border-white/5 shadow-2xl">
        {/* Brand Logo & Title */}
        <div className="px-6 pt-7 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3.5 mb-1">
            <div className="relative group">
              <img
                src="/app-logo.png"
                alt="شعار إمتاع القارئ"
                className="w-11 h-11 rounded-2xl object-cover shadow-xl border border-white/15 shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: '0 6px 20px var(--app-brand-glow)' }}
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
            </div>
            <div>
              <h1 className="text-base font-bold font-arabic leading-tight shimmer-text">
                إمتاع القارئ
              </h1>
              <p className="text-[10.5px] font-arabic tracking-wide mt-0.5 opacity-60">
                بجمال الكلم وروائع الحكم
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-3 mb-2.5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--app-brand)' }}>
              التنقل الرئيسي
            </span>
          </div>

          {(['home', 'chapters', 'annotations', 'profile'] as Tab[]).map((tab) => {
            const Icon = TAB_LABELS[tab].icon;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 font-arabic text-sm relative group ${
                  active ? 'nav-item-active font-bold' : 'text-white/65 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`} />
                  <span>{TAB_LABELS[tab].label}</span>
                </div>
                {active && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="w-1.5 h-4 rounded-full"
                    style={{ background: 'var(--app-brand)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* Quick Tools Section */}
          <div className="pt-5 border-t border-white/5 mt-5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-3 mb-3 block opacity-50" style={{ color: 'var(--app-brand)' }}>
              أدوات القارئ
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 opacity-70 text-brand-400" />
                  <span>البحث في الكتاب</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[9px] font-sans bg-white/10 rounded border border-white/10 text-white/50">
                  بحث
                </kbd>
              </button>

              <button
                onClick={() => setIsSoundOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 opacity-70 text-amber-400" />
                  <span>أصوات التركيز</span>
                </div>
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 bg-amber-400/60 rounded-full eq-bar-1" />
                  <span className="w-0.5 bg-amber-400/60 rounded-full eq-bar-2" />
                  <span className="w-0.5 bg-amber-400/60 rounded-full eq-bar-3" />
                </div>
              </button>

              <button
                onClick={() => setIsDictOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic"
              >
                <BookMarked className="w-4 h-4 opacity-70 text-emerald-400" />
                <span>المعجم اللغوي</span>
              </button>

              <button
                onClick={() => setIsTopicsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic"
              >
                <Layers className="w-4 h-4 opacity-70 text-sky-400" />
                <span>التصفح الموضوعي</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Bottom Author Signature */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex flex-col">
              <span className="text-[11px] font-arabic font-semibold text-white/80">محمد بن سعد النهاري</span>
              <span className="text-[9px] font-sans text-white/40">المؤلف والجامع</span>
            </div>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-brand-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT AREA
          ══════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto z-10 relative custom-scrollbar">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-20 app-bar border-b">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--app-brand)', boxShadow: '0 0 10px var(--app-brand-glow)' }} />
            <h2 className="text-xl font-bold font-arabic tracking-tight" style={{ color: 'var(--app-text)' }}>
              {TAB_LABELS[activeTab].label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition-all duration-200 active:scale-95 text-xs font-arabic"
              style={{
                background: 'var(--app-surface)',
                border: '1px solid var(--app-surface-border)',
                color: 'var(--app-text-muted)',
                boxShadow: '0 2px 8px var(--app-surface-shadow)',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>ابحث في صفحات الكتاب...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] rounded font-sans opacity-60 bg-black/5 dark:bg-white/10">⌘K</kbd>
            </button>

            {/* Ambient Soundscape quick button */}
            <button
              onClick={() => setIsSoundOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all active:scale-95 text-xs font-arabic font-semibold"
              style={{
                background: 'var(--app-brand-dim)',
                border: '1px solid var(--app-brand-border)',
                color: 'var(--app-brand)',
              }}
              title="أصوات القراءة والتركيز"
            >
              <Music className="w-3.5 h-3.5" />
              <span>أصوات التركيز</span>
            </button>

            {/* Resume Reading CTA */}
            <button
              onClick={() => navigate('/read')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl font-arabic text-xs font-bold text-white transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 4px 16px var(--app-brand-glow)',
              }}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>متابعة القراءة (ص {currentPage})</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile Header Bar */}
        <header
          className="md:hidden sticky top-0 z-20 px-4 pt-3.5 pb-3 app-bar border-b"
          style={{ borderBottomColor: 'var(--app-bar-border)' }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/app-logo.png"
                  alt="شعار إمتاع القارئ"
                  className="w-8 h-8 rounded-xl object-cover shadow-md border border-white/15 shrink-0"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-900" />
              </div>
              <div>
                <h1 className="text-base font-bold font-arabic leading-none" style={{ color: 'var(--app-text)' }}>
                  {TAB_LABELS[activeTab].label}
                </h1>
                <p className="text-[10px] font-arabic opacity-50 mt-0.5">إمتاع القارئ</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Soundscape button */}
              <button
                onClick={() => setIsSoundOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' }}
                title="أصوات التركيز"
              >
                <Music className="w-4 h-4" />
              </button>

              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' }}
                title="بحث"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Back to reading button */}
              <button
                onClick={() => navigate('/read')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 font-arabic text-xs font-bold text-white shadow-md"
                style={{ background: 'var(--app-brand-grad)', boxShadow: '0 2px 12px var(--app-brand-glow)' }}
              >
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span>ص {currentPage}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <div className="p-4 md:p-8 pb-32 md:pb-12 max-w-5xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════
          MOBILE FLOATING BOTTOM NAV DOCK
          ══════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-1 pointer-events-none">
        <div
          className="pointer-events-auto flex items-center justify-around rounded-3xl p-1.5 glass-dock"
          style={{
            background: 'var(--sidebar-bg)',
            borderColor: 'var(--sidebar-border)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.4)',
          }}
        >
          {(['home', 'chapters', 'annotations', 'profile'] as Tab[]).map((tab) => {
            const Icon = TAB_LABELS[tab].icon;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 active:scale-90 relative ${
                  active ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'var(--app-brand-dim)',
                      border: '1px solid var(--app-brand-border)',
                      boxShadow: '0 0 16px var(--app-brand-glow)',
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-current scale-105' : 'opacity-70'}`} />
                <span className={`text-[10px] font-arabic relative z-10 ${active ? 'font-bold' : 'font-medium'}`}>
                  {TAB_LABELS[tab].label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals & Dialogs */}
      <SearchSheet open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <AmbientSoundModal open={isSoundOpen} onOpenChange={setIsSoundOpen} />
      <ArabicDictionaryModal open={isDictOpen} onOpenChange={setIsDictOpen} />
      <TopicsModal open={isTopicsOpen} onOpenChange={setIsTopicsOpen} onNavigate={() => navigate('/read')} />
    </div>
  );
};
