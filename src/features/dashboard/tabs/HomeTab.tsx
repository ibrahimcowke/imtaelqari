import React, { useState, useEffect } from 'react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import { db } from '../../../lib/db';
import {
  BookOpen, Dices, Copy, Check, Share2, Star,
  Flame, Play, Pause, RotateCcw, Sparkles,
  Music, BookMarked, Layers, Clock,
  ChevronLeft, Bell, Trophy, Lightbulb, Mic
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
import {
  calculateStreak,
  checkInToday,
  isCheckedInToday,
  getRollingWeekDays,
  getCheckinHistory,
  type DayStatus,
} from '../../../services/streakService';
import { sendInstantNotification } from '../../../services/notificationService';

const CURATED_WISDOMS = [
  {
    text: "والحكمة من أجلّ ما يمكن أن يمنحه الله للإنسان بعد الإيمان بالله والتحلي بمكارم الأخلاق، وهي أمل كل الناجحين.",
    page: 1,
    source: "المقدمة",
  },
  {
    text: "الكلم الطيب تحمله قدرات وقوى الجمال.. فهو يحمل أجمل المعاني الروحية التي لا تتأثر بالضغوط ولا بالأوزان.",
    page: 2,
    source: "جمال الكلم",
  },
  {
    text: "إن من البيان لسحراً وإن من الشعر لحكمة.. وهذا لقاء السحاب حيث تحمل الكلمة روعة الحكمة ونقاء الفكر.",
    page: 3,
    source: "روائع الحكم",
  },
  {
    text: "أودعت بين طيات هذا الكتاب ما استحسنته من وجهة نظري، وما ازدانت به أمهات الكتب ومن أبلغ ما سالت به الأقلام.",
    page: 4,
    source: "إمتاع القارئ",
  },
  {
    text: "ليس العاقل الذي يعرف الخير من الشر، ولكنه الذي يعرف خير الشرين إذا نزل به البلاء.",
    page: 12,
    source: "الحكمة في التعامل",
  },
  {
    text: "الصبر مطية لا تكبو، والحلم رداء لا يبلى، وعزة النفس تاج لا يزول بريقه.",
    page: 25,
    source: "أخلاق الكرام",
  },
  {
    text: "العلم بلا عمل كالشجر بلا ثمر، وحسن الخلق يذيب الخطايا كما تذيب الشمس الجليد.",
    page: 34,
    source: "ثمرات المعرفة",
  },
  {
    text: "لسانك حصانك إن صنته صانك وإن خنته خانك.. وجمال المنطق زينة العقول.",
    page: 48,
    source: "أدب الحديث",
  },
];

export const HomeTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { currentPage, setCurrentPage } = useReaderStore();
  const totalPages = bookDataService.getPages().length;
  const progress = Math.round((currentPage / totalPages) * 100);
  const book = bookDataService.getBookInfo();
  const currentPageData = bookDataService.getPage(currentPage);

  // Quote State
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [savedStar, setSavedStar] = useState(false);

  // Daily Streak State (Real Calendar Days)
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

  // Focus Timer State
  const [timerDuration, setTimerDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Refresh week days and streak on mount
  useEffect(() => {
    setStreak(calculateStreak(getCheckinHistory()));
    setCheckedToday(isCheckedInToday());
    setWeekDays(getRollingWeekDays());
  }, []);

  // Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const selectTimerPreset = (mins: number) => {
    setTimerDuration(mins);
    setTimeLeft(mins * 60);
    setTimerRunning(false);
  };

  const toggleTimer = () => {
    setTimerRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(timerDuration * 60);
  };

  // Real Streak check-in
  const handleCheckIn = () => {
    const { streak: newStreak, isNewCheckin } = checkInToday();
    setStreak(newStreak);
    setCheckedToday(true);
    setWeekDays(getRollingWeekDays());

    if (isNewCheckin) {
      setStreakCelebrate(true);
      sendInstantNotification(
        'إنجاز جديد في سلسلة القراءة 🔥',
        `أحسنت! أتممت قراءة ورد اليوم وأصبحت سلسلتك ${newStreak} أيام متتالية!`
      );
      setTimeout(() => setStreakCelebrate(false), 3500);
    }
  };

  // Random page jump
  const handleRandomPage = () => {
    const randomPage = Math.floor(Math.random() * totalPages) + 1;
    setCurrentPage(randomPage);
    onNavigate();
  };

  // Quote actions
  const nextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % CURATED_WISDOMS.length);
    setCopied(false);
    setSavedStar(false);
  };

  const copyQuote = () => {
    const current = CURATED_WISDOMS[quoteIdx];
    navigator.clipboard.writeText(`«${current.text}»\n— ${current.source} (كتاب إمتاع القارئ)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareQuote = () => {
    const current = CURATED_WISDOMS[quoteIdx];
    if (navigator.share) {
      navigator.share({
        title: 'إمتاع القارئ بجمال الكلم وروائع الحكم',
        text: `«${current.text}»\n— ${current.source}`,
      }).catch(() => copyQuote());
    } else {
      copyQuote();
    }
  };

  const saveQuoteToDb = async () => {
    const current = CURATED_WISDOMS[quoteIdx];
    try {
      await db.quotes.add({
        id: crypto.randomUUID(),
        text: current.text,
        source: current.source,
        page: current.page,
        createdAt: new Date().toISOString(),
      });
      setSavedStar(true);
    } catch {
      setSavedStar(true);
    }
  };

  const jumpToQuotePage = (page: number) => {
    setCurrentPage(page);
    onNavigate();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // SVG circle math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentWisdom = CURATED_WISDOMS[quoteIdx];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* ══════════════════════════════════════════════════
          1. LUXURY HERO BANNER (ISLAMIC & LITERARY SHOWCASE)
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl group p-6 sm:p-8 md:p-10 border shadow-lg transition-all duration-300"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-surface-border)',
        }}
      >
        {/* Subtle Ambient Brand Glows */}
        <div
          className="absolute -top-12 -left-12 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--app-brand-glow) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Information & Reading Status */}
          <div className="flex-1 text-center md:text-right">
            {/* Top pill badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-arabic font-bold mb-3.5 border shadow-xs"
              style={{
                background: 'var(--app-brand-dim)',
                borderColor: 'var(--app-brand-border)',
                color: 'var(--app-brand)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>محراب القراءة والتدبر</span>
            </div>

            {/* Book Title */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-arabic mb-3 leading-tight tracking-tight"
              style={{ color: 'var(--app-text)' }}
            >
              {book.title}
            </h2>

            {/* Current Chapter Preview */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap mb-6">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-arabic font-bold"
                style={{
                  background: 'var(--app-bg-2)',
                  borderColor: 'var(--app-divider)',
                  color: 'var(--app-text)',
                }}
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentPageData?.title ? currentPageData.title : `صفحة ${currentPage}`}</span>
              </div>
              <span className="text-amber-500/60 font-bold">•</span>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-arabic font-medium"
                style={{
                  background: 'var(--app-bg-2)',
                  borderColor: 'var(--app-divider)',
                  color: 'var(--app-text-muted)',
                }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: 'var(--app-brand)' }} />
                <span>ص {currentPage} من {totalPages} صفحة</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <button
                onClick={onNavigate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-arabic text-sm font-bold transition-all duration-300 active:scale-95 text-white shadow-xl hover:brightness-110 group cursor-pointer"
                style={{
                  background: 'var(--app-brand-grad)',
                  boxShadow: '0 6px 24px var(--app-brand-glow)',
                }}
              >
                <BookOpen className="w-4 h-4 text-amber-200" />
                <span>استئناف القراءة</span>
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                onClick={handleRandomPage}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-arabic text-xs font-bold transition-all duration-300 active:scale-95 border cursor-pointer hover:brightness-105"
                style={{
                  background: 'var(--app-brand-dim)',
                  borderColor: 'var(--app-brand-border)',
                  color: 'var(--app-text)',
                }}
                title="اقرأ صفحة أو حكمة عشوائية من الكتاب"
              >
                <Dices className="w-4 h-4 text-amber-500" />
                <span>درة عشوائية</span>
              </button>
            </div>
          </div>

          {/* Progress Circular Gauge */}
          <div className="relative shrink-0 w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="var(--app-divider)"
                strokeWidth="7"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#heroProgressGradient)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
              <defs>
                <linearGradient id="heroProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-sans tracking-tight" style={{ color: 'var(--app-text)' }}>
                {progress}%
              </span>
              <span
                className="text-[11px] font-arabic font-bold px-2 py-0.5 rounded-full border mt-0.5"
                style={{
                  background: 'var(--app-brand-dim)',
                  color: 'var(--app-brand)',
                  borderColor: 'var(--app-brand-border)',
                }}
              >
                مكتمل
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          2. BENTO GRID: DAILY STREAK & FOCUS TIMER
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Daily Streak Tracker */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 flex flex-col justify-between border shadow-sm transition-all relative overflow-hidden"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          {streakCelebrate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center rounded-3xl backdrop-blur-md"
              style={{ background: 'rgba(16, 185, 129, 0.9)', color: 'white' }}
            >
              <Sparkles className="w-8 h-8 mb-2 animate-bounce" />
              <h4 className="text-lg font-bold font-arabic mb-1">مبارك! ورد اليوم مسجل بنجاح 🎉</h4>
              <p className="text-xs font-arabic">سلسلتك الحالية: {streak} أيام متتالية من التدبر</p>
            </motion.div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                </div>
                <div>
                  <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
                    سلسلة القراءة اليومية
                  </h3>
                  <p className="text-xs font-arabic mt-0.5 font-medium" style={{ color: 'var(--app-text-muted)' }}>
                    ثبت عادة القراءة والتدبر اليومي
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Reminder Settings Trigger */}
                <button
                  onClick={() => setIsReminderOpen(true)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
                  style={{
                    background: 'var(--app-brand-dim)',
                    color: 'var(--app-brand)',
                    borderColor: 'var(--app-brand-border)',
                  }}
                  title="ضبط تنبيهات الورد اليومي"
                >
                  <Bell className="w-4 h-4" />
                </button>

                <div className="text-left">
                  <span className="text-2xl font-bold font-sans text-amber-500">
                    {streak}
                  </span>
                  <span className="text-xs font-arabic mr-1 font-semibold" style={{ color: 'var(--app-text-muted)' }}>
                    أيام
                  </span>
                </div>
              </div>
            </div>

            {/* 7-Day Real Calendar Checklist */}
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {weekDays.map((d) => (
                <div
                  key={d.dateStr}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                    d.isCompleted
                      ? 'border-amber-500/40 shadow-sm'
                      : d.isToday
                      ? 'border-dashed border-amber-500/60'
                      : 'border-transparent'
                  }`}
                  style={{
                    background: d.isCompleted
                      ? 'rgba(245, 158, 11, 0.14)'
                      : d.isToday
                      ? 'var(--app-brand-dim)'
                      : 'var(--app-bg-2)',
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-sans ${
                      d.isCompleted
                        ? 'bg-amber-500 text-white shadow-sm'
                        : d.isToday
                        ? 'border-2 border-amber-500 text-amber-600'
                        : ''
                    }`}
                    style={{
                      background: !d.isCompleted && !d.isToday ? 'var(--app-divider)' : undefined,
                      color: !d.isCompleted && !d.isToday ? 'var(--app-text-muted)' : undefined,
                    }}
                  >
                    {d.isCompleted ? '✓' : d.dayNumber}
                  </div>
                  <span
                    className="text-[10px] font-arabic font-bold truncate"
                    style={{
                      color: d.isToday
                        ? 'var(--app-brand)'
                        : d.isCompleted
                        ? 'var(--app-text)'
                        : 'var(--app-text-muted)',
                    }}
                  >
                    {d.isToday ? 'اليوم' : d.dayName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in CTA Button */}
          <button
            onClick={handleCheckIn}
            disabled={checkedToday}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 border shadow-md"
            style={
              checkedToday
                ? { background: 'rgba(16, 185, 129, 0.15)', color: '#0d8f60', borderColor: 'rgba(16, 185, 129, 0.3)' }
                : { background: 'var(--app-brand-grad)', color: 'white', borderColor: 'transparent', boxShadow: '0 4px 14px var(--app-brand-glow)' }
            }
          >
            {checkedToday ? (
              <>
                <Check className="w-4 h-4" />
                <span>أحسنت! أتممت قراءة اليوم</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>تسجيل ورد اليوم في السلسلة (+1)</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Focus Timer & Ambient Companion */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 flex flex-col justify-between border shadow-sm transition-all"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
                    جلسة تركيز وتدبر
                  </h3>
                  <p className="text-xs font-arabic font-medium mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                    حدد وقتاً مخصصاً للقراءة الهادئة
                  </p>
                </div>
              </div>

              {/* Ambient Sound Quick Trigger */}
              <button
                onClick={() => setIsSoundModalOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
                style={{
                  background: 'var(--app-brand-dim)',
                  color: 'var(--app-brand)',
                  borderColor: 'var(--app-brand-border)',
                }}
                title="أصوات الطبيعة والتركيز"
              >
                <Music className="w-4 h-4" />
              </button>
            </div>

            {/* Presets & Digital Display */}
            <div
              className="flex items-center justify-between p-3.5 rounded-2xl mb-4 border"
              style={{
                background: 'var(--app-bg-2)',
                borderColor: 'var(--app-divider)',
              }}
            >
              <div className="flex gap-1.5">
                {[10, 15, 25, 45].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => selectTimerPreset(mins)}
                    className="px-2.5 py-1 rounded-xl text-xs font-arabic font-semibold transition-all border"
                    style={
                      timerDuration === mins && !timerRunning
                        ? { background: 'var(--app-brand-grad)', color: 'white', borderColor: 'transparent', fontWeight: 'bold' }
                        : { background: 'transparent', borderColor: 'transparent', color: 'var(--app-text-muted)' }
                    }
                  >
                    {mins} د
                  </button>
                ))}
              </div>

              <div className="font-mono text-2xl font-bold tracking-wider" style={{ color: 'var(--app-text)' }}>
                {formatTimer(timeLeft)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-xs font-bold text-white transition-all active:scale-95 shadow-md"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 4px 16px var(--app-brand-glow)',
              }}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>بدء جلسة القراءة</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 border opacity-70 hover:opacity-100"
              style={{
                background: 'var(--app-brand-dim)',
                borderColor: 'var(--app-brand-border)',
                color: 'var(--app-brand)',
              }}
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. ILLUMINATED WISDOM OF THE DAY (درة من الكتاب)
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 sm:p-7 relative overflow-hidden border shadow-md transition-all"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-surface-border)',
        }}
      >
        {/* Right Gold Accent Bar */}
        <div
          className="absolute right-0 top-6 bottom-6 w-1.5 rounded-full"
          style={{ background: 'var(--app-brand-grad)' }}
        />

        <div className="pr-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <span className="font-arabic font-bold text-sm" style={{ color: 'var(--app-brand)' }}>
                درر من الكتاب ({quoteIdx + 1} من {CURATED_WISDOMS.length})
              </span>
            </div>

            <button
              onClick={nextQuote}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-arabic text-xs font-medium transition-all active:scale-90 border"
              style={{
                background: 'var(--app-brand-dim)',
                borderColor: 'var(--app-brand-border)',
                color: 'var(--app-brand)',
              }}
            >
              <Dices className="w-3.5 h-3.5" />
              <span>حكمة أخرى</span>
            </button>
          </div>

          {/* Quote Text */}
          <blockquote
            className="font-arabic text-base sm:text-lg leading-relaxed mb-5 text-justify font-medium"
            style={{ color: 'var(--app-text)' }}
          >
            «{currentWisdom.text}»
          </blockquote>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-between pt-4 border-t flex-wrap gap-2"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <button
              onClick={() => jumpToQuotePage(currentWisdom.page)}
              className="text-xs font-arabic font-semibold opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1 underline underline-offset-4"
              style={{ color: 'var(--app-brand)' }}
            >
              <span>— {currentWisdom.source} (ص {currentWisdom.page})</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={copyQuote}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
                style={{
                  background: 'var(--app-bg-2)',
                  borderColor: 'var(--app-divider)',
                  color: 'var(--app-text)',
                }}
                title="نسخ الحكمة"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={shareQuote}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
                style={{
                  background: 'var(--app-bg-2)',
                  borderColor: 'var(--app-divider)',
                  color: 'var(--app-text)',
                }}
                title="مشاركة"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={saveQuoteToDb}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 border"
                style={{
                  background: 'var(--app-bg-2)',
                  borderColor: 'var(--app-divider)',
                  color: savedStar ? '#f59e0b' : 'var(--app-text)',
                }}
                title="حفظ في المفضلة"
              >
                <Star className={`w-3.5 h-3.5 ${savedStar ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setIsCardStudioOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-arabic text-xs font-bold transition-all active:scale-90 text-white shadow-md"
                style={{ background: 'var(--app-brand-grad)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تصميم بطاقة</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          4. DISCOVERY TILES (أدوات الاستكشاف المتقدمة)
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Reading Khatmas */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsKhatmaOpen(true)}
          className="rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
              ختمات القراءة والأوراد
            </h4>
            <p className="text-xs font-arabic mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              أوراد يومية وتحديات إتمام الكتاب
            </p>
          </div>
        </motion.div>

        {/* Flashcards & Quiz */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsFlashcardsOpen(true)}
          className="rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0 shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
              بطاقات المراجعة والحفظ
            </h4>
            <p className="text-xs font-arabic mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              بطاقات تفاعلية لتثبيت الحكم والفوائد
            </p>
          </div>
        </motion.div>

        {/* AI Heritage Companion */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsCompanionOpen(true)}
          className="rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0 shadow-sm">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
              الشارح التراثي والمعاني
            </h4>
            <p className="text-xs font-arabic mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              تفسير الألفاظ والفوائد البلاغية
            </p>
          </div>
        </motion.div>

        {/* Voice Studio */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsVoiceStudioOpen(true)}
          className="rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0 shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
              استوديو التسجيل الصوتي
            </h4>
            <p className="text-xs font-arabic mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              سجّل قراءتك العذبة ومشاركتها
            </p>
          </div>
        </motion.div>

        {/* Ambient Sounds */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsSoundModalOpen(true)}
          className="rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-teal-500/10 text-teal-500 border border-teal-500/20 shrink-0 shadow-sm">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
              أصوات التركيز والطبيعة
            </h4>
            <p className="text-xs font-arabic mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              مطر، هدوء، ومكتبة تراثية
            </p>
          </div>
        </motion.div>

        {/* Lexicon */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsDictModalOpen(true)}
          className="rounded-2xl p-4 cursor-pointer flex items-center gap-3.5 border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-98"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 shadow-sm">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
              المعجم اللغوي
            </h4>
            <p className="text-xs font-arabic mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
              شرح غريب الألفاظ والمفردات
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
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
    </motion.div>
  );
};
