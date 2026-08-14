import React, { useState, useEffect } from 'react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import { db } from '../../../lib/db';
import {
  Clock, BookOpen, Zap, Dices, Copy,
  Check, Share2, Star, Flame, Play, Pause, RotateCcw,
  Sparkles, Compass, ArrowRight, Music, BookMarked, Layers,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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

  // Quote State
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [savedStar, setSavedStar] = useState(false);

  // Daily Streak State (persisted in localStorage)
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('reading_streak') || '3', 10);
  });
  const [checkedToday, setCheckedToday] = useState(() => {
    const lastDate = localStorage.getItem('last_read_date');
    return lastDate === new Date().toDateString();
  });

  // Focus Timer State
  const [timerDuration, setTimerDuration] = useState(10); // in minutes
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // New Feature Modals
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
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  };

  // SVG circle math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Format seconds
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentWisdom = CURATED_WISDOMS[quoteIdx];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* ── 1. Interactive Hero Card ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl group"
        style={{
          background: 'linear-gradient(135deg, #2a1c16 0%, #3d2822 40%, #4e3328 100%)',
          boxShadow: '0 8px 48px rgba(42,28,22,0.35), 0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(163,124,108,0.2)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a37c6c 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #d2bab0 0%, transparent 70%)' }} />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0 w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={radius} fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="glow-ring-filter"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e0cec7" />
                  <stop offset="100%" stopColor="#a37c6c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-sans text-white">{progress}%</span>
              <span className="text-[10px] text-brand-300/70 font-sans uppercase tracking-wider mt-0.5">مكتمل</span>
            </div>
          </div>

          {/* Text & Interactive CTA Buttons */}
          <div className="flex-1 text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(163,124,108,0.25)', border: '1px solid rgba(163,124,108,0.4)', color: '#d2bab0' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              متابعة القراءة
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-arabic text-white mb-1.5 leading-snug">{book.title}</h2>
            <p className="text-brand-400/80 text-sm mb-4">الصفحة {currentPage} من {totalPages}</p>

            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <button
                onClick={onNavigate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-arabic text-sm font-semibold transition-all duration-300 active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #a37c6c, #75594e)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(163,124,108,0.4)',
                }}
              >
                <BookOpen className="w-4 h-4" />
                استئناف القراءة
              </button>

              <button
                onClick={handleRandomPage}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-arabic text-xs font-semibold transition-all duration-300 active:scale-95 hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#e0cec7',
                }}
                title="اقرأ صفحة عشوائية من الكتاب"
              >
                <Dices className="w-4 h-4 text-brand-300 animate-spin-slow" />
                صفحة عشوائية
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Interactive Daily Streak & Habit Tracker ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 md:p-6"
        style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-surface-border)',
          boxShadow: '0 2px 16px var(--app-surface-shadow)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              <Flame className="w-5 h-5 fill-current animate-bounce" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
                سلسلة القراءة اليومية
              </h3>
              <p className="text-xs font-arabic" style={{ color: 'var(--app-text-muted)' }}>
                حافظ على عادة القراءة يومياً
              </p>
            </div>
          </div>

          <div className="text-left">
            <span className="text-2xl font-bold font-sans" style={{ color: '#f59e0b' }}>
              {streak}
            </span>
            <span className="text-xs font-arabic mr-1" style={{ color: 'var(--app-text-muted)' }}>أيام</span>
          </div>
        </div>

        {/* 7-Day Checklist */}
        <div className="grid grid-cols-7 gap-2 mb-4">
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
                <span className="text-[10px] font-arabic truncate" style={{ color: 'var(--app-text-muted)' }}>{day}</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isDone ? 'var(--app-brand)' : 'transparent',
                    color: isDone ? 'white' : 'var(--app-text-faint)',
                  }}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Check-in Button */}
        <button
          onClick={handleCheckIn}
          disabled={checkedToday}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
          style={checkedToday
            ? { background: 'rgba(16,185,129,0.12)', color: '#0d8f60', border: '1px solid rgba(16,185,129,0.25)' }
            : { background: 'linear-gradient(135deg, #a37c6c, #75594e)', color: 'white', boxShadow: '0 4px 16px rgba(163,124,108,0.3)' }
          }
        >
          {checkedToday ? (
            <>
              <Check className="w-4 h-4" />
              أحسنت! تم تسجيل قراءة اليوم 🎉
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              سجّل إنجاز قراءة اليوم (+1)
            </>
          )}
        </button>
      </motion.div>

      {/* ── 3. Interactive Quote / Wisdom of the Day Card ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6 md:p-7"
        style={{
          background: 'var(--app-surface)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--app-surface-border)',
          boxShadow: '0 4px 24px var(--app-surface-shadow)',
        }}
      >
        {/* Accent Bar */}
        <div className="absolute right-0 top-8 bottom-8 w-1 rounded-full"
          style={{ background: 'linear-gradient(180deg, #e0cec7 0%, var(--app-brand) 50%, #e0cec7 100%)' }} />

        <div className="pr-4">
          {/* Card Header with Interactive Shuffle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)' }}>
                <span className="text-white text-xs font-bold font-sans">«</span>
              </div>
              <span className="text-xs font-sans font-bold uppercase tracking-widest"
                style={{ color: 'var(--app-brand)' }}>
                حكمة مختارة ({quoteIdx + 1}/{CURATED_WISDOMS.length})
              </span>
            </div>

            <button
              onClick={nextQuote}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-arabic text-xs font-medium transition-all active:scale-90"
              style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
              title="حكمة أخرى"
            >
              <Dices className="w-3.5 h-3.5" />
              حكمة أخرى
            </button>
          </div>

          {/* Animated Quote Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <p className="font-arabic text-lg md:text-xl leading-loose font-medium mb-3" style={{ color: 'var(--app-text)' }}>
                «{currentWisdom.text}»
              </p>
              <div className="flex items-center justify-between text-xs font-arabic pt-2 border-t"
                style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text-muted)' }}>
                <span>— {currentWisdom.source} (ص {currentWisdom.page})</span>

                {/* Quote Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCardStudioOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-arabic font-bold transition-all active:scale-95 shadow-sm"
                    style={{ background: 'var(--app-brand-grad)', color: 'white' }}
                    title="تصميم بطاقة اقتباس للنشر والمشاركة"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تصميم بطاقة</span>
                  </button>
                  <button
                    onClick={copyQuote}
                    className="p-2 rounded-lg transition-all hover:bg-black/5 active:scale-90"
                    style={{ color: copied ? '#0d8f60' : 'var(--app-brand)' }}
                    title="نسخ الحكمة"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={shareQuote}
                    className="p-2 rounded-lg transition-all hover:bg-black/5 active:scale-90"
                    style={{ color: 'var(--app-brand)' }}
                    title="مشاركة الحكمة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveQuoteToDb}
                    className="p-2 rounded-lg transition-all hover:bg-black/5 active:scale-90"
                    style={{ color: savedStar ? '#f59e0b' : 'var(--app-brand)' }}
                    title="حفظ في المفضلة"
                  >
                    <Star className={`w-4 h-4 ${savedStar ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => jumpToQuotePage(currentWisdom.page)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-arabic font-bold transition-all active:scale-95 mr-1"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                    title="الانتقال لصفحة الحكمة في الكتاب"
                  >
                    <span>فتح الصفحة</span>
                    <ArrowRight className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── 4. Interactive Focus Timer (جلسة قراءة مركّزة) ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 md:p-6"
        style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-surface-border)',
          boxShadow: '0 2px 16px var(--app-surface-shadow)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,92,191,0.12)', color: '#7c5cbf' }}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
                جلسة قراءة مركّزة
              </h3>
              <p className="text-xs font-arabic" style={{ color: 'var(--app-text-muted)' }}>
                اضبط وقتاً مخصصاً وتخلص من المشتتات
              </p>
            </div>
          </div>

          <div className="text-2xl font-mono font-bold" style={{ color: timerRunning ? '#7c5cbf' : 'var(--app-text)' }}>
            {formatTimer(timeLeft)}
          </div>
        </div>

        {/* Time Preset Buttons */}
        <div className="flex gap-2 mb-4">
          {[5, 10, 15, 25].map((mins) => (
            <button
              key={mins}
              onClick={() => selectTimerPreset(mins)}
              className="flex-1 py-2 rounded-xl text-xs font-arabic font-bold transition-all active:scale-95"
              style={timerDuration === mins
                ? { background: 'linear-gradient(135deg, #7c5cbf, #5b3d9c)', color: 'white', boxShadow: '0 4px 12px rgba(124,92,191,0.3)' }
                : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
              }
            >
              {mins} دقائق
            </button>
          ))}
        </div>

        {/* Timer Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={toggleTimer}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-sm font-bold transition-all active:scale-95"
            style={{
              background: timerRunning ? 'rgba(244,63,94,0.12)' : 'linear-gradient(135deg, #7c5cbf, #5b3d9c)',
              color: timerRunning ? '#e05f7a' : 'white',
              border: timerRunning ? '1px solid rgba(244,63,94,0.25)' : 'none',
              boxShadow: timerRunning ? 'none' : '0 4px 16px rgba(124,92,191,0.35)',
            }}
          >
            {timerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                إيقاف مؤقت
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                بدء المؤقت والقراءة
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigate}
            className="px-4 flex items-center justify-center gap-1.5 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
            title="انتقل للقارئ مباشرة"
          >
            <BookOpen className="w-4 h-4" />
            فتح القارئ
          </button>
        </div>
      </motion.div>

      {/* ── 5. Advanced Literary & Reading Tools Grid ── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
          <h3 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text-muted)' }}>أدوات القراءة المتقدمة</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setIsCardStudioOpen(true)}
            className="p-4 rounded-2xl text-right transition-all flex flex-col justify-between group active:scale-95 shadow-sm"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-surface-border)',
              boxShadow: '0 2px 12px var(--app-surface-shadow)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm"
              style={{ background: 'var(--app-brand-grad)', color: 'white' }}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-arabic font-bold text-xs mb-0.5" style={{ color: 'var(--app-text)' }}>استوديو البطاقات</h4>
              <p className="text-[10px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>تصميم صور ونشر</p>
            </div>
          </button>

          <button
            onClick={() => setIsSoundModalOpen(true)}
            className="p-4 rounded-2xl text-right transition-all flex flex-col justify-between group active:scale-95 shadow-sm"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-surface-border)',
              boxShadow: '0 2px 12px var(--app-surface-shadow)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm"
              style={{ background: 'var(--app-brand-grad)', color: 'white' }}>
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-arabic font-bold text-xs mb-0.5" style={{ color: 'var(--app-text)' }}>أصوات التركيز</h4>
              <p className="text-[10px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>مطر وهدوء طبيعي</p>
            </div>
          </button>

          <button
            onClick={() => setIsDictModalOpen(true)}
            className="p-4 rounded-2xl text-right transition-all flex flex-col justify-between group active:scale-95 shadow-sm"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-surface-border)',
              boxShadow: '0 2px 12px var(--app-surface-shadow)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm"
              style={{ background: 'var(--app-brand-grad)', color: 'white' }}>
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-arabic font-bold text-xs mb-0.5" style={{ color: 'var(--app-text)' }}>المعجم اللغوي</h4>
              <p className="text-[10px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>شرح وجذور الكلمات</p>
            </div>
          </button>

          <button
            onClick={() => setIsTopicsModalOpen(true)}
            className="p-4 rounded-2xl text-right transition-all flex flex-col justify-between group active:scale-95 shadow-sm"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-surface-border)',
              boxShadow: '0 2px 12px var(--app-surface-shadow)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm"
              style={{ background: 'var(--app-brand-grad)', color: 'white' }}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-arabic font-bold text-xs mb-0.5" style={{ color: 'var(--app-text)' }}>التصفح الموضوعي</h4>
              <p className="text-[10px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>حسب موضوعات الحياة</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* ── 6. Stat Cards Grid ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<BookOpen />}
          label="الصفحات المقروءة"
          value={currentPage.toString()}
          color="#a37c6c"
          bg="rgba(163,124,108,0.12)"
        />
        <StatCard
          icon={<Clock />}
          label="الوقت المتبقي للكتاب"
          value={`${Math.round((totalPages - currentPage) * 1.5)} دق`}
          color="#7c5cbf"
          bg="rgba(139,92,246,0.12)"
        />
        <StatCard
          icon={<Zap />}
          label="الصفحات المتبقية"
          value={(totalPages - currentPage).toString()}
          color="#b07d1a"
          bg="rgba(245,158,11,0.12)"
        />
        <StatCard
          icon={<Compass />}
          label="إجمالي صفحات الكتاب"
          value={totalPages.toString()}
          color="#0d8f60"
          bg="rgba(16,185,129,0.12)"
        />
      </motion.div>

      {/* ── Feature Modals ── */}
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

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}> = ({ icon, label, value, color, bg }) => (
  <div
    className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
    style={{
      background: 'var(--app-surface)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--app-surface-border)',
      boxShadow: '0 2px 16px var(--app-surface-shadow)',
    }}
  >
    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4', style: { color } })}
    </div>
    <div className="text-2xl font-bold font-sans mb-0.5" style={{ color: 'var(--app-text)' }}>{value}</div>
    <div className="text-xs font-arabic" style={{ color: 'var(--app-text-muted)' }}>{label}</div>
  </div>
);
