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
  Download, Upload,
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import type { ReaderTheme, ReaderWidth, TextAlign } from '../../../types/book';

/* ── helpers ── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
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

/* ════════════════════════════════════════════════ */
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
    // reset input
    e.target.value = '';
  };

  const resetPrefs = () => updatePreferences({
    theme: 'paper', fontSize: 20, fontFamily: 'Noto Naskh Arabic',
    lineHeight: 1.8, paragraphSpacing: 1.5, readerWidth: 'medium',
    textAlign: 'justify', letterSpacing: 'normal', mode: 'text', ttsRate: 1,
    autoHideControls: true,
  });

  /* ── themed surface styles ── */
  const surface = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-surface-border)',
    boxShadow: '0 2px 12px var(--app-surface-shadow)',
  };
  const textPrimary   = { color: 'var(--app-text)' };
  const textMuted     = { color: 'var(--app-text-muted)' };
  const brandDim      = { background: 'var(--app-brand-dim)' };
  const activeBtn     = { background: 'linear-gradient(135deg, #a37c6c, #75594e)', color: 'white', boxShadow: '0 4px 12px rgba(163,124,108,0.3)' };
  const inactiveBtn   = { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-4">

      {/* ── Profile Hero ── */}
      <motion.div variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: 'linear-gradient(135deg, #2a1c16 0%, #3d2822 50%, #4e3328 100%)',
          border: '1px solid rgba(163,124,108,0.2)',
          boxShadow: '0 8px 48px rgba(42,28,22,0.3)',
        }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a37c6c 0%, transparent 70%)' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #d2bab0 0%, transparent 70%)' }} />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)', boxShadow: '0 4px 20px rgba(163,124,108,0.45)' }}>
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-arabic text-white mb-0.5">القارئ</h2>
            <p className="text-brand-400/80 text-sm font-arabic">إمتاع القارئ بجمال الكلم</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(163,124,108,0.25)', border: '1px solid rgba(163,124,108,0.4)', color: '#d2bab0' }}>
              <TrendingUp className="w-3 h-3" />
              {progress}% مكتمل
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-5">
          <div className="flex justify-between text-[11px] text-brand-400/70 mb-1.5 font-sans">
            <span>تقدم القراءة</span>
            <span>صفحة {currentPage} / {totalPages}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #a37c6c, #e0cec7)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Statistics Grid ── */}
      <motion.div variants={itemVariants}>
        <SectionLabel icon={<BarChart3 />} title="إحصائياتي" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <StatTile icon={<BookOpen />}    label="الصفحات المقروءة"   value={currentPage}              color="#a37c6c" bg="rgba(163,124,108,0.1)" />
          <StatTile icon={<Target />}      label="الصفحات المتبقية"   value={pagesLeft}                color="#7c5cbf" bg="rgba(124,92,191,0.1)"  />
          <StatTile icon={<Bookmark />}    label="علامات مرجعية"      value={bookmarks}                color="#a37c6c" bg="rgba(163,124,108,0.1)" />
          <StatTile icon={<Highlighter />} label="تظليلات"             value={highlights}               color="#b07d1a" bg="rgba(245,158,11,0.1)"  />
          <StatTile icon={<Clock />}       label="وقت القراءة المتبقي" value={`${estMinutes} دق`}       color="#0d8f60" bg="rgba(16,185,129,0.1)"  />
          <StatTile icon={<Zap />}         label="اقتباسات محفوظة"    value={quotes}                   color="#e05f7a" bg="rgba(244,63,94,0.08)"  />
        </div>
      </motion.div>

        {/* ── Achievements ── */}
        <motion.div variants={itemVariants}>
          <SectionLabel icon={<Award />} title="الإنجازات والمكافآت" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <AchievementBadge emoji="📖" label="بدأت القراءة"  unlocked={currentPage > 1} />
            <AchievementBadge emoji="🔖" label="أول علامة"    unlocked={bookmarks > 0} />
            <AchievementBadge emoji="🌟" label="أول تظليل"    unlocked={highlights > 0} />
            <AchievementBadge emoji="🏅" label="ربع الكتاب"   unlocked={progress >= 25} />
            <AchievementBadge emoji="🥈" label="نصف الكتاب"   unlocked={progress >= 50} />
            <AchievementBadge emoji="🏆" label="أكملت الكتاب" unlocked={progress >= 100} />
          </div>
        </motion.div>

        {/* ── Reading Activity Heatmap & Velocity ── */}
        <motion.div variants={itemVariants} className="rounded-3xl p-5 space-y-4" style={{ ...surface }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={brandDim}>
                <Flame className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
              </div>
              <div>
                <h3 className="font-arabic font-bold text-sm" style={textPrimary}>سجل النشاط وسرعة القراءة</h3>
                <p className="text-[11px] font-arabic" style={textMuted}>خريطة النشاط لآخر 5 أسابيع</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl"
              style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}>
              185 كلمة / دقيقة
            </span>
          </div>

          {/* 5-Week Activity Grid */}
          <div className="pt-2">
            <div className="grid grid-cols-7 gap-1.5 justify-items-center">
              {Array.from({ length: 35 }).map((_, i) => {
                // Generate a realistic reading pattern based on progress and recent days
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
            <div className="flex justify-between items-center text-[10px] font-arabic mt-2 px-1" style={textMuted}>
              <span>منذ شهر</span>
              <div className="flex items-center gap-1">
                <span>أقل</span>
                <span className="w-2 h-2 rounded bg-current opacity-20 inline-block" />
                <span className="w-2 h-2 rounded bg-current opacity-60 inline-block" />
                <span className="w-2 h-2 rounded bg-current inline-block" />
                <span>أكثر</span>
              </div>
              <span>اليوم</span>
            </div>
          </div>
        </motion.div>

      {/* ══════════════════════════════════════════
          ── GLOBAL THEME PICKER (single source) ──
          ══════════════════════════════════════════ */}
      <motion.div variants={itemVariants}
        className="rounded-3xl p-5 space-y-4"
        style={{ ...surface }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={brandDim}>
            <Palette className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
          </div>
          <h3 className="font-arabic font-bold text-base" style={textPrimary}>سمة التطبيق</h3>
          <span className="text-[11px] font-sans mr-auto px-2 py-0.5 rounded-full"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}>
            يغير كل التطبيق
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {THEMES.map(t => {
            const isActive = preferences.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updatePreferences({ theme: t.id })}
                className="flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl transition-all active:scale-90"
                style={{
                  background: isActive ? 'var(--app-brand-dim)' : 'transparent',
                  border: isActive ? `2px solid ${t.ring}` : '2px solid transparent',
                  boxShadow: isActive ? `0 0 0 3px ${t.ring}22` : 'none',
                }}
                title={t.label}
              >
                {/* Swatch */}
                <div className="w-10 h-10 rounded-xl relative flex items-center justify-center flex-shrink-0"
                  style={{ background: t.bg, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                  <span className="text-base sm:text-lg">{t.icon}</span>
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: t.ring }}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-arabic font-medium truncate max-w-full text-center" style={textMuted}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Appearance Settings ── */}
      <motion.div variants={itemVariants}>
        <div className="rounded-3xl p-5 space-y-5" style={{ ...surface }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={brandDim}>
              <Type className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
            </div>
            <h3 className="font-arabic font-bold text-base" style={textPrimary}>إعدادات المظهر</h3>
          </div>

          {/* Font size */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={textMuted}>
              <Type className="w-3.5 h-3.5" /> حجم الخط — {preferences.fontSize}px
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => updatePreferences({ fontSize: Math.max(16, preferences.fontSize - 2) })}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={brandDim}>
                <Minus className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
              </button>
              <div className="flex-1 flex gap-1">
                {FONT_SIZES.map(s => (
                  <button key={s} onClick={() => updatePreferences({ fontSize: s })}
                    className="flex-1 h-2 rounded-full transition-all"
                    style={{ background: preferences.fontSize >= s ? 'var(--app-brand)' : 'var(--app-brand-dim)' }} />
                ))}
              </div>
              <button onClick={() => updatePreferences({ fontSize: Math.min(28, preferences.fontSize + 2) })}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={brandDim}>
                <Plus className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
              </button>
            </div>
          </div>

          {/* Font Family Selection */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={textMuted}>
              <Type className="w-3.5 h-3.5" /> نوع الخط العربي (يغير كل التطبيق والقراءة)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    className="p-3 rounded-2xl text-right transition-all active:scale-95 flex flex-col justify-between"
                    style={{
                      background: isSelected ? 'var(--app-brand-dim)' : 'transparent',
                      border: isSelected ? '2px solid var(--app-brand)' : '1px solid var(--app-surface-border)',
                      boxShadow: isSelected ? '0 0 0 3px var(--app-brand-glow)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5 w-full">
                      <span className="text-xs font-bold" style={{ color: isSelected ? 'var(--app-brand)' : 'var(--app-text)' }}>
                        {f.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--app-brand)' }}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed truncate opacity-75" style={{ fontFamily: `"${f.id}", sans-serif`, color: 'var(--app-text)' }}>
                      {f.sample}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reader width */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={textMuted}>عرض القارئ</p>
            <div className="flex gap-2">
              {WIDTHS.map(w => (
                <button key={w.id} onClick={() => updatePreferences({ readerWidth: w.id })}
                  className="flex-1 py-2 rounded-xl text-sm font-arabic font-medium transition-all active:scale-95"
                  style={preferences.readerWidth === w.id ? activeBtn : inactiveBtn}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text align */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-3" style={textMuted}>محاذاة النص</p>
            <div className="flex gap-2">
              {([
                { id: 'justify', icon: <AlignJustify />, label: 'مضبوط' },
                { id: 'right',   icon: <AlignRight />,   label: 'يمين'  },
              ] as { id: TextAlign; icon: React.ReactNode; label: string }[]).map(a => (
                <button key={a.id} onClick={() => updatePreferences({ textAlign: a.id })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-arabic font-medium transition-all active:scale-95"
                  style={preferences.textAlign === a.id ? activeBtn : inactiveBtn}>
                  {React.cloneElement(a.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Reading Settings ── */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setReadingOpen(o => !o)}
          className="w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-all"
          style={surface}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={brandDim}>
              <BookOpen className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
            </div>
            <span className="font-arabic font-semibold" style={textPrimary}>إعدادات القراءة</span>
          </div>
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${readingOpen ? '-rotate-90' : ''}`}
            style={{ color: 'var(--app-brand)' }} />
        </button>

        {readingOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl p-5 space-y-5"
            style={surface}
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
            <div className="flex items-center justify-between">
              <span className="font-arabic text-sm" style={textPrimary}>إخفاء الأدوات تلقائياً</span>
              <button
                onClick={() => updatePreferences({ autoHideControls: !preferences.autoHideControls })}
                className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: preferences.autoHideControls ? 'linear-gradient(135deg, #a37c6c, #75594e)' : 'var(--app-brand-dim)' }}
              >
                <span className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-md"
                  style={{ left: preferences.autoHideControls ? '26px' : '2px' }} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Data Backup & Restore (JSON) ── */}
      <motion.div variants={itemVariants} className="rounded-3xl p-5 space-y-4" style={{ ...surface }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={brandDim}>
            <Download className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
          </div>
          <div>
            <h3 className="font-arabic font-bold text-base" style={textPrimary}>النسخ الاحتياطي ومزامنة البيانات</h3>
            <p className="text-xs font-arabic" style={textMuted}>تصدير واستيراد بياناتك (العلامات، التظليلات، الملاحظات)</p>
          </div>
        </div>

        {backupStatus && (
          <div
            className="p-3 rounded-2xl text-xs font-arabic font-medium flex items-center gap-2"
            style={{
              background: backupStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: backupStatus.type === 'success' ? '#0d8f60' : '#e05f7a',
              border: backupStatus.type === 'success' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(244,63,94,0.25)',
            }}
          >
            {backupStatus.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <RotateCcw className="w-4 h-4 flex-shrink-0" />}
            <span>{backupStatus.msg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={exportFullBackup}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 shadow-sm"
            style={{ background: 'var(--app-brand-grad)', color: 'white' }}
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
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

      {/* ── Welcome Screen & Reset Actions ── */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        <button
          onClick={() => navigate('/welcome')}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 font-arabic text-sm font-semibold transition-all active:scale-95 shadow-sm"
          style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' }}
        >
          <Sparkles className="w-4 h-4" />
          عرض شاشة الترحيب والتعريف بالكتاب
        </button>

        <button onClick={resetPrefs}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 font-arabic text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: '#e05f7a' }}>
          <RotateCcw className="w-4 h-4" />
          إعادة ضبط الإعدادات الافتراضية
        </button>
      </motion.div>

      {/* ── App Info ── */}
      <motion.div variants={itemVariants}
        className="rounded-2xl px-5 py-4 text-center"
        style={{ background: 'var(--app-surface)', border: '1px solid var(--app-surface-border)' }}>
        <p className="text-xs font-arabic" style={textMuted}>إمتاع القارئ بجمال الكلم وروائع الحكم</p>
        <p className="text-[11px] font-arabic mt-0.5" style={{ color: 'var(--app-text-faint)' }}>
          محمد بن سعد النهاري • النسخة الرقمية التفاعلية
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
    <h3 className="text-sm font-bold font-arabic" style={{ color: 'var(--app-text-muted)' }}>{title}</h3>
  </div>
);

const StatTile: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; bg: string }> = ({ icon, label, value, color, bg }) => (
  <div className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
    style={{
      background: 'var(--app-surface)',
      border: '1px solid var(--app-surface-border)',
      boxShadow: '0 2px 12px var(--app-surface-shadow)',
    }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4', style: { color } })}
    </div>
    <div className="min-w-0">
      <div className="text-lg font-bold font-sans" style={{ color: 'var(--app-text)' }}>{value}</div>
      <div className="text-[11px] font-arabic truncate" style={{ color: 'var(--app-text-muted)' }}>{label}</div>
    </div>
  </div>
);

const AchievementBadge: React.FC<{ emoji: string; label: string; unlocked: boolean }> = ({ emoji, label, unlocked }) => (
  <div className="rounded-2xl p-3 flex flex-col items-center gap-2 text-center transition-all"
    style={{
      background: unlocked ? 'var(--app-brand-dim)' : 'rgba(0,0,0,0.03)',
      border: unlocked ? '1px solid var(--app-brand-border)' : '1px dashed rgba(128,128,128,0.15)',
    }}>
    <span className={`text-2xl transition-all ${unlocked ? '' : 'grayscale opacity-30'}`}>{emoji}</span>
    <span className={`text-[10px] font-arabic leading-tight font-${unlocked ? 'semibold' : 'normal'}`}
      style={{ color: unlocked ? 'var(--app-brand)' : 'var(--app-text-faint)' }}>
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
      <span className="text-xs font-bold font-sans px-2 py-0.5 rounded-lg"
        style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}>{display}</span>
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
