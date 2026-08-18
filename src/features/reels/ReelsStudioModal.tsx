import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Film, Sparkles, X, RotateCcw,
  Share2, Copy, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

interface StoryPreset {
  title: string;
  quote: string;
  author: string;
  category: string;
  bgGrad: string;
  textColor: string;
  accentColor: string;
}

const REEL_PRESETS: StoryPreset[] = [
  {
    title: 'عزة النفس والمعالي',
    quote: 'إِذا غامَرتَ في شَرَفٍ مَرومِ\nفَلا تَقنَع بِما دونَ النُجومِ',
    author: 'أبو الطيب المتنبي',
    category: 'فروسية وهمة',
    bgGrad: 'linear-gradient(180deg, #1c1512 0%, #0d0806 50%, #170d08 100%)',
    textColor: '#fdf6ee',
    accentColor: '#d4af37',
  },
  {
    title: 'أنس الكتاب وجلاله',
    quote: 'أَعَزُّ مَكانٍ في الدُّنَى سَرْجُ سابِحٍ\nوَخَيْرُ جَليسٍ في الزّمانِ كِتابُ',
    author: 'المتنبي',
    category: 'فضل القراءة',
    bgGrad: 'linear-gradient(180deg, #0a1811 0%, #030b07 50%, #06130d 100%)',
    textColor: '#ecfdf5',
    accentColor: '#34d399',
  },
  {
    title: 'السكينة والرضا',
    quote: 'دَعِ الأَيَّامَ تَفْعَلُ مَا تَشَاءُ\nوَطِبْ نَفْساً إِذَا حَكَمَ القَضَاءُ',
    author: 'الإمام الشافعي',
    category: 'حكمة وطمأنينة',
    bgGrad: 'linear-gradient(180deg, #0b1329 0%, #040817 50%, #081226 100%)',
    textColor: '#f0f9ff',
    accentColor: '#38bdf8',
  },
  {
    title: 'المروءة والوفاء',
    quote: 'ما ندمتُ على سكوتٍ قط، ولقد ندمتُ على الكلامِ مراراً.',
    author: 'لقمان الحكيم',
    category: 'أدب وصمت',
    bgGrad: 'linear-gradient(180deg, #1a0f18 0%, #0a0409 50%, #150813 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f472b6',
  }
];

export const ReelsStudioModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultQuote?: string;
  defaultAuthor?: string;
}> = ({ open, onOpenChange, defaultQuote, defaultAuthor }) => {
  const [selectedPreset, setSelectedPreset] = useState<StoryPreset>(REEL_PRESETS[0]);
  const [quoteText, setQuoteText] = useState(defaultQuote || REEL_PRESETS[0].quote);
  const [authorText, setAuthorText] = useState(defaultAuthor || REEL_PRESETS[0].author);
  const [animationKey, setAnimationKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (defaultQuote) {
      setQuoteText(defaultQuote);
      if (defaultAuthor) setAuthorText(defaultAuthor);
    }
  }, [defaultQuote, defaultAuthor]);

  const handleRestartAnimation = () => {
    setAnimationKey((k) => k + 1);
  };

  const handleShare = async () => {
    const shareText = `«${quoteText}»\n— ${authorText}\n\nمن درر كتاب إمتاع القارئ 📜✨`;
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: 'روائع من إمتاع القارئ',
          text: shareText,
          dialogTitle: 'مشاركة قصة متحركة',
        });
      } catch {
        // Fallback
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'روائع من إمتاع القارئ',
          text: shareText,
        });
      } catch {
        // Fallback
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyText = async () => {
    const text = `«${quoteText}»\n— ${authorText}\n\nمن كتاب إمتاع القارئ`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl max-h-[92vh] rounded-3xl z-50 shadow-2xl p-5 sm:p-7 overflow-y-auto focus:outline-none custom-scrollbar border"
          style={{
            background: 'var(--app-bg)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Film className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  <span>استوديو الريلز والقصص المتحركة</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    9:16 Story
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-75" style={{ color: 'var(--app-text-muted)' }}>
                  تصميم قصص متحركة فاخرة للنشر على واتساب وإنستغرام وتيك توك
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* 9:16 Animated Canvas Preview */}
            <div className="flex flex-col items-center">
              <div
                key={animationKey}
                className="w-64 sm:w-72 h-105 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none border border-white/10"
                style={{ background: selectedPreset.bgGrad }}
              >
                {/* Ambient glow particles */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none"
                  style={{ background: selectedPreset.accentColor }}
                />
                <div
                  className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
                  style={{ background: selectedPreset.accentColor }}
                />

                {/* Top Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-between z-10"
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                    <span className="text-[10px] font-arabic font-bold text-white/90">إمتاع القارئ</span>
                  </div>
                  <span className="text-[9px] font-arabic font-medium text-white/60">
                    {selectedPreset.category}
                  </span>
                </motion.div>

                {/* Animated Central Quote */}
                <div className="my-auto z-10 text-center space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.25, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl text-amber-300/40 font-serif leading-none"
                  >
                    ❝
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-base sm:text-lg font-bold font-arabic leading-loose whitespace-pre-line tracking-wide"
                    style={{ color: selectedPreset.textColor }}
                  >
                    {quoteText}
                  </motion.p>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40px' }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="h-0.5 mx-auto rounded-full"
                    style={{ background: selectedPreset.accentColor }}
                  />

                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.85 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-xs font-arabic font-bold block"
                    style={{ color: selectedPreset.accentColor }}
                  >
                    — {authorText}
                  </motion.span>
                </div>

                {/* Bottom App Branding */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-center justify-between text-[9px] font-arabic text-white/50 border-t border-white/10 pt-2 z-10"
                >
                  <span>كتاب إمتاع القارئ</span>
                  <span>تطبيق إسلامي وتراثي</span>
                </motion.div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleRestartAnimation}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-arabic font-semibold app-surface cursor-pointer hover:brightness-105"
                  style={{ color: 'var(--app-text)' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الحركة</span>
                </button>
              </div>
            </div>

            {/* Editing Controls & Preset Selection */}
            <div className="space-y-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-arabic font-bold opacity-75 block" style={{ color: 'var(--app-text-muted)' }}>
                  اختر من روائع الحكم الجاهزة:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {REEL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setQuoteText(preset.quote);
                        setAuthorText(preset.author);
                        setAnimationKey((k) => k + 1);
                      }}
                      className="p-2.5 rounded-2xl border text-right transition-all active:scale-95 cursor-pointer app-surface hover:shadow-sm"
                      style={{
                        borderColor: selectedPreset.title === preset.title ? 'var(--app-brand)' : 'var(--app-surface-border)',
                      }}
                    >
                      <span className="text-xs font-arabic font-bold block truncate" style={{ color: 'var(--app-text)' }}>
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-arabic opacity-70 block truncate mt-0.5">
                        {preset.author}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text inputs */}
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-arabic font-bold opacity-75 block mb-1" style={{ color: 'var(--app-text-muted)' }}>
                    نص الحكمة أو البيت الشعري:
                  </label>
                  <textarea
                    rows={3}
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs font-arabic focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    style={{
                      borderColor: 'var(--app-surface-border)',
                      background: 'var(--app-bg-2)',
                      color: 'var(--app-text)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-arabic font-bold opacity-75 block mb-1" style={{ color: 'var(--app-text-muted)' }}>
                    القائل / المصدر:
                  </label>
                  <input
                    type="text"
                    value={authorText}
                    onChange={(e) => setAuthorText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-arabic focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    style={{
                      borderColor: 'var(--app-surface-border)',
                      background: 'var(--app-bg-2)',
                      color: 'var(--app-text)',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-2xl font-arabic text-xs font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
                  style={{ background: 'var(--app-brand-grad)' }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة القصة (Story)</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="px-4 py-2.5 rounded-2xl font-arabic text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer app-surface hover:brightness-105"
                  style={{ color: 'var(--app-text)' }}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
