import React, { useState } from 'react';
import {
  ArrowRight, Settings, Bookmark,
  List, Volume2, VolumeX, PanelRightOpen,
  Music, Sparkles, BookMarked, MoreVertical,
  BookOpen, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';

export interface ReaderHeaderProps {
  showControls: boolean;
  chapterTitle: string;
  currentPage: number;
  totalPages: number;
  isBookmarked: boolean;
  isReadingAloud: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onToggleReadingAloud: () => void;
  onOpenSettings: () => void;
  onOpenTOC: () => void;
  onOpenAnnotations: () => void;
  onOpenQuoteStudio: () => void;
  onOpenSoundModal: () => void;
  onOpenDictModal: () => void;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({
  showControls,
  chapterTitle,
  currentPage,
  totalPages,
  isBookmarked,
  isReadingAloud,
  onToggleBookmark,
  onToggleReadingAloud,
  onOpenSettings,
  onOpenTOC,
  onOpenAnnotations,
  onOpenQuoteStudio,
  onOpenSoundModal,
  onOpenDictModal,
}) => {
  const navigate = useNavigate();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const progressPercent = Math.round((currentPage / totalPages) * 100);

  return (
    <header
      className={`absolute top-0 w-full z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none border-b shadow-sm ${
        showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{
        background: 'var(--app-bar)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottomColor: 'var(--app-bar-border)',
        boxShadow: 'var(--app-bar-shadow)',
      }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
        {/* ══════════════════════════════════════════════════
            1. RIGHT / START: Back Button & Title Info (RTL)
            ══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 hover:shadow-sm shrink-0 group border"
            style={{
              background: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              color: 'var(--app-brand)',
            }}
            title="العودة إلى الرئيسية"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span className="hidden md:inline font-arabic text-xs font-bold">الرئيسية</span>
          </button>

          {/* Vertical subtle divider on desktop */}
          <div
            className="hidden sm:block w-px h-6 shrink-0"
            style={{ background: 'var(--app-divider)' }}
          />

          {/* Book / Chapter Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h1
                className="text-xs sm:text-sm font-bold font-arabic truncate max-w-44 sm:max-w-xs md:max-w-md"
                style={{ color: 'var(--app-text)' }}
                title={chapterTitle}
              >
                {chapterTitle || 'إمتاع القارئ'}
              </h1>
            </div>

            {/* Sub-label with clickable page pill */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-arabic opacity-75">
              <span className="hidden sm:inline">إمتاع القارئ</span>
              <span className="hidden sm:inline opacity-40">•</span>
              <button
                onClick={onOpenTOC}
                className="hover:underline flex items-center gap-0.5 font-bold transition-opacity"
                style={{ color: 'var(--app-brand)' }}
                title="فتح فهرس المحتويات"
              >
                <span>ص {currentPage}</span>
                <span className="opacity-60">/ {totalPages}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            2. CENTER: Progress Pill (Desktop / Tablet)
            ══════════════════════════════════════════════════ */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-inner"
          style={{
            background: 'var(--app-brand-dim)',
            borderColor: 'var(--app-brand-border)',
          }}
        >
          <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--app-brand)' }} />
          <span className="text-[11px] font-arabic font-bold" style={{ color: 'var(--app-brand)' }}>
            إنجاز {progressPercent}%
          </span>
        </div>

        {/* ══════════════════════════════════════════════════
            3. LEFT / END: Action Tools (Desktop & Mobile)
            ══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* DESKTOP STUDY & ENHANCEMENT TOOLS */}
          <div className="hidden md:flex items-center gap-1">
            {/* Ambient Sound */}
            <HeaderIconButton
              onClick={onOpenSoundModal}
              icon={<Music className="w-4 h-4" />}
              label="أصوات التركيز والطبيعة"
            />

            {/* Lexicon / Dictionary */}
            <HeaderIconButton
              onClick={onOpenDictModal}
              icon={<BookMarked className="w-4 h-4" />}
              label="المعجم اللغوي التراثي"
            />

            {/* Quote Card Studio */}
            <HeaderIconButton
              onClick={onOpenQuoteStudio}
              icon={<Sparkles className="w-4 h-4 text-amber-500" />}
              label="استوديو بطاقات الاقتباسات"
              highlight
            />

            {/* Notes / Annotations */}
            <HeaderIconButton
              onClick={onOpenAnnotations}
              icon={<PanelRightOpen className="w-4 h-4" />}
              label="الملاحظات والتحديدات"
            />

            {/* Vertical Divider */}
            <div
              className="w-px h-6 mx-1 shrink-0"
              style={{ background: 'var(--app-divider)' }}
            />
          </div>

          {/* CORE READING TOOLS (Available on all screens) */}

          {/* Table of Contents (Desktop only; mobile accesses via tools menu or page pill) */}
          <div className="hidden sm:block">
            <HeaderIconButton
              onClick={onOpenTOC}
              icon={<List className="w-4 h-4" />}
              label="فهرس الكتاب"
            />
          </div>

          {/* Text-to-Speech (Audio Reader) */}
          <HeaderIconButton
            onClick={onToggleReadingAloud}
            icon={
              isReadingAloud ? (
                <div className="relative flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
              ) : (
                <VolumeX className="w-4 h-4" />
              )
            }
            label={isReadingAloud ? 'إيقاف القراءة الصوتية' : 'قراءة صوتية ذكية'}
            active={isReadingAloud}
          />

          {/* Bookmark Toggle */}
          <HeaderIconButton
            onClick={onToggleBookmark}
            icon={
              <Bookmark
                className={`w-4 h-4 transition-all duration-200 ${
                  isBookmarked
                    ? 'fill-amber-500 text-amber-500 scale-110'
                    : 'text-current'
                }`}
              />
            }
            label={isBookmarked ? 'محفوظ في العلامات المرجعية' : 'حفظ كعلامة مرجعية'}
            active={isBookmarked}
          />

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 font-arabic text-xs font-bold border shadow-sm"
            style={{
              background: 'var(--app-brand-dim)',
              borderColor: 'var(--app-brand-border)',
              color: 'var(--app-brand)',
            }}
            title="تخصيص الخط والمظهر"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">الخط والمظهر</span>
          </button>

          {/* MOBILE ONLY: TOOLS OVERFLOW MENU POPOVER */}
          <div className="md:hidden">
            <Popover.Root open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <Popover.Trigger asChild>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 border relative"
                  style={{
                    background: isToolsOpen ? 'var(--app-brand-dim)' : 'var(--app-surface)',
                    borderColor: isToolsOpen ? 'var(--app-brand)' : 'var(--app-surface-border)',
                    color: isToolsOpen ? 'var(--app-brand)' : 'var(--app-text)',
                  }}
                  title="المزيد من الأدوات"
                >
                  <MoreVertical className="w-4 h-4" />
                  <span
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--app-brand)' }}
                  />
                </button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  className="z-50 w-64 rounded-2xl p-2 shadow-2xl border backdrop-blur-xl animate-fade-in focus:outline-none"
                  style={{
                    background: 'var(--app-surface)',
                    borderColor: 'var(--app-surface-border)',
                    color: 'var(--app-text)',
                  }}
                  sideOffset={8}
                  align="end"
                  dir="rtl"
                >
                  <div className="text-[11px] font-arabic font-bold px-3 py-1.5 opacity-60">
                    أدوات القارئ المتقدمة
                  </div>

                  <div className="space-y-1">
                    <MobileMenuItem
                      icon={<List className="w-4 h-4 text-sky-500" />}
                      label="فهرس الكتاب الكامل"
                      onClick={() => { setIsToolsOpen(false); onOpenTOC(); }}
                    />
                    <MobileMenuItem
                      icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                      label="استوديو بطاقات الاقتباسات"
                      badge="جديد"
                      onClick={() => { setIsToolsOpen(false); onOpenQuoteStudio(); }}
                    />
                    <MobileMenuItem
                      icon={<Music className="w-4 h-4 text-emerald-500" />}
                      label="أصوات التركيز والطبيعة"
                      onClick={() => { setIsToolsOpen(false); onOpenSoundModal(); }}
                    />
                    <MobileMenuItem
                      icon={<BookMarked className="w-4 h-4 text-purple-500" />}
                      label="المعجم اللغوي التراثي"
                      onClick={() => { setIsToolsOpen(false); onOpenDictModal(); }}
                    />
                    <MobileMenuItem
                      icon={<PanelRightOpen className="w-4 h-4 text-rose-500" />}
                      label="الملاحظات والتحديدات"
                      onClick={() => { setIsToolsOpen(false); onOpenAnnotations(); }}
                    />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ── Reusable Desktop Header Icon Button ── */
const HeaderIconButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  highlight?: boolean;
}> = ({ onClick, icon, label, active = false, highlight = false }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    title={label}
    className="w-9 h-9 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-90 shrink-0 border relative group"
    style={{
      background: active || highlight
        ? 'var(--app-brand-dim)'
        : 'transparent',
      borderColor: active
        ? 'var(--app-brand)'
        : highlight
        ? 'var(--app-brand-border)'
        : 'transparent',
      color: active || highlight
        ? 'var(--app-brand)'
        : 'var(--app-text-muted)',
    }}
  >
    {icon}
  </button>
);

/* ── Reusable Mobile Menu Item ── */
const MobileMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}> = ({ icon, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-arabic font-medium transition-all active:scale-98 hover:bg-black/5"
    style={{ color: 'var(--app-text)' }}
  >
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-black/5 shrink-0">
        {icon}
      </div>
      <span>{label}</span>
    </div>
    {badge && (
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
      >
        {badge}
      </span>
    )}
  </button>
);
