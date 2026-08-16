import React, { useState, useEffect } from 'react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import { db } from '../../../lib/db';
import {
  BookOpen, Dices, Copy, Check, Share2, Star,
  Flame, Play, Pause, RotateCcw, Sparkles,
  Music, BookMarked, Layers, Clock,
  ChevronLeft
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { QuoteCardModal } from '../../quote-studio/QuoteCardModal';
import { AmbientSoundModal } from '../../audio/AmbientSoundModal';
import { ArabicDictionaryModal } from '../../dictionary/ArabicDictionaryModal';
import { TopicsModal } from '../../topics/TopicsModal';

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

const DAYS_AR = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

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

  // Daily Streak State
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('reading_streak') || '3', 10);
  });
  const [checkedToday, setCheckedToday] = useState(() => {
    const lastDate = localStorage.getItem('last_read_date');
    return lastDate === new Date().toDateString();
  });

  // Focus Timer State
  const [timerDuration, setTimerDuration] = useState(15); // in minutes
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Feature Modals
  const [isCardStudioOpen, setIsCardStudioOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);

  // Countdown effect
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

  // Streak check-in
  const handleCheckIn = () => {
    if (!checkedToday) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCheckedToday(true);
      localStorage.setItem('reading_streak', newStreak.toString());
      localStorage.setItem('last_read_date', new Date().toDateString());
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
  const radius = 52;
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
          1. LUXURY HERO BANNER & READING SHOWCASE
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl group p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #2a1c16 0%, #3d2822 45%, #4e3328 100%)',
          boxShadow: '0 12px 48px rgba(42,28,22,0.4), 0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(163,124,108,0.25)',
        }}
      >
        {/* Glow Spheres */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-25 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a37c6c 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #d2bab0 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left / Info Side */}
          <div className="flex-1 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-arabic font-semibold mb-3"
              style={{ background: 'rgba(163,124,108,0.25)', border: '1px solid rgba(163,124,108,0.4)', color: '#e0cec7' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>متابعة القراءة والتدبر</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-arabic text-white mb-2 leading-snug">
              {book.title}
            </h2>
            <p className="text-brand-300/80 font-arabic text-xs md:text-sm mb-5 flex items-center justify-center md:justify-start gap-2">
              <span>{currentPageData?.title ? currentPageData.title : `صفحة ${currentPage}`}</span>
              <span className="opacity-40">•</span>
              <span>صفحة {currentPage} من {totalPages}</span>
            </p>

            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
              <button
                onClick={onNavigate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-arabic text-sm font-bold transition-all duration-300 active:scale-95 text-white shadow-xl hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #a37c6c, #75594e)',
                  boxShadow: '0 6px 20px rgba(163,124,108,0.45)',
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span>استئناف القراءة</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleRandomPage}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-arabic text-xs font-semibold transition-all duration-300 active:scale-95 hover:bg-white/10 text-white/90"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                title="اقرأ صفحة عشوائية من الكتاب"
              >
                <Dices className="w-4 h-4 text-brand-300" />
                <span>درة عشوائية</span>
              </button>
            </div>
          </div>

          {/* Right / Circular Progress Ring */}
          <div className="relative shrink-0 w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={radius} fill="none"
                stroke="url(#heroProgressGrad)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="glow-ring-filter"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
              <defs>
                <linearGradient id="heroProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f5ede8" />
                  <stop offset="100%" stopColor="#a37c6c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold font-sans text-white tracking-tight">{progress}%</span>
              <span className="text-[10px] text-brand-200/70 font-arabic font-medium">مكتمل</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          2. BENTO GRID: STREAK & FOCUS TIMER
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Daily Streak Tracker */}
        <motion.div
          variants={itemVariants}
          className="app-surface rounded-3xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
                    سلسلة القراءة اليومية
                  </h3>
                  <p className="text-xs font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
                    حافظ على عادة القراءة اليومية
                  </p>
                </div>
              </div>

              <div className="text-left">
                <span className="text-2xl font-bold font-sans text-amber-500">
                  {streak}
                </span>
                <span className="text-xs font-arabic mr-1 opacity-70">أيام</span>
              </div>
            </div>

            {/* 7-Day Checklist */}
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {DAYS_AR.map((day, idx) => {
                const isDone = idx < (streak % 7 || 7);
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all"
                    style={{
                      background: isDone ? 'var(--app-brand-dim)' : 'rgba(0,0,0,0.02)',
                      border: isDone ? '1px solid var(--app-brand-border)' : '1px dashed rgba(128,128,128,0.15)',
                    }}
                  >
                    <span className="text-[9px] font-arabic truncate opacity-70">{day}</span>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: isDone ? 'var(--app-brand)' : 'transparent',
                        color: isDone ? 'white' : 'var(--app-text-faint)',
                      }}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Check-in Button */}
          <button
            onClick={handleCheckIn}
            disabled={checkedToday}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 disabled:opacity-65"
            style={checkedToday
              ? { background: 'rgba(16,185,129,0.12)', color: '#0d8f60', border: '1px solid rgba(16,185,129,0.25)' }
              : { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 4px 16px var(--app-brand-glow)' }
            }
          >
            {checkedToday ? (
              <>
                <Check className="w-4 h-4" />
                <span>أحسنت! تم تسجيل قراءة اليوم 🎉</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>سجّل إنجاز قراءة اليوم (+1)</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Focus Timer & Ambient Companion */}
        <motion.div
          variants={itemVariants}
          className="app-surface rounded-3xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
                    جلسة تركيز وتدبر
                  </h3>
                  <p className="text-xs font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
                    حدد وقتاً مخصصاً للقراءة الهادئة
                  </p>
                </div>
              </div>

              {/* Ambient Sound Trigger */}
              <button
                onClick={() => setIsSoundModalOpen(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
                title="تشغيل أصوات الطبيعة"
              >
                <Music className="w-4 h-4" />
              </button>
            </div>

            {/* Presets & Digital Display */}
            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3.5 rounded-2xl mb-4">
              <div className="flex gap-1.5">
                {[10, 15, 25].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => selectTimerPreset(mins)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-arabic font-semibold transition-all ${
                      timerDuration === mins && !timerRunning
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={timerDuration === mins && !timerRunning ? { background: 'var(--app-brand)' } : {}}
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
              style={{ background: 'var(--app-brand-grad)', boxShadow: '0 4px 16px var(--app-brand-glow)' }}
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
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100"
              title="إعادة ضبط"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. WISDOM OF THE DAY (حكمة اليوم)
          ══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="app-surface rounded-3xl p-6 md:p-7 relative overflow-hidden"
      >
        {/* Accent Bar */}
        <div
          className="absolute right-0 top-6 bottom-6 w-1.5 rounded-full"
          style={{ background: 'var(--app-brand-grad)' }}
        />

        <div className="pr-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="font-arabic font-bold text-sm" style={{ color: 'var(--app-brand)' }}>
                درر من الكتاب ({quoteIdx + 1}/{CURATED_WISDOMS.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={nextQuote}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-arabic text-xs font-medium transition-all active:scale-90 bg-black/5 dark:bg-white/5 hover:opacity-100"
                style={{ color: 'var(--app-text-muted)' }}
              >
                <Dices className="w-3.5 h-3.5" />
                <span>حكمة أخرى</span>
              </button>
            </div>
          </div>

          {/* Quote Text */}
          <blockquote className="font-arabic text-base md:text-lg leading-relaxed mb-4 text-justify font-medium" style={{ color: 'var(--app-text)' }}>
            «{currentWisdom.text}»
          </blockquote>

          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
            <button
              onClick={() => jumpToQuotePage(currentWisdom.page)}
              className="text-xs font-arabic opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 underline underline-offset-4"
              style={{ color: 'var(--app-brand)' }}
            >
              <span>— {currentWisdom.source} (ص {currentWisdom.page})</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={copyQuote}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-black/5 dark:bg-white/5"
                title="نسخ الحكمة"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={shareQuote}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-black/5 dark:bg-white/5"
                title="مشاركة"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={saveQuoteToDb}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 bg-black/5 dark:bg-white/5"
                title="حفظ في المفضلة"
              >
                <Star className={`w-3.5 h-3.5 ${savedStar ? 'text-amber-500 fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setIsCardStudioOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-arabic text-xs font-semibold transition-all active:scale-90 text-white shadow-sm"
                style={{ background: 'var(--app-brand-grad)' }}
              >
                <Sparkles className="w-3 h-3" />
                <span>تصميم بطاقة</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          4. QUICK DISCOVERY TOOLS GRID
          ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ambient Sounds */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsSoundModalOpen(true)}
          className="app-surface app-surface-hover rounded-2xl p-4.5 cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>أصوات التركيز</h4>
            <p className="text-[11px] font-arabic opacity-60">مطر، قهوة، وطبيعة</p>
          </div>
        </motion.div>

        {/* Dictionary */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsDictModalOpen(true)}
          className="app-surface app-surface-hover rounded-2xl p-4.5 cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>المعجم اللغوي</h4>
            <p className="text-[11px] font-arabic opacity-60">شرح غريب الألفاظ</p>
          </div>
        </motion.div>

        {/* Topics */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsTopicsModalOpen(true)}
          className="app-surface app-surface-hover rounded-2xl p-4.5 cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>التصفح الموضوعي</h4>
            <p className="text-[11px] font-arabic opacity-60">أبواب وموضوعات الكتاب</p>
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
    </motion.div>
  );
};
