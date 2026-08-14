import React from 'react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import { Clock, BookOpen, Zap, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const QUOTES = [
  "والحكمة من أجلّ ما يمكن أن يمنحه الله للإنسان بعد الإيمان بالله والتحلي بمكارم الأخلاق، وهي أمل كل الناجحين.",
  "أودعت بين طيات هذا الكتاب ما استحسنته من وجهة نظري، ما ازدانت به الكتب ومن أجمل ما سالت به الأقلام.",
  "الكلم الطيب تحمله قدرات وقوى الجمال.. فهو يحمل أجمل المعاني الروحية التي لا تتأثر بالضغوط ولا بالأوزان.",
  "إن من الشعر حكمة.. وهذا لقاء السحاب حيث تحمل الكلمة روعة الحكمة.",
];

export const HomeTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { currentPage } = useReaderStore();
  const totalPages = bookDataService.getPages().length;
  const progress = Math.round((currentPage / totalPages) * 100);
  const book = bookDataService.getBookInfo();

  const today = new Date().toDateString();
  const quoteIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % QUOTES.length;
  const quoteOfTheDay = QUOTES[quoteIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
  };

  // SVG circle math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* ── Hero Card ── */}
      <motion.div
        variants={itemVariants}
        onClick={onNavigate}
        className="relative overflow-hidden rounded-3xl cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, #2a1c16 0%, #3d2822 40%, #4e3328 100%)',
          boxShadow: '0 8px 48px rgba(42,28,22,0.35), 0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(163,124,108,0.2)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700"
          style={{ background: 'radial-gradient(circle, #a37c6c 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #d2bab0 0%, transparent 70%)' }} />
        <div className="absolute top-4 left-4 w-20 h-20 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #e0cec7 0%, transparent 70%)' }} />

        <div className="relative z-10 p-7 flex flex-col md:flex-row items-center gap-6">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0 w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* Track */}
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              {/* Progress */}
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
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-sans text-white">{progress}%</span>
              <span className="text-[10px] text-brand-300/70 font-sans uppercase tracking-wider mt-0.5">مكتمل</span>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center md:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-3"
              style={{ background: 'rgba(163,124,108,0.25)', border: '1px solid rgba(163,124,108,0.4)', color: '#d2bab0' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              متابعة القراءة
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-arabic text-white mb-2 leading-snug">{book.title}</h2>
            <p className="text-brand-400/80 text-sm mb-5">الصفحة {currentPage} من {totalPages}</p>
            <button
              onClick={onNavigate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-arabic text-sm font-semibold transition-all duration-300 active:scale-95 group-hover:gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(163,124,108,0.5), rgba(117,89,78,0.5))',
                border: '1px solid rgba(163,124,108,0.5)',
                color: '#e0cec7',
              }}
            >
              افتح الكتاب
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<BookOpen />}
          label="الصفحات المقروءة"
          value={currentPage.toString()}
          gradientFrom="rgba(163,124,108,0.12)"
          gradientTo="rgba(163,124,108,0.04)"
          iconColor="#a37c6c"
          iconBg="rgba(163,124,108,0.15)"
        />
        <StatCard
          icon={<Clock />}
          label="الوقت المتبقي"
          value={`${Math.round((totalPages - currentPage) * 1.5)} دق`}
          gradientFrom="rgba(139,92,246,0.1)"
          gradientTo="rgba(139,92,246,0.02)"
          iconColor="#7c5cbf"
          iconBg="rgba(139,92,246,0.12)"
        />
        <StatCard
          icon={<Zap />}
          label="الصفحات المتبقية"
          value={(totalPages - currentPage).toString()}
          gradientFrom="rgba(245,158,11,0.1)"
          gradientTo="rgba(245,158,11,0.02)"
          iconColor="#b07d1a"
          iconBg="rgba(245,158,11,0.12)"
        />
        <StatCard
          icon={<BookOpen />}
          label="إجمالي الصفحات"
          value={totalPages.toString()}
          gradientFrom="rgba(16,185,129,0.1)"
          gradientTo="rgba(16,185,129,0.02)"
          iconColor="#0d8f60"
          iconBg="rgba(16,185,129,0.12)"
        />
      </motion.div>

      {/* ── Quote of the Day ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-7"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 4px 24px rgba(163,124,108,0.08), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {/* Gold accent bar */}
        <div className="absolute right-0 top-8 bottom-8 w-1 rounded-full"
          style={{ background: 'linear-gradient(180deg, #e0cec7 0%, #a37c6c 50%, #e0cec7 100%)' }} />

        <div className="pr-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)' }}>
              <span className="text-white text-xs font-bold font-sans">«</span>
            </div>
            <span className="text-xs font-sans font-bold uppercase tracking-widest"
              style={{ color: '#a37c6c' }}>اقتباس اليوم</span>
          </div>
          <p className="font-arabic text-xl md:text-2xl leading-loose text-gray-800 font-medium">
            {quoteOfTheDay}
          </p>
          <p className="text-xs text-gray-400 font-arabic mt-4">— من كتاب إمتاع القارئ</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  iconBg: string;
}> = ({ icon, label, value, gradientFrom, gradientTo, iconColor, iconBg }) => (
  <div
    className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
    style={{
      background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%), rgba(255,255,255,0.9)`,
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.9)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
    }}
  >
    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg }}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4', style: { color: iconColor } })}
    </div>
    <div className="text-2xl font-bold font-sans text-gray-900 mb-0.5">{value}</div>
    <div className="text-xs text-gray-500 font-arabic">{label}</div>
  </div>
);
