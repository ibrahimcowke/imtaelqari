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

const TAB_LABELS: Record<Tab, { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = {
  home: { label: 'الرئيسية', icon: BookOpen, desc: 'لوحة التدبر والمتابعة' },
  chapters: { label: 'فهرس الفصول', icon: List, desc: 'أبواب ومباحث الكتاب' },
  annotations: { label: 'الملاحظات والفوائد', icon: Bookmark, desc: 'العلامات والتظليلات' },
  profile: { label: 'الملف والإحصائيات', icon: UserCircle, desc: 'الإنجاز والإعدادات' },
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
      dir="rtl"
    >
      {/* ══════════════════════════════════════════════════
          DYNAMIC AMBIENT BACKGROUND GLOWS
          ══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, var(--app-brand-glow) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--app-brand-dim) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP SIDEBAR (LUXURY LITERARY & ISLAMIC THEME)
          ══════════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex flex-col w-72 z-20 relative shrink-0 border-l shadow-2xl backdrop-blur-2xl transition-all duration-300"
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
        }}
      >
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-5 border-b border-white/5 relative">
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={() => navigate('/read')}>
              <img
                src="/app-logo.png"
                alt="شعار إمتاع القارئ"
                className="w-12 h-12 rounded-2xl object-cover shadow-xl border border-white/20 shrink-0 transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: '0 6px 20px var(--app-brand-glow)' }}
              />
              <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900 shadow" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold font-arabic leading-tight text-white flex items-center gap-1.5 truncate">
                إمتاع القارئ
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white/10 text-amber-300 border border-white/10">
                  كتاب
                </span>
              </h1>
              <p className="text-[11px] font-arabic tracking-wide mt-1 text-white/60 truncate">
                بجمال الكلم وروائع الحكم
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-3 mb-2">
            <span
              className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-60"
              style={{ color: 'var(--app-brand)' }}
            >
              أقسام التطبيق
            </span>
          </div>

          {(['home', 'chapters', 'annotations', 'profile'] as Tab[]).map((tab) => {
            const Icon = TAB_LABELS[tab].icon;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 font-arabic text-sm relative group border ${
                  active
                    ? 'bg-white/10 border-white/15 text-white font-bold shadow-lg'
                    : 'border-transparent text-white/65 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-white/15 text-amber-300 shadow'
                        : 'bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="block leading-tight">{TAB_LABELS[tab].label}</span>
                    <span className="text-[10px] font-normal text-white/40 block mt-0.5">
                      {TAB_LABELS[tab].desc}
                    </span>
                  </div>
                </div>

                {active && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="w-1.5 h-5 rounded-full"
                    style={{ background: 'var(--app-brand)', boxShadow: '0 0 12px var(--app-brand-glow)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* Quick Reader Tools Section */}
          <div className="pt-4 border-t border-white/5 mt-4 space-y-1">
            <span
              className="text-[10px] font-sans font-bold uppercase tracking-widest px-3 mb-2.5 block opacity-60"
              style={{ color: 'var(--app-brand)' }}
            >
              أدوات القارئ
            </span>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-sky-400 opacity-80" />
                <span>البحث الذكي في الكتاب</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/10 rounded border border-white/10 text-white/60">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setIsSoundOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-amber-400 opacity-80" />
                <span>أصوات التركيز والطبيعة</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
            </button>

            <button
              onClick={() => setIsDictOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic border border-transparent hover:border-white/5"
            >
              <BookMarked className="w-4 h-4 text-emerald-400 opacity-80" />
              <span>المعجم اللغوي التراثي</span>
            </button>

            <button
              onClick={() => setIsTopicsOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/65 hover:text-white hover:bg-white/5 transition-all text-xs font-arabic border border-transparent hover:border-white/5"
            >
              <Layers className="w-4 h-4 text-purple-400 opacity-80" />
              <span>التصفح الموضوعي</span>
            </button>
          </div>
        </nav>

        {/* Bottom Author & Book Signature Card */}
        <div className="p-4 border-t border-white/5">
          <div
            className="flex items-center justify-between p-3 rounded-2xl border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-arabic font-bold text-white/90">محمد بن سعد النهاري</span>
              <span className="text-[9px] font-arabic text-white/40">جامع ومؤلف الكتاب</span>
            </div>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/10 text-amber-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT VIEWPORT
          ══════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto z-10 relative custom-scrollbar">
        {/* Desktop Top Header Bar */}
        <header
          className="hidden md:flex items-center justify-between px-8 py-3.5 sticky top-0 z-20 border-b backdrop-blur-2xl transition-all"
          style={{
            background: 'var(--app-bar)',
            borderBottomColor: 'var(--app-bar-border)',
            boxShadow: 'var(--app-bar-shadow)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: 'var(--app-brand)', boxShadow: '0 0 10px var(--app-brand-glow)' }}
            />
            <div>
              <h2 className="text-lg font-bold font-arabic tracking-tight" style={{ color: 'var(--app-text)' }}>
                {TAB_LABELS[activeTab].label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl transition-all duration-200 active:scale-95 text-xs font-arabic border shadow-sm"
              style={{
                background: 'var(--app-surface)',
                borderColor: 'var(--app-surface-border)',
                color: 'var(--app-text-muted)',
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>ابحث في صفحات الكتاب...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] rounded font-mono opacity-60 bg-black/5 dark:bg-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Ambient Soundscape Button */}
            <button
              onClick={() => setIsSoundOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all active:scale-95 text-xs font-arabic font-semibold border"
              style={{
                background: 'var(--app-brand-dim)',
                borderColor: 'var(--app-brand-border)',
                color: 'var(--app-brand)',
              }}
              title="أصوات القراءة والتركيز"
            >
              <Music className="w-3.5 h-3.5" />
              <span>أصوات التركيز</span>
            </button>

            {/* Resume Reading Primary CTA */}
            <button
              onClick={() => navigate('/read')}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl font-arabic text-xs font-bold text-white transition-all duration-300 hover:brightness-110 active:scale-95 shadow-xl group"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 4px 16px var(--app-brand-glow)',
              }}
            >
              <BookOpenCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>استئناف القراءة (ص {currentPage})</span>
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
          </div>
        </header>

        {/* Mobile Header Bar */}
        <header
          className="md:hidden sticky top-0 z-20 px-4 py-3 border-b backdrop-blur-2xl"
          style={{
            background: 'var(--app-bar)',
            borderBottomColor: 'var(--app-bar-border)',
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/app-logo.png"
                  alt="شعار إمتاع القارئ"
                  className="w-9 h-9 rounded-2xl object-cover shadow-md border border-white/20 shrink-0"
                />
                <span className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-900" />
              </div>
              <div>
                <h1 className="text-sm font-bold font-arabic leading-none" style={{ color: 'var(--app-text)' }}>
                  {TAB_LABELS[activeTab].label}
                </h1>
                <p className="text-[10px] font-arabic opacity-50 mt-1">كتاب إمتاع القارئ</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Soundscape button */}
              <button
                onClick={() => setIsSoundOpen(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 border"
                style={{
                  background: 'var(--app-brand-dim)',
                  borderColor: 'var(--app-brand-border)',
                  color: 'var(--app-brand)',
                }}
                title="أصوات التركيز"
              >
                <Music className="w-4 h-4" />
              </button>

              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 border"
                style={{
                  background: 'var(--app-brand-dim)',
                  borderColor: 'var(--app-brand-border)',
                  color: 'var(--app-brand)',
                }}
                title="بحث"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Back to reading button */}
              <button
                onClick={() => navigate('/read')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 font-arabic text-xs font-bold text-white shadow-md"
                style={{
                  background: 'var(--app-brand-grad)',
                  boxShadow: '0 2px 12px var(--app-brand-glow)',
                }}
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
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════
          MOBILE FLOATING BOTTOM NAV DOCK (REDESIGNED)
          ══════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pointer-events-none"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      >
        <div
          className="pointer-events-auto max-w-md mx-auto grid grid-cols-4 items-center rounded-[28px] p-1.5 border shadow-2xl transition-all duration-300"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22), 0 0 1px var(--app-brand-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {(['home', 'chapters', 'annotations', 'profile'] as Tab[]).map((tab) => {
            const Icon = TAB_LABELS[tab].icon;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 relative group select-none"
                style={{
                  color: active ? 'var(--app-brand)' : 'var(--app-text-muted)',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="mobileNavPillActive"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'var(--app-brand-dim)',
                      border: '1px solid var(--app-brand-border)',
                      boxShadow: '0 0 16px var(--app-brand-glow)',
                    }}
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <motion.div
                    animate={active ? { scale: 1.12, y: -1 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Icon className="w-5 h-5 transition-colors" />
                  </motion.div>

                  <span
                    className={`text-[11px] font-arabic leading-none tracking-tight ${
                      active ? 'font-bold' : 'font-medium'
                    }`}
                    style={{
                      color: active ? 'var(--app-brand)' : 'var(--app-text-muted)',
                    }}
                  >
                    {TAB_LABELS[tab].label}
                  </span>

                  {active && (
                    <motion.span
                      layoutId="mobileNavDot"
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: 'var(--app-brand)',
                        boxShadow: '0 0 6px var(--app-brand-glow)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
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
