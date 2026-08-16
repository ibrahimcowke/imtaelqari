import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, X, RotateCw, ChevronLeft,
  ChevronRight, Award, Flame, RefreshCw
} from 'lucide-react';
import type { FlashcardItem } from '../../types/book';

// Curated interactive flashcards extracted from book wisdoms and literary concepts
const DEFAULT_FLASHCARDS: Omit<FlashcardItem, 'reviewedCount' | 'isMastered'>[] = [
  {
    id: 'fc-1',
    page: 1,
    category: 'wisdom',
    front: 'ما هي الغاية العظمى من مجالسة الكتب وتدبر الحكمة كما بيّن مؤلف «إمتاع القارئ»؟',
    back: 'تهذيب النفس، واستنارة البصيرة، واقتباس درر الحكماء لتوجيه مسار الحياة نحو الصلاح والسداد.',
  },
  {
    id: 'fc-2',
    page: 5,
    category: 'concept',
    front: 'ما الفرق بين العلم النافع ومجرد حفظ المسائل؟',
    back: 'العلم النافع هو ما قارنه العمل وأثمر الخشية وحسن الخلق، بينما الحفظ المجرد حجة على صاحبه إن لم ينفعه.',
  },
  {
    id: 'fc-3',
    page: 12,
    category: 'poem',
    front: 'أكمل بيت الحكمة:\n«وفي الكتبِ إيناسٌ لمن كان مفرداً ...»',
    back: '«... ونزهةُ فكرٍ واجتلاءُ بصائرِ»',
  },
  {
    id: 'fc-4',
    page: 24,
    category: 'vocabulary',
    front: 'ما دلالة لفظ «السكون والبصيرة» في أدب السالكين؟',
    back: 'السكون طمأنينة القلب بالله، والبصيرة نور يقذفه الله في القلب يفرّق به بين الحق والباطل.',
  },
  {
    id: 'fc-5',
    page: 36,
    category: 'wisdom',
    front: 'كيف يتحقق «إمتاع القارئ» في مجالس الأدب التراثي؟',
    back: 'بالجمع بين عذوبة اللفظ وفصاحته، وجلال المعنى وفائدته، وحسن الترتيب الذي لا يملّ منه القارئ.',
  },
];

export const FlashcardsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToPage?: (page: number) => void;
}> = ({ open, onOpenChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  const cards = useMemo(() => DEFAULT_FLASHCARDS, []);
  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRate = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (difficulty === 'easy') {
      setMasteredIds((prev) => new Set([...prev, currentCard.id]));
      setScore((s) => s + 10);
    } else if (difficulty === 'medium') {
      setScore((s) => s + 5);
    }
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setScore(0);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl z-50 p-0 shadow-2xl focus:outline-none max-h-[92vh] flex flex-col overflow-hidden border"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  بطاقات المراجعة والحفظ التفاعلية
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-arabic"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                  >
                    {currentIndex + 1} من {cards.length}
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  اختبر ذاكرتك ورسّخ حكم وفوائد كتاب إمتاع القارئ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="إعادة البدء"
                className="p-2 rounded-xl text-xs font-arabic opacity-70 hover:opacity-100 hover:bg-black/5 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all opacity-80 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Stats Bar */}
          <div
            className="flex items-center justify-between px-6 py-2.5 bg-black/5 dark:bg-white/5 border-b text-xs font-arabic"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>النقاط المكتسبة: <strong>{score}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>المتقن: <strong>{masteredIds.size}</strong> / {cards.length}</span>
            </div>
          </div>

          {/* Body: 3D Flip Card Container */}
          <div className="p-5 sm:p-6 flex flex-col items-center justify-center flex-1 space-y-5">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-64 sm:h-72 rounded-3xl p-6 flex flex-col justify-between cursor-pointer border shadow-xl relative transition-all duration-300 select-none transform hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: isFlipped ? 'var(--app-brand-dim)' : 'var(--app-bg-2)',
                borderColor: isFlipped ? 'var(--app-brand)' : 'var(--app-surface-border)',
              }}
            >
              {/* Card Header Badge */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-arabic font-bold px-3 py-1 rounded-full"
                  style={{
                    background: isFlipped ? 'var(--app-brand)' : 'rgba(0,0,0,0.06)',
                    color: isFlipped ? 'white' : 'inherit',
                  }}
                >
                  {isFlipped ? '💡 الإجابة والشرح' : '❓ السؤال / المسألة'}
                </span>

                <span className="text-xs font-arabic opacity-60 flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  انقر للقلب
                </span>
              </div>

              {/* Card Center Content */}
              <div className="my-auto text-center py-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={isFlipped ? 'back' : 'front'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="font-arabic text-sm sm:text-base leading-relaxed font-bold"
                    style={{ color: 'var(--app-text)' }}
                  >
                    {isFlipped ? currentCard.back : currentCard.front}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[11px] font-arabic opacity-70 border-t pt-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <span>مأخوذة من ص {currentCard.page}</span>
                <span>{isFlipped ? 'اضغط للتقييم بالأسفل' : 'انقر على البطاقة لمعرفة الجواب'}</span>
              </div>
            </div>

            {/* Assessment Buttons when flipped */}
            {isFlipped ? (
              <div className="w-full flex items-center gap-2 animate-fade-in">
                <button
                  onClick={() => handleRate('hard')}
                  className="flex-1 py-3 px-2 rounded-2xl border text-xs font-arabic font-bold bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 active:scale-95 transition-all"
                >
                  🔴 يحتاج مراجعة
                </button>
                <button
                  onClick={() => handleRate('medium')}
                  className="flex-1 py-3 px-2 rounded-2xl border text-xs font-arabic font-bold bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 active:scale-95 transition-all"
                >
                  🟡 متوسط الصعوبة
                </button>
                <button
                  onClick={() => handleRate('easy')}
                  className="flex-1 py-3 px-2 rounded-2xl border text-xs font-arabic font-bold bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 active:scale-95 transition-all shadow-md"
                >
                  🟢 سهل ومتقن (+10)
                </button>
              </div>
            ) : (
              /* Navigation Controls when front */
              <div className="w-full flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-2xl border text-xs font-arabic font-bold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
                  style={{ borderColor: 'var(--app-surface-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                  السابقة
                </button>

                <button
                  onClick={() => setIsFlipped(true)}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-arabic font-bold text-white shadow-md active:scale-95 transition-all"
                  style={{ background: 'var(--app-brand-grad)' }}
                >
                  إظهار الإجابة
                </button>

                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-2xl border text-xs font-arabic font-bold flex items-center gap-1 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--app-surface-border)' }}
                >
                  التالية
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
