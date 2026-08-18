import React, { useState, useEffect } from 'react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import { db } from '../../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BookOpen, Dices, Copy, Check, Share2, Star,
  Flame, Sparkles, Music, BookMarked, Layers, Clock,
  Trophy, Lightbulb, Mic,
  Users, Music2, Film, Database, ArrowRight, ArrowLeft,
  Volume2, Bookmark
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { QuoteCardModal } from '../../quote-studio/QuoteCardModal';
import { AmbientSoundModal } from '../../audio/AmbientSoundModal';
import { ArabicDictionaryModal } from '../../dictionary/ArabicDictionaryModal';
import { TopicsModal } from '../../topics/TopicsModal';
import { ReminderModal } from '../../reminders/ReminderModal';
import { KhatmaModal } from '../../khatma/KhatmaModal';
import { FlashcardsModal } from '../../flashcards/FlashcardsModal';
import { AIHeritageCompanionModal } from '../../companion/AIHeritageCompanionModal';
import { VoiceStudioModal } from '../../voice-studio/VoiceStudioModal';
import { HeritageQuizModal } from '../../quiz/HeritageQuizModal';
import { BiographiesModal } from '../../biographies/BiographiesModal';
import { PoeticMeterModal } from '../../poetry/PoeticMeterModal';
import { ReelsStudioModal } from '../../reels/ReelsStudioModal';
import { ZenReaderModal } from '../../zen/ZenReaderModal';
import { BackupExportModal } from '../../backup/BackupExportModal';
import { arabicTtsService } from '../../../services/arabicTtsService';
import { useLanguage } from '../../../i18n/LanguageContext';
import {
  calculateStreak,
  checkInToday,
  isCheckedInToday,
  getRollingWeekDays,
  getCheckinHistory,
  type DayStatus,
} from '../../../services/streakService';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const CURATED_WISDOMS = [
  {
    text: "والحكمة من أجلّ ما يمكن أن يمنحه الله للإنسان بعد الإيمان بالله والتحلي بمكارم الأخلاق، وهي أمل كل الناجحين.",
    enText: "Wisdom is among the greatest gifts granted to mankind after faith and virtue, inspiring all who seek true success.",
    page: 1,
    source: "المقدمة",
    enSource: "Introduction",
  },
  {
    text: "الكلم الطيب تحمله قدرات وقوى الجمال.. فهو يحمل أجمل المعاني الروحية التي لا تتأثر بالضغوط ولا بالأوزان.",
    enText: "Goodly words are carried on the wings of beauty, conveying spiritual depths untouched by earthly weight.",
    page: 2,
    source: "جمال الكلم",
    enSource: "Beauty of Words",
  },
  {
    text: "إن من البيان لسحراً وإن من الشعر لحكمة.. وهذا لقاء السحاب حيث تحمل الكلمة روعة الحكمة ونقاء الفكر.",
    enText: "Verily in eloquence there is enchantment, and in poetry there is wisdom — the meeting of pure thought and eloquence.",
    page: 3,
    source: "روائع الحكم",
    enSource: "Gems of Wisdom",
  },
  {
    text: "أودعت بين طيات هذا الكتاب ما استحسنته من وجهة نظري، وما ازدانت به أمهات الكتب ومن أبلغ ما سالت به الأقلام.",
    enText: "Within these pages lie the finest pearls gleaned from classical masterpieces and eloquent pens.",
    page: 4,
    source: "إمتاع القارئ",
    enSource: "Delight of the Reader",
  },
  {
    text: "ليس العاقل الذي يعرف الخير من الشر، ولكنه الذي يعرف خير الشرين إذا نزل به البلاء.",
    enText: "The truly wise is not just one who distinguishes good from evil, but who discerns the lesser evil in times of trial.",
    page: 12,
    source: "الحكمة في التعامل",
    enSource: "Wisdom in Conduct",
  },
  {
    text: "الصبر مطية لا تكبو، والحلم رداء لا يبلى، وعزة النفس تاج لا يزول بريقه.",
    enText: "Patience is a mount that never stumbles, forbearance a cloak that never fades, and dignity a crown that never dims.",
    page: 25,
    source: "أخلاق الكرام",
    enSource: "Noble Character",
  },
  {
    text: "العلم بلا عمل كالشجر بلا ثمر، وحسن الخلق يذيب الخطايا كما تذيب الشمس الجليد.",
    enText: "Knowledge without deed is like a tree without fruit, and noble manners melt misdeeds as the sun melts ice.",
    page: 34,
    source: "ثمرات المعرفة",
    enSource: "Fruits of Knowledge",
  },
  {
    text: "لسانك حصانك إن صنته صانك وإن خنته خانك.. وجمال المنطق زينة العقول.",
    enText: "Your tongue is your steed; guard it and it guards you. Beauty of speech is the ornament of the intellect.",
    page: 48,
    source: "أدب الحديث",
    enSource: "Etiquette of Speech",
  },
];

export const HomeTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { currentPage, setCurrentPage } = useReaderStore();
  const { t, isRTL, dir } = useLanguage();
  const totalPages = bookDataService.getPages().length;
  const progress = Math.round((currentPage / totalPages) * 100);
  const book = bookDataService.getBookInfo();
  const currentPageData = bookDataService.getPage(currentPage);

  // Quote State
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSavedQuote, setIsSavedQuote] = useState(false);

  // Daily Streak State
  const [streak, setStreak] = useState(() => calculateStreak(getCheckinHistory()));
  const [checkedToday, setCheckedToday] = useState(() => isCheckedInToday());
  const [weekDays, setWeekDays] = useState<DayStatus[]>(() => getRollingWeekDays());
  const [streakCelebrate, setStreakCelebrate] = useState(false);

  // Feature Modals
  const [isCardStudioOpen, setIsCardStudioOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isKhatmaOpen, setIsKhatmaOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [isPoetryOpen, setIsPoetryOpen] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Live Query for Recent Bookmarks
  const recentBookmarks = useLiveQuery(
    () => db.bookmarks.orderBy('page').reverse().limit(3).toArray(),
    []
  ) ?? [];

  const currentWisdom = CURATED_WISDOMS[quoteIdx];
  const wisdomText = isRTL ? currentWisdom.text : (currentWisdom.enText || currentWisdom.text);
  const wisdomSource = isRTL ? currentWisdom.source : (currentWisdom.enSource || currentWisdom.source);

  // Refresh week days and streak on mount
  useEffect(() => {
    setStreak(calculateStreak(getCheckinHistory()));
    setCheckedToday(isCheckedInToday());
    setWeekDays(getRollingWeekDays());
  }, []);

  const handleNextWisdom = () => {
    setQuoteIdx((prev) => (prev + 1) % CURATED_WISDOMS.length);
    setCopied(false);
    setIsSavedQuote(false);
  };

  const handleCopyWisdom = () => {
    navigator.clipboard.writeText(`«${wisdomText}» — ${wisdomSource} (إمتاع القارئ)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListenWisdom = () => {
    arabicTtsService.readText(currentWisdom.text);
  };

  const handleShareWisdom = async () => {
    const textToShare = `«${wisdomText}»\n— ${wisdomSource} (كتاب إمتاع القارئ)\nhttps://imtaelqari.vercel.app`;
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: 'درة من إمتاع القارئ',
          text: textToShare,
          dialogTitle: 'مشاركة الحكمة',
        });
      } catch {
        handleCopyWisdom();
      }
    } else {
      handleCopyWisdom();
    }
  };

  const handleSaveQuote = async () => {
    try {
      await db.quotes.add({
        id: crypto.randomUUID(),
        text: currentWisdom.text,
        page: currentWisdom.page,
        heading: currentWisdom.source,
        createdAt: new Date().toISOString(),
      });
      setIsSavedQuote(true);
      setTimeout(() => setIsSavedQuote(false), 2500);
    } catch {
      // Ignore duplicates
    }
  };

  const handleDailyCheckIn = () => {
    checkInToday();
    setCheckedToday(true);
    setStreak(calculateStreak(getCheckinHistory()));
    setWeekDays(getRollingWeekDays());
    setStreakCelebrate(true);
    setTimeout(() => setStreakCelebrate(false), 3000);
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (isRTL) {
      if (hour >= 5 && hour < 12) return 'صباح الخير والمسرات 🌿';
      if (hour >= 12 && hour < 17) return 'طاب يومك بكل خير ✨';
      if (hour >= 17 && hour < 22) return 'مساء النور والسكينة 🌙';
      return 'أهلاً بك في خلوة القراءة والتدبر 🌌';
    } else {
      if (hour >= 5 && hour < 12) return 'Good Morning 🌿';
      if (hour >= 12 && hour < 17) return 'Good Afternoon ✨';
      if (hour >= 17 && hour < 22) return 'Good Evening 🌙';
      return 'Welcome to Serene Reading 🌌';
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const NavArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-5xl mx-auto pb-12 select-none"
      dir={dir}
    >
      {/* ══════════════════════════════════════════════════
          1. ULTRA-LUXURY HERO READ CARD
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="rounded-[32px] p-6 sm:p-8 relative overflow-hidden border shadow-2xl transition-all duration-300 group"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-surface-border)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Ambient Glows */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'var(--app-brand)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'var(--app-brand)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 min-w-0 flex-1">
            {/* Top Greeting Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-arabic font-bold px-3 py-1 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-2xs">
                {getGreeting()}
              </span>
              <span className="text-xs font-sans font-bold opacity-60">
                {t('page')} {currentPage} {t('of')} {totalPages}
              </span>
            </div>

            {/* Book Title & Current Snippet */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-arabic leading-tight tracking-tight" style={{ color: 'var(--app-text)' }}>
                {currentPageData?.title || t('app_title')}
              </h2>
              <p className="text-xs sm:text-sm font-arabic opacity-75 line-clamp-2 mt-1.5 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                {currentPageData?.blocks?.[0]?.text || currentPageData?.display_text?.slice(0, 160) || t('app_desc')}
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-1 max-w-md">
              <div className="flex justify-between text-[11px] font-arabic font-bold opacity-75">
                <span>{isRTL ? 'مستوى الإنجاز في الكتاب' : 'Book Progress'}</span>
                <span className="font-sans font-black">{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: 'var(--app-brand-grad)' }}
                />
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={onNavigate}
              className="px-6 py-4 rounded-2xl font-arabic font-bold text-sm text-white shadow-xl flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 hover:brightness-110 cursor-pointer group"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 8px 24px var(--app-brand-glow)',
              }}
            >
              <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{t('continue_reading')}</span>
              <NavArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setIsZenOpen(true)}
              className="px-4 py-2.5 rounded-xl font-arabic font-bold text-xs border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer app-surface hover:brightness-105"
              style={{ color: 'var(--app-brand)', borderColor: 'var(--app-brand-border)' }}
            >
              <Clock className="w-4 h-4" />
              <span>{t('tool_zen')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          2. 4-METRIC STATS RIBBON
          ══════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Current Page */}
        <div
          className="p-4 rounded-2xl border app-surface flex items-center gap-3.5 shadow-sm transition-all hover:scale-102"
          style={{ borderColor: 'var(--app-surface-border)' }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-arabic font-bold opacity-70 block" style={{ color: 'var(--app-text-muted)' }}>
              {t('pages_read')}
            </span>
            <span className="text-xl font-black font-sans tracking-tight" style={{ color: 'var(--app-text)' }}>
              {currentPage} <span className="text-xs font-normal opacity-60">/ {totalPages}</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Streak Days */}
        <div
          className="p-4 rounded-2xl border app-surface flex items-center gap-3.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
          style={{ borderColor: 'var(--app-surface-border)' }}
          onClick={handleDailyCheckIn}
          title={isRTL ? 'اضغط لتسجيل قراءة اليوم' : 'Click to check in today'}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
            <Flame className={`w-5 h-5 ${streak > 0 ? 'animate-pulse text-amber-500' : ''}`} />
          </div>
          <div>
            <span className="text-[11px] font-arabic font-bold opacity-70 block" style={{ color: 'var(--app-text-muted)' }}>
              {t('streak_days')}
            </span>
            <span className="text-xl font-black font-sans tracking-tight text-rose-500 flex items-center gap-1">
              {streak} <span className="text-xs font-arabic font-bold">{isRTL ? 'أيام' : 'days'}</span>
            </span>
          </div>
        </div>

        {/* Metric 3: Completion */}
        <div
          className="p-4 rounded-2xl border app-surface flex items-center gap-3.5 shadow-sm transition-all hover:scale-102"
          style={{ borderColor: 'var(--app-surface-border)' }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-arabic font-bold opacity-70 block" style={{ color: 'var(--app-text-muted)' }}>
              {isRTL ? 'نسبة الإنجاز' : 'Completion'}
            </span>
            <span className="text-xl font-black font-sans tracking-tight text-emerald-500">
              {progress}%
            </span>
          </div>
        </div>

        {/* Metric 4: Chapters */}
        <div
          className="p-4 rounded-2xl border app-surface flex items-center gap-3.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
          style={{ borderColor: 'var(--app-surface-border)' }}
          onClick={() => setIsTopicsModalOpen(true)}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-arabic font-bold opacity-70 block" style={{ color: 'var(--app-text-muted)' }}>
              {isRTL ? 'فصول الكتاب' : 'Chapters'}
            </span>
            <span className="text-xl font-black font-sans tracking-tight text-sky-500">
              {book.pages} <span className="text-xs font-arabic font-bold">{isRTL ? 'صفحة' : 'pages'}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          2.5. 7-DAY STREAK & HABIT TRACKER
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 border app-surface shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: 'var(--app-surface-border)' }}
      >
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0">
            <Flame className={`w-6 h-6 ${streak > 0 ? 'animate-bounce text-amber-500' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
                {isRTL ? 'سجل القراءة الأسبوعي' : 'Weekly Reading Habit'}
              </h4>
              {streakCelebrate && (
                <span className="text-[10px] font-arabic font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 animate-pulse">
                  {isRTL ? '✨ تم تسجيل قراءة اليوم!' : '✨ Checked in today!'}
                </span>
              )}
            </div>
            <p className="text-xs font-arabic opacity-70 mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              {checkedToday
                ? (isRTL ? 'أحسنت! حافظ على تتابعك المعرفي المبارك.' : 'Great job! Keep your knowledge streak alive.')
                : (isRTL ? 'اقرأ بضع صفحات اليوم وسجل حضورك لتنمية تتابعك.' : 'Read a few pages today and check in to grow your streak.')}
            </p>
          </div>
        </div>

        {/* 7-Day Dots Ribbon & Check-in CTA */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-arabic opacity-60">
                  {d.dayName}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    d.isCompleted
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : d.isToday
                      ? 'border-2 border-amber-500 text-amber-500'
                      : 'bg-black/10 dark:bg-white/10 opacity-50 text-white/70'
                  }`}
                >
                  {d.isCompleted ? '✓' : d.dayNumber}
                </div>
              </div>
            ))}
          </div>

          {!checkedToday && (
            <button
              onClick={handleDailyCheckIn}
              className="px-3.5 py-2 rounded-xl text-xs font-arabic font-bold text-white transition-all active:scale-95 cursor-pointer shadow-md shrink-0 mr-1"
              style={{ background: 'var(--app-brand-grad)' }}
            >
              {isRTL ? 'تسجيل اليوم' : 'Check In'}
            </button>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          3. DAILY WISDOM SANCTUARY (درة وحكمة اليوم)
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 border app-surface relative overflow-hidden shadow-lg space-y-4"
        style={{ borderColor: 'var(--app-surface-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
                {isRTL ? 'درة وحكمة اليوم' : 'Daily Pearl of Wisdom'}
              </h3>
              <p className="text-[10px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
                {wisdomSource} • {t('page')} {currentWisdom.page}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextWisdom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-arabic font-bold transition-all active:scale-90 hover:brightness-105 cursor-pointer app-surface"
            style={{ color: 'var(--app-brand)', borderColor: 'var(--app-brand-border)' }}
            title={isRTL ? 'حكمة أخرى' : 'Next wisdom'}
          >
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? 'تبديل' : 'Shuffle'}</span>
          </button>
        </div>

        {/* Wisdom Content */}
        <blockquote
          className="text-base sm:text-lg font-arabic font-bold leading-relaxed pr-3 pl-3 border-r-4 rounded-xl py-2 my-2"
          style={{
            borderColor: 'var(--app-brand)',
            background: 'var(--app-brand-dim)',
            color: 'var(--app-text)',
          }}
        >
          «{wisdomText}»
        </blockquote>

        {/* Wisdom Quick Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t" style={{ borderColor: 'var(--app-divider)' }}>
          <div className="flex items-center gap-1.5">
            {/* Listen */}
            <button
              onClick={handleListenWisdom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-arabic font-bold border transition-all active:scale-95 cursor-pointer app-surface hover:brightness-105 text-emerald-500"
              style={{ borderColor: 'var(--app-surface-border)' }}
              title={t('listen_aloud')}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t('popover_listen')}</span>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopyWisdom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-arabic font-bold border transition-all active:scale-95 cursor-pointer app-surface hover:brightness-105"
              style={{ borderColor: 'var(--app-surface-border)', color: 'var(--app-text)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
              <span>{copied ? t('popover_copied') : t('popover_copy')}</span>
            </button>

            {/* Save to Favorites */}
            <button
              onClick={handleSaveQuote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-arabic font-bold border transition-all active:scale-95 cursor-pointer app-surface hover:brightness-105 text-amber-500"
              style={{ borderColor: 'var(--app-surface-border)' }}
              title={isRTL ? 'حفظ في المفضلة' : 'Save quote'}
            >
              <Star className={`w-3.5 h-3.5 ${isSavedQuote ? 'fill-amber-500' : ''}`} />
              <span>{isSavedQuote ? (isRTL ? 'محفوظ' : 'Saved') : (isRTL ? 'حفظ' : 'Favorite')}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Create Quote Card */}
            <button
              onClick={() => setIsCardStudioOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-arabic font-bold shadow-sm transition-all active:scale-95 cursor-pointer text-white"
              style={{ background: 'var(--app-brand-grad)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('tool_quote_studio')}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShareWisdom}
              className="p-2 rounded-xl border transition-all active:scale-95 cursor-pointer app-surface hover:brightness-105"
              style={{ borderColor: 'var(--app-surface-border)', color: 'var(--app-text)' }}
              title={t('share')}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          4. 6 MASTERPIECE HERITAGE FEATURES (GRID)
          ══════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-arabic font-extrabold text-sm sm:text-base" style={{ color: 'var(--app-text)' }}>
              {isRTL ? 'روائع الواحات والأدوات التراثية' : 'Heritage Master Suites & Tools'}
            </h3>
          </div>
          <span className="text-xs font-arabic font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            6 {isRTL ? 'ميزات رائدة' : 'Master Features'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Feature 1: Quiz */}
          <div
            onClick={() => setIsQuizOpen(true)}
            className="rounded-3xl p-5 border app-surface shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
                <Trophy className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {isRTL ? 'تحدي وألغاز' : 'Quiz'}
              </span>
            </div>
            <h4 className="font-arabic font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--app-text)' }}>
              {t('tool_quiz')}
            </h4>
            <p className="text-xs font-arabic opacity-70 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {t('tool_quiz_desc')}
            </p>
          </div>

          {/* Feature 2: Biographies */}
          <div
            onClick={() => setIsBioOpen(true)}
            className="rounded-3xl p-5 border app-surface shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/15 text-blue-500 border border-blue-500/30 shadow-sm">
                <Users className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-500 border border-blue-500/30">
                {isRTL ? 'معجم الأعلام' : 'Figures'}
              </span>
            </div>
            <h4 className="font-arabic font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--app-text)' }}>
              {t('tool_biographies')}
            </h4>
            <p className="text-xs font-arabic opacity-70 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {t('tool_biographies_desc')}
            </p>
          </div>

          {/* Feature 3: Poetic Meter */}
          <div
            onClick={() => setIsPoetryOpen(true)}
            className="rounded-3xl p-5 border app-surface shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 shadow-sm">
                <Music2 className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                {isRTL ? 'علم العروض' : 'Prosody'}
              </span>
            </div>
            <h4 className="font-arabic font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--app-text)' }}>
              {t('tool_poetry')}
            </h4>
            <p className="text-xs font-arabic opacity-70 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {t('tool_poetry_desc')}
            </p>
          </div>

          {/* Feature 4: Reels Studio */}
          <div
            onClick={() => setIsReelsOpen(true)}
            className="rounded-3xl p-5 border app-surface shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/15 text-rose-500 border border-rose-500/30 shadow-sm">
                <Film className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30">
                9:16 HD
              </span>
            </div>
            <h4 className="font-arabic font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--app-text)' }}>
              {t('tool_reels')}
            </h4>
            <p className="text-xs font-arabic opacity-70 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {t('tool_reels_desc')}
            </p>
          </div>

          {/* Feature 5: Zen Mode */}
          <div
            onClick={() => setIsZenOpen(true)}
            className="rounded-3xl p-5 border app-surface shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-sm">
                <Clock className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Pomodoro
              </span>
            </div>
            <h4 className="font-arabic font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--app-text)' }}>
              {t('tool_zen')}
            </h4>
            <p className="text-xs font-arabic opacity-70 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {t('tool_zen_desc')}
            </p>
          </div>

          {/* Feature 6: Backup & Booklet */}
          <div
            onClick={() => setIsBackupOpen(true)}
            className="rounded-3xl p-5 border app-surface shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-98 cursor-pointer group relative overflow-hidden"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-teal-500/15 text-teal-500 border border-teal-500/30 shadow-sm">
                <Database className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-500 border border-teal-500/30">
                PDF / JSON
              </span>
            </div>
            <h4 className="font-arabic font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--app-text)' }}>
              {t('tool_backup')}
            </h4>
            <p className="text-xs font-arabic opacity-70 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
              {t('tool_backup_desc')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          5. SECONDARY STUDY OASIS (COMPANION, LEXICON, SOUNDS...)
          ══════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <BookMarked className="w-4 h-4 text-emerald-500" />
          <h3 className="font-arabic font-extrabold text-sm sm:text-base" style={{ color: 'var(--app-text)' }}>
            {isRTL ? 'أدوات الاستيعاب والحفظ الصوتي' : 'Study & Audio Tools'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* AI Companion */}
          <div
            onClick={() => setIsCompanionOpen(true)}
            className="p-4 rounded-2xl border app-surface flex items-center gap-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-500 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                {t('tool_companion')}
              </h4>
              <p className="text-[10px] font-arabic opacity-70 truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {t('tool_companion_desc')}
              </p>
            </div>
          </div>

          {/* Dictionary */}
          <div
            onClick={() => setIsDictModalOpen(true)}
            className="p-4 rounded-2xl border app-surface flex items-center gap-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/15 text-indigo-500 shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                {t('tool_dictionary')}
              </h4>
              <p className="text-[10px] font-arabic opacity-70 truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {t('tool_dictionary_desc')}
              </p>
            </div>
          </div>

          {/* Flashcards */}
          <div
            onClick={() => setIsFlashcardsOpen(true)}
            className="p-4 rounded-2xl border app-surface flex items-center gap-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-500 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                {t('tool_flashcards')}
              </h4>
              <p className="text-[10px] font-arabic opacity-70 truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {t('tool_flashcards_desc')}
              </p>
            </div>
          </div>

          {/* Khatma Goals */}
          <div
            onClick={() => setIsKhatmaOpen(true)}
            className="p-4 rounded-2xl border app-surface flex items-center gap-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-500/15 text-yellow-600 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                {t('tool_khatma')}
              </h4>
              <p className="text-[10px] font-arabic opacity-70 truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {t('tool_khatma_desc')}
              </p>
            </div>
          </div>

          {/* Ambient Sounds */}
          <div
            onClick={() => setIsSoundModalOpen(true)}
            className="p-4 rounded-2xl border app-surface flex items-center gap-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/15 text-emerald-500 shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                {t('tool_ambient')}
              </h4>
              <p className="text-[10px] font-arabic opacity-70 truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {t('tool_ambient_desc')}
              </p>
            </div>
          </div>

          {/* Voice Studio */}
          <div
            onClick={() => setIsVoiceStudioOpen(true)}
            className="p-4 rounded-2xl border app-surface flex items-center gap-3 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
            style={{ borderColor: 'var(--app-surface-border)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/15 text-rose-500 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-arabic font-bold text-xs truncate" style={{ color: 'var(--app-text)' }}>
                {t('tool_voice')}
              </h4>
              <p className="text-[10px] font-arabic opacity-70 truncate mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {t('tool_voice_desc')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          6. RECENT SAVED BOOKMARKS REEL (IF ANY)
          ══════════════════════════════════════════════════ */}
      {recentBookmarks.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <h3 className="font-arabic font-extrabold text-sm" style={{ color: 'var(--app-text)' }}>
                {t('recents_bookmarks')}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentBookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => {
                  setCurrentPage(bm.page);
                  onNavigate();
                }}
                className="p-4 rounded-2xl border app-surface shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer flex flex-col justify-between"
                style={{ borderColor: 'var(--app-surface-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-arabic font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {t('page')} {bm.page}
                  </span>
                  <span className="text-[10px] opacity-60 font-sans">
                    {new Date(bm.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-arabic opacity-80 line-clamp-2 leading-relaxed" style={{ color: 'var(--app-text)' }}>
                  {bm.preview || t('app_title')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════
          ALL FULL HERITAGE FEATURE MODALS
          ══════════════════════════════════════════════════ */}
      <QuoteCardModal
        open={isCardStudioOpen}
        onOpenChange={setIsCardStudioOpen}
        quoteText={currentWisdom.text}
        sourceText={currentWisdom.source}
        pageNumber={currentWisdom.page}
      />
      <AmbientSoundModal
        open={isSoundModalOpen}
        onOpenChange={setIsSoundModalOpen}
      />
      <ArabicDictionaryModal
        open={isDictModalOpen}
        onOpenChange={setIsDictModalOpen}
      />
      <TopicsModal
        open={isTopicsModalOpen}
        onOpenChange={setIsTopicsModalOpen}
        onNavigate={onNavigate}
      />
      <ReminderModal
        open={isReminderOpen}
        onOpenChange={setIsReminderOpen}
      />
      <KhatmaModal
        open={isKhatmaOpen}
        onOpenChange={setIsKhatmaOpen}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          onNavigate();
        }}
      />
      <FlashcardsModal
        open={isFlashcardsOpen}
        onOpenChange={setIsFlashcardsOpen}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          onNavigate();
        }}
      />
      <AIHeritageCompanionModal
        open={isCompanionOpen}
        onOpenChange={setIsCompanionOpen}
        pageNumber={currentPage}
      />
      <VoiceStudioModal
        open={isVoiceStudioOpen}
        onOpenChange={setIsVoiceStudioOpen}
        pageNumber={currentPage}
      />
      <HeritageQuizModal
        open={isQuizOpen}
        onOpenChange={setIsQuizOpen}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          onNavigate();
        }}
      />
      <BiographiesModal
        open={isBioOpen}
        onOpenChange={setIsBioOpen}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          onNavigate();
        }}
      />
      <PoeticMeterModal
        open={isPoetryOpen}
        onOpenChange={setIsPoetryOpen}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          onNavigate();
        }}
      />
      <ReelsStudioModal
        open={isReelsOpen}
        onOpenChange={setIsReelsOpen}
        defaultQuote={currentWisdom.text}
        defaultAuthor={currentWisdom.source}
      />
      <ZenReaderModal
        open={isZenOpen}
        onOpenChange={setIsZenOpen}
        currentPage={currentPage}
        onNavigateToPage={(p) => {
          setCurrentPage(p);
          onNavigate();
        }}
      />
      <BackupExportModal
        open={isBackupOpen}
        onOpenChange={setIsBackupOpen}
      />
    </motion.div>
  );
};
