import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../lib/db';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import {
  User, BookOpen, Bookmark, Highlighter, Target,
  AlignJustify, AlignRight, Type,
  Minus, Plus, Palette, RotateCcw, ChevronLeft, Check,
  BarChart3, Award, Clock, TrendingUp, Zap, Flame, Sparkles,
  Download, Upload, Sliders
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { ReaderTheme, ReaderWidth, TextAlign } from '../../../types/book';

/* ── helpers ── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

/* ── Global Theme config ── */
const THEMES: { id: ReaderTheme; label: string; bg: string; ring: string; icon: string }[] = [
  { id: 'paper',    label: 'ورقي',       bg: '#fdfcf8', ring: '#a37c6c', icon: '📜' },
  { id: 'white',    label: 'أبيض',       bg: '#ffffff', ring: '#aaaaaa', icon: '☁️' },
  { id: 'sage',     label: 'أخضر هادئ',  bg: '#e8ece1', ring: '#5a8a5a', icon: '🌿' },
  { id: 'sepia',    label: 'بني تراثي',  bg: '#f4ecd8', ring: '#8a6040', icon: '📚' },
  { id: 'rose',     label: 'وردي أندلسي', bg: '#fbf4f2', ring: '#c96868', icon: '🌸' },
  { id: 'emerald',  label: 'زمردي ملكي', bg: '#081711', ring: '#2ea879', icon: '💎' },
  { id: 'midnight', label: 'كحلي ليلي',  bg: '#080e1a', ring: '#38bdf8', icon: '🌌' },
  { id: 'coffee',   label: 'قهوة عربية', bg: '#140f0c', ring: '#d4a373', icon: '☕' },
  { id: 'slate',    label: 'رمادي فحمي', bg: '#0f1216', ring: '#58a6ff', icon: '⚡' },
  { id: 'dark',     label: 'ليلي أسود',  bg: '#0f0f0f', ring: '#c8a090', icon: '🌙' },
];

const FONT_SIZES = [16, 18, 20, 22, 24, 26, 28];
const WIDTHS: { id: ReaderWidth; label: string }[] = [
  { id: 'narrow', label: 'ضيق' },
  { id: 'medium', label: 'متوسط' },
  { id: 'wide',   label: 'واسع' },
];

export const ProfileTab: React.FC = () => {
  const navigate = useNavigate();
  const { currentPage, preferences, updatePreferences } = useReaderStore();
  const totalPages = bookDataService.getPages().length;
  const progress = Math.round((currentPage / totalPages) * 100);

  const bookmarks  = useLiveQuery(() => db.bookmarks.count())  ?? 0;
  const highlights = useLiveQuery(() => db.highlights.count()) ?? 0;
  const quotes     = useLiveQuery(() => db.quotes.count())     ?? 0;

  const pagesLeft = totalPages - currentPage;
  const estMinutes = Math.round(pagesLeft * 1.5);

  const [readingOpen, setReadingOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const exportFullBackup = async () => {
    try {
      const allBookmarks = await db.bookmarks.toArray();
      const allHighlights = await db.highlights.toArray();
      const allNotes = await db.notes.toArray();
      const allQuotes = await db.quotes.toArray();

      const backupData = {
        version: 1,
        appName: 'إمتاع القارئ بجمال الكلم وروائع الحكم',
        exportedAt: new Date().toISOString(),
        data: {
          bookmarks: allBookmarks,
          highlights: allHighlights,
          notes: allNotes,
          quotes: allQuotes,
          currentPage,
          preferences,
          streak: localStorage.getItem('reading_streak') || '3',
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imta-reader-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setBackupStatus({ type: 'success', msg: 'تم تصدير النسخة الاحتياطية بنجاح!' });
      setTimeout(() => setBackupStatus(null), 4000);
    } catch {
      setBackupStatus({ type: 'error', msg: 'حدث خطأ أثناء تصدير البيانات.' });
      setTimeout(() => setBackupStatus(null), 4000);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data) {
        throw new Error('Invalid backup file');
      }

      if (backup.data.bookmarks && Array.isArray(backup.data.bookmarks)) {
        await db.bookmarks.clear();
        await db.bookmarks.bulkAdd(backup.data.bookmarks);
      }
      if (backup.data.highlights && Array.isArray(backup.data.highlights)) {
        await db.highlights.clear();
        await db.highlights.bulkAdd(backup.data.highlights);
      }
      if (backup.data.notes && Array.isArray(backup.data.notes)) {
        await db.notes.clear();
        await db.notes.bulkAdd(backup.data.notes);
      }
      if (backup.data.quotes && Array.isArray(backup.data.quotes)) {
        await db.quotes.clear();
        await db.quotes.bulkAdd(backup.data.quotes);
      }
      if (backup.data.preferences) {
        updatePreferences(backup.data.preferences);
      }
      if (backup.data.streak) {
        localStorage.setItem('reading_streak', backup.data.streak);
      }

      setBackupStatus({ type: 'success', msg: 'تمت استعادة كافة البيانات والنسخ الاحتياطية بنجاح!' });
      setTimeout(() => setBackupStatus(null), 4000);
    } catch {
      setBackupStatus({ type: 'error', msg: 'الملف غير صالح أو تعذر استعادة البيانات.' });
      setTimeout(() => setBackupStatus(null), 4000);
    }
    e.target.value = '';
  };

  const resetPrefs = () => updatePreferences({
    theme: 'paper', fontSize: 20, fontFamily: 'Noto Naskh Arabic',
    lineHeight: 1.8, paragraphSpacing: 1.5, readerWidth: 'medium',
    textAlign: 'justify', letterSpacing: 'normal', mode: 'text', ttsRate: 1,
    autoHideControls: true,
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-4">

      {/* ── 1. Profile Hero ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6 md:p-7 border shadow-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, rgba(30,20,15,0.95) 100%)',
          borderColor: 'var(--app-brand-border)',
          color: 'white',
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a37c6c 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #d2bab0 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)', boxShadow: '0 6px 24px rgba(163,124,108,0.45)' }}
          >
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-arabic text-white mb-0.5">
              الملف القرائي
            </h2>
            <p className="text-brand-300/80 text-xs md:text-sm font-arabic">
              إمتاع القارئ بجمال الكلم وروائع الحكم
            </p>
            <div
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ background: 'rgba(163,124,108,0.35)', border: '1px solid rgba(163,124,108,0.5)' }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{progress}% مكتمل من الكتاب</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs text-brand-200/80 mb-2 font-sans">
            <span>تقدم القراءة الكلي</span>
            <span>صفحة {currentPage} من {totalPages}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full glow-ring-filter"
              style={{ background: 'linear-gradient(90deg, #a37c6c, #f5ede8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── 2. Statistics Grid ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel icon={<BarChart3 />} title="إحصائيات القراءة والتدبر" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          <StatTile icon={<BookOpen />}    label="الصفحات المقروءة"    value={currentPage}              color="#a37c6c" bg="rgba(163,124,108,0.12)" />
          <StatTile icon={<Target />}      label="الصفحات المتبقية"    value={pagesLeft}                color="#7c5cbf" bg="rgba(124,92,191,0.12)"  />
          <StatTile icon={<Bookmark />}    label="علامات مرجعية"       value={bookmarks}                color="#a37c6c" bg="rgba(163,124,108,0.12)" />
          <StatTile icon={<Highlighter />} label="تظليلات ملونة"       value={highlights}               color="#b07d1a" bg="rgba(245,158,11,0.12)"  />
          <StatTile icon={<Clock />}       label="الوقت التقديري"      value={`${estMinutes} دقيقة`}    color="#0d8f60" bg="rgba(16,185,129,0.12)"  />
          <StatTile icon={<Zap />}         label="اقتباسات محفوظة"     value={quotes}                   color="#e05f7a" bg="rgba(244,63,94,0.12)"   />
        </div>
      </motion.div>

      {/* ── 3. Achievements ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel icon={<Award />} title="أوسمة وإنجازات القارئ" />
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-3">
          <AchievementBadge emoji="📖" label="بدأت القراءة"   unlocked={currentPage > 1} />
          <AchievementBadge emoji="🔖" label="أول علامة"     unlocked={bookmarks > 0} />
          <AchievementBadge emoji="🌟" label="أول تظليل"     unlocked={highlights > 0} />
          <AchievementBadge emoji="🏅" label="ربع الكتاب"    unlocked={progress >= 25} />
          <AchievementBadge emoji="🥈" label="نصف الكتاب"    unlocked={progress >= 50} />
          <AchievementBadge emoji="🏆" label="ختم الكتاب"    unlocked={progress >= 100} />
        </div>
      </motion.div>

      {/* ── 4. Reading Activity Heatmap ── */}
      <motion.div variants={itemVariants} className="app-surface rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
            >
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
                سجل النشاط ومعدل القراءة
              </h3>
              <p className="text-[11px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
                خريطة تفاعل القراءة لآخر 5 أسابيع
              </p>
            </div>
          </div>
          <span
            className="text-xs font-mono font-bold px-3 py-1 rounded-xl"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
          >
            185 كلمة / دقيقة
          </span>
        </div>

        {/* 5-Week Activity Grid */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-1.5 justify-items-center">
            {Array.from({ length: 35 }).map((_, i) => {
              const isPast = i >= 35 - 7;
              const intensity = (i * 7 + 13) % 5;
              const opacity = isPast ? (i === 34 ? 1 : 0.75) : intensity > 2 ? 0.45 : intensity > 0 ? 0.2 : 0.08;
              return (
                <div
                  key={i}
                  className="w-full aspect-square rounded-lg transition-transform hover:scale-125 cursor-pointer"
                  style={{
                    background: 'var(--app-brand)',
                    opacity,
                  }}
                  title={`يوم النشاط ${i + 1}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between items-center text-[10px] font-arabic mt-3 px-1 opacity-70" style={{ color: 'var(--app-text-muted)' }}>
            <span>منذ 5 أسابيع</span>
            <div className="flex items-center gap-1.5">
              <span>أقل</span>
              <span className="w-2.5 h-2.5 rounded bg-current opacity-20 inline-block" />
              <span className="w-2.5 h-2.5 rounded bg-current opacity-60 inline-block" />
              <span className="w-2.5 h-2.5 rounded bg-current inline-block" />
              <span>أكثر</span>
            </div>
            <span>اليوم</span>
          </div>
        </div>
      </motion.div>

      {/* ── 5. GLOBAL THEME PICKER ── */}
      <motion.div variants={itemVariants} className="app-surface rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
          >
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
              سمة التطبيق وألوان القراءة
            </h3>
            <p className="text-[11px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
              تطبق الألوان بتناغم كامل على الواجهة والقراءة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {THEMES.map(t => {
            const isActive = preferences.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updatePreferences({ theme: t.id })}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-95 text-right app-surface app-surface-hover"
                style={{
                  border: isActive ? `2px solid ${t.ring}` : '1px solid var(--app-surface-border)',
                  background: isActive ? 'var(--app-brand-dim)' : 'transparent',
                  boxShadow: isActive ? `0 0 16px ${t.ring}33` : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl relative flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: t.bg, border: '1px solid rgba(0,0,0,0.1)' }}
                >
                  <span className="text-base">{t.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-arabic font-bold truncate" style={{ color: 'var(--app-text)' }}>
                    {t.label}
                  </div>
                  <div className="text-[10px] font-arabic opacity-60">
                    {isActive ? 'نشط الآن' : 'تطبيق'}
                  </div>
                </div>
                {isActive && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: t.ring }}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── 6. TYPOGRAPHY & READING CUSTOMIZATION ── */}
      <motion.div variants={itemVariants} className="app-surface rounded-3xl p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
          >
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
              الخطوط وخصائص العرض
            </h3>
            <p className="text-[11px] font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
              تحكم كامل بحجم ونوع الخط ومحاذاة النصوص
            </p>
          </div>
        </div>

        {/* Font size */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-arabic font-semibold opacity-80" style={{ color: 'var(--app-text)' }}>
              حجم الخط
            </span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-xl"
              style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
            >
              {preferences.fontSize}px
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updatePreferences({ fontSize: Math.max(16, preferences.fontSize - 2) })}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 app-surface"
              style={{ color: 'var(--app-brand)' }}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 flex gap-1.5">
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => updatePreferences({ fontSize: s })}
                  className="flex-1 h-3 rounded-full transition-all"
                  style={{ background: preferences.fontSize >= s ? 'var(--app-brand)' : 'var(--app-brand-dim)' }}
                />
              ))}
            </div>
            <button
              onClick={() => updatePreferences({ fontSize: Math.min(28, preferences.fontSize + 2) })}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 app-surface"
              style={{ color: 'var(--app-brand)' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Font Family Selection */}
        <div>
          <span className="text-xs font-arabic font-semibold opacity-80 block mb-3" style={{ color: 'var(--app-text)' }}>
            نوع الخط العربي
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'Noto Naskh Arabic', name: 'خط النسخ (الافتراضي)', sample: 'جمال الكلم وروائع الحكم' },
              { id: 'Amiri', name: 'خط أميري التراثي', sample: 'جمال الكلم وروائع الحكم' },
              { id: 'Cairo', name: 'خط كايرو الحديث', sample: 'جمال الكلم وروائع الحكم' },
              { id: 'Tajawal', name: 'خط تجوال الهندسي', sample: 'جمال الكلم وروائع الحكم' },
              { id: 'Almarai', name: 'خط المراعي النقي', sample: 'جمال الكلم وروائع الحكم' },
            ].map(f => {
              const isSelected = preferences.fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => updatePreferences({ fontFamily: f.id })}
                  className="p-3.5 rounded-2xl text-right transition-all active:scale-95 flex flex-col justify-between app-surface app-surface-hover"
                  style={{
                    border: isSelected ? '2px solid var(--app-brand)' : '1px solid var(--app-surface-border)',
                    background: isSelected ? 'var(--app-brand-dim)' : 'transparent',
                    boxShadow: isSelected ? '0 0 16px var(--app-brand-glow)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5 w-full">
                    <span className="text-xs font-bold" style={{ color: isSelected ? 'var(--app-brand)' : 'var(--app-text)' }}>
                      {f.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--app-brand)' }}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed truncate opacity-75 mt-1" style={{ fontFamily: `"${f.id}", sans-serif`, color: 'var(--app-text)' }}>
                    «{f.sample}»
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reader width & Text align */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <span className="text-xs font-arabic font-semibold opacity-80 block mb-2.5" style={{ color: 'var(--app-text)' }}>
              عرض مساحة القارئ
            </span>
            <div className="flex gap-2">
              {WIDTHS.map(w => (
                <button
                  key={w.id}
                  onClick={() => updatePreferences({ readerWidth: w.id })}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-arabic font-semibold transition-all active:scale-95"
                  style={preferences.readerWidth === w.id
                    ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 4px 12px var(--app-brand-glow)' }
                    : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
                  }
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-arabic font-semibold opacity-80 block mb-2.5" style={{ color: 'var(--app-text)' }}>
              محاذاة النص
            </span>
            <div className="flex gap-2">
              {([
                { id: 'justify', icon: <AlignJustify />, label: 'مضبوط' },
                { id: 'right',   icon: <AlignRight />,   label: 'يمين'  },
              ] as { id: TextAlign; icon: React.ReactNode; label: string }[]).map(a => (
                <button
                  key={a.id}
                  onClick={() => updatePreferences({ textAlign: a.id })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-arabic font-semibold transition-all active:scale-95"
                  style={preferences.textAlign === a.id
                    ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 4px 12px var(--app-brand-glow)' }
                    : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
                  }
                >
                  {React.cloneElement(a.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 7. ADVANCED READING METRICS DRAWER ── */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setReadingOpen(o => !o)}
          className="w-full flex items-center justify-between rounded-3xl px-5 py-4 transition-all app-surface"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="font-arabic font-bold text-sm block" style={{ color: 'var(--app-text)' }}>
                خيارات تباعد الأسطر والقراءة الصوتية
              </span>
              <span className="text-[11px] font-arabic opacity-60">ارتفاع الأسطر، تباعد الفقرات، سرعة الصوت</span>
            </div>
          </div>
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${readingOpen ? '-rotate-90' : ''}`}
            style={{ color: 'var(--app-brand)' }}
          />
        </button>

        {readingOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 rounded-3xl p-5 md:p-6 space-y-5 app-surface"
          >
            <SliderSetting
              label="ارتفاع السطر" value={preferences.lineHeight}
              min={1.4} max={2.4} step={0.2} display={preferences.lineHeight.toFixed(1)}
              onChange={v => updatePreferences({ lineHeight: v })}
            />
            <SliderSetting
              label="تباعد الفقرات" value={preferences.paragraphSpacing}
              min={1.0} max={2.5} step={0.25} display={preferences.paragraphSpacing.toFixed(2)}
              onChange={v => updatePreferences({ paragraphSpacing: v })}
            />
            <SliderSetting
              label="سرعة القراءة الصوتية" value={preferences.ttsRate}
              min={0.5} max={2.0} step={0.25} display={`${preferences.ttsRate}×`}
              onChange={v => updatePreferences({ ttsRate: v })}
            />
            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
              <div>
                <span className="font-arabic text-sm font-bold block" style={{ color: 'var(--app-text)' }}>
                  إخفاء أشرطة الأدوات تلقائياً أثناء القراءة
                </span>
                <span className="text-[11px] font-arabic opacity-60">انقر على الشاشة لإظهار أو إخفاء الأشرطة</span>
              </div>
              <button
                onClick={() => updatePreferences({ autoHideControls: !preferences.autoHideControls })}
                className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
                style={{ background: preferences.autoHideControls ? 'var(--app-brand-grad)' : 'var(--app-brand-dim)' }}
              >
                <span
                  className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-md"
                  style={{ left: preferences.autoHideControls ? '26px' : '2px' }}
                />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── 8. DATA BACKUP & RESTORE ── */}
      <motion.div variants={itemVariants} className="app-surface rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
          >
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
              النسخ الاحتياطي ومزامنة البيانات
            </h3>
            <p className="text-xs font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
              تصدير واستيراد بياناتك (العلامات المرجعية، التظليلات، الإحصائيات)
            </p>
          </div>
        </div>

        {backupStatus && (
          <div
            className="p-3.5 rounded-2xl text-xs font-arabic font-medium flex items-center gap-2"
            style={{
              background: backupStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: backupStatus.type === 'success' ? '#0d8f60' : '#e05f7a',
              border: backupStatus.type === 'success' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(244,63,94,0.25)',
            }}
          >
            {backupStatus.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <RotateCcw className="w-4 h-4 shrink-0" />}
            <span>{backupStatus.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={exportFullBackup}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 text-white shadow-md"
            style={{ background: 'var(--app-brand-grad)', boxShadow: '0 4px 12px var(--app-brand-glow)' }}
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 cursor-pointer app-surface"
            style={{ color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
          >
            <Upload className="w-4 h-4" />
            <span>استعادة من ملف احتياطي</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </motion.div>

      {/* ── 9. Welcome Screen & Reset Actions ── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <button
          onClick={() => navigate('/welcome')}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 font-arabic text-sm font-semibold transition-all active:scale-95 app-surface"
          style={{ color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
        >
          <Sparkles className="w-4 h-4" />
          <span>عرض شاشة الترحيب والتعريف بكتاب إمتاع القارئ</span>
        </button>

        <button
          onClick={resetPrefs}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 font-arabic text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#e05f7a' }}
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة ضبط كافة الإعدادات إلى الوضع الافتراضي</span>
        </button>
      </motion.div>

      {/* ── 10. App Footnote ── */}
      <motion.div
        variants={itemVariants}
        className="app-surface rounded-2xl px-5 py-4 text-center"
      >
        <p className="text-xs font-arabic font-semibold" style={{ color: 'var(--app-text)' }}>
          إمتاع القارئ بجمال الكلم وروائع الحكم
        </p>
        <p className="text-[11px] font-arabic mt-0.5 opacity-60" style={{ color: 'var(--app-text-muted)' }}>
          محمد بن سعد النهاري • تصميم رقمي فاخر
        </p>
      </motion.div>
    </motion.div>
  );
};

/* ── Sub-components ── */
const SectionLabel: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-1 px-1">
    <div className="w-5 h-5 flex items-center justify-center" style={{ color: 'var(--app-brand)' }}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
    </div>
    <h3 className="text-sm font-bold font-arabic" style={{ color: 'var(--app-text)' }}>{title}</h3>
  </div>
);

const StatTile: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; bg: string }> = ({ icon, label, value, color, bg }) => (
  <div
    className="rounded-2xl p-4 flex items-center gap-3.5 transition-all app-surface app-surface-hover"
  >
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg }}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5', style: { color } })}
    </div>
    <div className="min-w-0">
      <div className="text-lg font-bold font-sans" style={{ color: 'var(--app-text)' }}>{value}</div>
      <div className="text-[11px] font-arabic truncate opacity-70" style={{ color: 'var(--app-text-muted)' }}>{label}</div>
    </div>
  </div>
);

const AchievementBadge: React.FC<{ emoji: string; label: string; unlocked: boolean }> = ({ emoji, label, unlocked }) => (
  <div
    className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center transition-all app-surface"
    style={{
      border: unlocked ? '1px solid var(--app-brand-border)' : '1px dashed rgba(128,128,128,0.2)',
      background: unlocked ? 'var(--app-brand-dim)' : 'transparent',
    }}
  >
    <span className={`text-2xl transition-all ${unlocked ? 'scale-110' : 'grayscale opacity-30'}`}>{emoji}</span>
    <span
      className={`text-[10px] font-arabic leading-tight ${unlocked ? 'font-bold' : 'font-medium opacity-50'}`}
      style={{ color: unlocked ? 'var(--app-brand)' : 'var(--app-text-muted)' }}
    >
      {label}
    </span>
  </div>
);

const SliderSetting: React.FC<{
  label: string; value: number; min: number; max: number; step: number;
  display: string; onChange: (v: number) => void;
}> = ({ label, value, min, max, step, display, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="font-arabic text-sm" style={{ color: 'var(--app-text)' }}>{label}</span>
      <span
        className="text-xs font-bold font-sans px-2.5 py-0.5 rounded-xl"
        style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
      >
        {display}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        accentColor: 'var(--app-brand)',
        background: `linear-gradient(to right, var(--app-brand) ${((value - min) / (max - min)) * 100}%, var(--app-brand-dim) 0%)`,
      }}
    />
  </div>
);
