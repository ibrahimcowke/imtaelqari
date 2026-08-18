import React, { useState } from 'react';
import {
  ArrowRight, Settings, Bookmark,
  List, Volume2, VolumeX, PanelRightOpen,
  Music, Sparkles, BookMarked,
  BookOpen, ChevronDown, Trophy, Layers, Mic, Image as ImageIcon, Lightbulb,
  Users, Music2, Film, Clock, Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import { TopThemeChanger } from '../../theme/TopThemeChanger';

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
  onOpenCompanion: () => void;
  onOpenManuscript: () => void;
  onOpenVoiceStudio: () => void;
  onOpenKhatma: () => void;
  onOpenFlashcards: () => void;
  onOpenQuiz?: () => void;
  onOpenBiographies?: () => void;
  onOpenPoetry?: () => void;
  onOpenReels?: () => void;
  onOpenZen?: () => void;
  onOpenBackup?: () => void;
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
  onOpenCompanion,
  onOpenManuscript,
  onOpenVoiceStudio,
  onOpenKhatma,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenBiographies,
  onOpenPoetry,
  onOpenReels,
  onOpenZen,
  onOpenBackup,
}) => {
  const navigate = useNavigate();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const progressPercent = Math.round((currentPage / totalPages) * 100);

  const toolsList = [
    {
      id: 'companion',
      label: 'الشارح التراثي',
      desc: 'تفسير وبلاغة ذكية',
      icon: Lightbulb,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badge: 'ذكي',
      action: onOpenCompanion,
    },
    {
      id: 'quiz',
      label: 'تحدي المسابقات',
      desc: 'اختبار الحصيلة الأدبية',
      icon: Trophy,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badge: 'جديد',
      action: onOpenQuiz || (() => {}),
    },
    {
      id: 'biographies',
      label: 'أعلام وشخصيات',
      desc: 'تراجم ومواضع الاستشهاد',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      action: onOpenBiographies || (() => {}),
    },
    {
      id: 'poetry',
      label: 'محلل البحور الشعرية',
      desc: 'علم العروض والقوافي',
      icon: Music2,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      action: onOpenPoetry || (() => {}),
    },
    {
      id: 'reels',
      label: 'استوديو الريلز',
      desc: 'قصص متحركة 9:16',
      icon: Film,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      badge: 'Story',
      action: onOpenReels || (() => {}),
    },
    {
      id: 'zen',
      label: 'وضع الصفاء والتركيز',
      desc: 'مؤقت تدبر بومودورو',
      icon: Clock,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      action: onOpenZen || (() => {}),
    },
    {
      id: 'quote-studio',
      label: 'استوديو الاقتباسات',
      desc: 'تصميم بطاقات فاخرة',
      icon: Sparkles,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badge: 'HD',
      action: onOpenQuoteStudio,
    },
    {
      id: 'manuscript',
      label: 'مطابقة المخطوطة',
      desc: 'مقارنة النص بالأصل',
      icon: ImageIcon,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      action: onOpenManuscript,
    },
    {
      id: 'voice-studio',
      label: 'استوديو الصوت',
      desc: 'تسجيل القراءة ومشاركتها',
      icon: Mic,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      action: onOpenVoiceStudio,
    },
    {
      id: 'khatma',
      label: 'الختمات والأوراد',
      desc: 'تحديات القراءة اليومية',
      icon: Trophy,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      action: onOpenKhatma,
    },
    {
      id: 'flashcards',
      label: 'بطاقات المراجعة',
      desc: 'تثبيت وحفظ الفوائد',
      icon: Layers,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      action: onOpenFlashcards,
    },
    {
      id: 'ambient',
      label: 'أصوات التركيز',
      desc: 'مطر، هدوء، ومكتبة',
      icon: Music,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      action: onOpenSoundModal,
    },
    {
      id: 'dictionary',
      label: 'المعجم اللغوي',
      desc: 'شرح غريب المفردات',
      icon: BookMarked,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      action: onOpenDictModal,
    },
    {
      id: 'backup',
      label: 'النسخ والطباعة',
      desc: 'تصدير كراسة الفوائد',
      icon: Database,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      action: onOpenBackup || (() => {}),
    },
    {
      id: 'annotations',
      label: 'الملاحظات والفوائد',
      desc: 'العلامات والتظليلات',
      icon: PanelRightOpen,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      action: onOpenAnnotations,
    },
  ];

  return (
    <header
      className={`absolute top-0 w-full z-30 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none border-b shadow-sm ${
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
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ══════════════════════════════════════════════════
            1. RIGHT / START: Navigation & Chapter Information
            ══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 md:flex-initial">
          {/* Home Return Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 hover:brightness-105 shrink-0 group border shadow-xs cursor-pointer"
            style={{
              background: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              color: 'var(--app-brand)',
            }}
            title="العودة إلى الرئيسية"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span className="hidden sm:inline font-arabic text-xs font-bold">الرئيسية</span>
          </button>

          <div
            className="hidden sm:block w-px h-5 shrink-0"
            style={{ background: 'var(--app-divider)' }}
          />

          {/* Book / Chapter Info & Page Pill */}
          <div className="flex flex-col min-w-0 justify-center">
            <h1
              className="text-xs sm:text-sm font-extrabold font-arabic truncate max-w-36 sm:max-w-xs md:max-w-sm"
              style={{ color: 'var(--app-text)' }}
              title={chapterTitle || 'إمتاع القارئ'}
            >
              {chapterTitle || 'إمتاع القارئ'}
            </h1>

            {/* Clickable Chapter / Page Jump Pill */}
            <button
              onClick={onOpenTOC}
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-arabic font-bold transition-all opacity-85 hover:opacity-100 cursor-pointer w-fit text-right"
              style={{ color: 'var(--app-brand)' }}
              title="فتح فهرس المحتويات وتغيير الصفحة"
            >
              <span className="hidden md:inline font-medium" style={{ color: 'var(--app-text-muted)' }}>
                إمتاع القارئ •
              </span>
              <span>ص {currentPage}</span>
              <span className="opacity-60 font-normal">من {totalPages}</span>
              <ChevronDown className="w-3 h-3 opacity-75 inline" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            2. CENTER: Reading Progress Indicator (Desktop / Tablet)
            ══════════════════════════════════════════════════ */}
        <div
          onClick={onOpenTOC}
          className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-2xs transition-all hover:scale-102 cursor-pointer"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
          title="عرض فهرس الصفحات ومستوى الإنجاز"
        >
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--app-brand-dim)' }}>
            <BookOpen className="w-2.5 h-2.5" style={{ color: 'var(--app-brand)' }} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-arabic">
            <span className="font-medium" style={{ color: 'var(--app-text-muted)' }}>إنجاز القراءة:</span>
            <span className="font-black font-sans" style={{ color: 'var(--app-brand)' }}>{progressPercent}%</span>
          </div>
          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: 'var(--app-brand-grad)' }}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            3. LEFT / END: Curated Actions & Tools Suite Hub
            ══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Quick Table of Contents (Desktop/Tablet) */}
          <button
            onClick={onOpenTOC}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 active:scale-95 font-arabic text-xs font-bold border cursor-pointer hover:brightness-105"
            style={{
              background: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              color: 'var(--app-text)',
            }}
            title="فهرس فصول وأبواب الكتاب"
          >
            <List className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
            <span className="hidden xl:inline">الفهرس</span>
          </button>

          {/* Audio TTS Toggle */}
          <button
            onClick={onToggleReadingAloud}
            className="w-9 h-9 sm:w-auto sm:px-2.5 sm:py-1.5 flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 active:scale-95 font-arabic text-xs font-bold border cursor-pointer"
            style={{
              background: isReadingAloud ? 'rgba(16, 185, 129, 0.15)' : 'var(--app-surface)',
              borderColor: isReadingAloud ? 'rgba(16, 185, 129, 0.4)' : 'var(--app-surface-border)',
              color: isReadingAloud ? '#059669' : 'var(--app-text)',
            }}
            title={isReadingAloud ? 'إيقاف القراءة الصوتية' : 'تشغيل القراءة الصوتية الذكية'}
          >
            {isReadingAloud ? (
              <div className="relative flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            ) : (
              <VolumeX className="w-4 h-4 opacity-70" />
            )}
            <span className="hidden xl:inline">{isReadingAloud ? 'جاري الاستماع' : 'استماع'}</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={onToggleBookmark}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 border cursor-pointer shrink-0"
            style={{
              background: isBookmarked ? 'var(--app-brand-dim)' : 'var(--app-surface)',
              borderColor: isBookmarked ? 'var(--app-brand)' : 'var(--app-surface-border)',
              color: isBookmarked ? 'var(--app-brand)' : 'var(--app-text-muted)',
            }}
            title={isBookmarked ? 'الصفحة محفوظة في العلامات المرجعية' : 'إضافة إلى العلامات المرجعية'}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform duration-200 ${
                isBookmarked ? 'fill-amber-500 text-amber-500 scale-110' : ''
              }`}
            />
          </button>

          {/* Quick Theme Changer */}
          <TopThemeChanger />

          {/* Typography & Appearance Settings */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 font-arabic text-xs font-bold border cursor-pointer hover:brightness-105"
            style={{
              background: 'var(--app-brand-dim)',
              borderColor: 'var(--app-brand-border)',
              color: 'var(--app-brand)',
            }}
            title="تخصيص الخط، الحجم، والمظهر"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">الخط والمظهر</span>
          </button>

          {/* ══════════════════════════════════════════════════
              UNIFIED HERITAGE TOOLS SUITE (POPOVER FOR DESKTOP & MOBILE)
              ══════════════════════════════════════════════════ */}
          <Popover.Root open={isToolsOpen} onOpenChange={setIsToolsOpen}>
            <Popover.Trigger asChild>
              <button
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 font-arabic text-xs font-bold border cursor-pointer relative shadow-sm hover:brightness-105"
                style={{
                  background: isToolsOpen ? 'var(--app-brand-grad)' : 'var(--app-surface)',
                  borderColor: isToolsOpen ? 'transparent' : 'var(--app-surface-border)',
                  color: isToolsOpen ? 'white' : 'var(--app-text)',
                }}
                title="أدوات القارئ والشارح التراثي"
              >
                <Sparkles className={`w-4 h-4 ${isToolsOpen ? 'text-amber-200' : 'text-amber-500'} animate-pulse`} />
                <span className="hidden sm:inline">الأدوات</span>
                <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="z-50 w-80 sm:w-96 rounded-3xl p-3 sm:p-4 shadow-2xl border backdrop-blur-2xl animate-fade-in focus:outline-none max-h-[85vh] overflow-y-auto custom-scrollbar"
                style={{
                  background: 'var(--app-surface)',
                  borderColor: 'var(--app-surface-border)',
                  color: 'var(--app-text)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
                }}
                sideOffset={10}
                align="end"
                dir="rtl"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--app-divider)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--app-brand-dim)' }}>
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
                    </div>
                    <div>
                      <h3 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                        أدوات القارئ التفاعلية
                      </h3>
                      <p className="text-[10px] font-arabic font-medium" style={{ color: 'var(--app-text-muted)' }}>
                        تسهيل التدبر، الحفظ، وتوثيق الفوائد
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-arabic font-bold px-2 py-0.5 rounded-full border" style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-divider)', color: 'var(--app-brand)' }}>
                    9 أدوات
                  </span>
                </div>

                {/* 2-Column Responsive Grid of Heritage Tools */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {toolsList.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setIsToolsOpen(false);
                          tool.action();
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-200 active:scale-95 text-right hover:scale-101 hover:shadow-sm cursor-pointer group"
                        style={{
                          background: 'var(--app-bg-2)',
                          borderColor: 'var(--app-divider)',
                        }}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${tool.bg} ${tool.border} ${tool.color} shadow-xs`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                              {tool.label}
                            </span>
                            {tool.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-arabic truncate font-medium mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                            {tool.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Chapter TOC Footer Row */}
                <div className="mt-3 pt-2.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--app-divider)' }}>
                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenTOC();
                    }}
                    className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-arabic text-xs font-bold transition-all hover:brightness-105 cursor-pointer"
                    style={{
                      background: 'var(--app-brand-dim)',
                      color: 'var(--app-brand)',
                    }}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>فتح فهرس الكتاب الكامل</span>
                  </button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </header>
  );
};
