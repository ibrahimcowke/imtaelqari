import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { BookOpen, Sparkles, Music, Layers, ArrowLeft, BookOpenCheck } from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';

export const WelcomeScreen: React.FC<{
  onStart: () => void;
  onOpenReader: () => void;
}> = ({ onStart, onOpenReader }) => {
  const { currentPage } = useReaderStore();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 22 },
    },
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar"
      style={{
        background: 'linear-gradient(180deg, #090e17 0%, #060910 60%, #030508 100%)',
        color: '#f3ede8',
      }}
      dir="rtl"
    >
      {/* Background Cinematic Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 filter blur-[2px]"
          style={{ backgroundImage: `url('/welcome-hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-[#060910]/85 to-transparent" />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl relative z-10 text-center my-auto py-8"
      >
        {/* ── Glowing App Icon ── */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="relative group">
            <div
              className="absolute -inset-2 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #d4af37, #2ea879, #38bdf8)' }}
            />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-0.5 bg-black/40">
              <img
                src="/app-logo.png"
                alt="شعار إمتاع القارئ"
                className="w-full h-full object-cover rounded-[22px]"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Title & Author Badge ── */}
        <motion.div variants={itemVariants} className="space-y-2.5 mb-6">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-arabic font-semibold border shadow-sm"
            style={{
              background: 'rgba(212,175,55,0.12)',
              borderColor: 'rgba(212,175,55,0.3)',
              color: '#f3db8b',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            المكتبة الأدبية الرقمية الفاخرة
          </span>

          <h1 className="text-2xl sm:text-4xl font-bold font-arabic tracking-tight text-white leading-snug">
            إمتاع القارئ بجمال الكلم وروائع الحكم
          </h1>

          <p className="text-sm sm:text-base font-arabic text-white/70 font-medium">
            تأليف الأديب: <strong className="text-amber-300 font-bold">محمد بن سعد النهاري</strong>
          </p>
        </motion.div>

        {/* ── 3 Feature Highlights ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-right">
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#f3db8b' }}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-sm text-white mb-0.5">قراءة وتصفح غامر</h3>
              <p className="font-arabic text-[11px] text-white/60 leading-relaxed">
                تقليب صفحات سلس باللمس، علامات مرجعية وتظليلات ملونة.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: 'rgba(46,168,121,0.15)', color: '#a3e8ca' }}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-sm text-white mb-0.5">10 سمات و5 خطوط</h3>
              <p className="font-arabic text-[11px] text-white/60 leading-relaxed">
                تناغم كامل مع الوضع الليلي والخطوط العربية الكلاسيكية.
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: 'rgba(56,189,248,0.15)', color: '#93c5fd' }}>
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-sm text-white mb-0.5">أصوات واستوديو بطاقات</h3>
              <p className="font-arabic text-[11px] text-white/60 leading-relaxed">
                مطر وهدوء طبيعي مع مولد بطاقات اقتباسات فائقة الجودة.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Main Action Buttons ── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-arabic font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 group text-black"
            style={{
              background: 'linear-gradient(135deg, #f5d77f 0%, #d4af37 60%, #b89324 100%)',
              boxShadow: '0 4px 24px rgba(212,175,55,0.4)',
            }}
          >
            <span>دخول لوحة القراءة والتحكم</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>

          {currentPage > 1 && (
            <button
              onClick={onOpenReader}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-arabic font-bold text-sm bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              <BookOpenCheck className="w-4 h-4 text-emerald-400" />
              <span>استئناف القراءة (ص {currentPage})</span>
            </button>
          )}
        </motion.div>

        {/* Footer info */}
        <motion.div variants={itemVariants} className="mt-8 text-center text-xs font-arabic text-white/40">
          نسخة رقمية وتجربة تفاعلية حديثة للكتاب • جميع الحقوق محفوظة
        </motion.div>
      </motion.div>
    </div>
  );
};
