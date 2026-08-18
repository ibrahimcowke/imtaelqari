import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, Play, Pause, RotateCcw,
  BookOpen, Clock
} from 'lucide-react';

export const ZenReaderModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPage: number;
  onNavigateToPage?: (page: number) => void;
}> = ({ open, onOpenChange, currentPage }) => {
  const [sessionDuration, setSessionDuration] = useState<number>(25 * 60); // 25 minutes default
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const startPageRef = useRef<number>(currentPage);

  useEffect(() => {
    startPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    let timer: any = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleStartPause = () => {
    setIsActive((prev) => !prev);
  };

  const handleReset = (durationMinutes: number = 25) => {
    setIsActive(false);
    setIsCompleted(false);
    setSessionDuration(durationMinutes * 60);
    setTimeLeft(durationMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.round(((sessionDuration - timeLeft) / sessionDuration) * 100);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg rounded-3xl z-50 shadow-2xl p-6 sm:p-8 overflow-y-auto focus:outline-none custom-scrollbar border text-center"
          style={{
            background: 'var(--app-bg)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
          }}
          dir="rtl"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 mb-6 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-right">
                <Dialog.Title className="text-base font-bold font-arabic">
                  جلسة التدبر والصفاء (Zen Mode)
                </Dialog.Title>
                <p className="text-[11px] font-arabic opacity-75" style={{ color: 'var(--app-text-muted)' }}>
                  قراءة مركزة خالية من المشتتات مع مؤقت بومودورو
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Circular Countdown Progress */}
          <div className="my-6 relative flex items-center justify-center">
            {/* Ambient Pulse Ring */}
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 flex flex-col items-center justify-center relative transition-all duration-500 shadow-xl ${
                isActive ? 'scale-102 border-emerald-500' : 'border-amber-500/30'
              }`}
              style={{
                background: 'var(--app-surface)',
                boxShadow: isActive ? '0 0 35px rgba(16, 185, 129, 0.25)' : 'none',
              }}
            >
              <span className="font-black text-4xl sm:text-5xl tracking-tight font-mono" style={{ color: 'var(--app-text)' }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-arabic font-bold opacity-75 mt-1" style={{ color: 'var(--app-brand)' }}>
                {isActive ? 'جاري التدبر والتأمل...' : isCompleted ? 'اكتملت الجلسة مباركاً 🌿' : 'جاهز للبدء'}
              </span>

              {/* Progress Percentage Badge */}
              <div className="absolute -bottom-3 px-3 py-0.5 rounded-full text-[10px] font-bold font-sans bg-black/10 dark:bg-white/15 border border-black/10">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Duration Selector Pills */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[15, 25, 45].map((mins) => {
              const isSelected = sessionDuration === mins * 60;
              return (
                <button
                  key={mins}
                  disabled={isActive}
                  onClick={() => handleReset(mins)}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-arabic font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  style={{
                    background: isSelected ? 'var(--app-brand-grad)' : 'var(--app-surface)',
                    borderColor: isSelected ? 'transparent' : 'var(--app-surface-border)',
                    color: isSelected ? 'white' : 'var(--app-text)',
                  }}
                >
                  {mins} دقيقة
                </button>
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="flex gap-2.5 max-w-xs mx-auto">
            <button
              onClick={handleStartPause}
              className="flex-1 py-3 rounded-2xl font-arabic text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
              style={{
                background: isActive ? '#dc2626' : 'var(--app-brand-grad)',
              }}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isActive ? 'إيقاف مؤقت' : 'بدء جلسة التدبر'}</span>
            </button>

            <button
              onClick={() => handleReset(sessionDuration / 60)}
              className="px-4 py-3 rounded-2xl font-arabic text-xs font-bold border transition-all active:scale-95 flex items-center justify-center app-surface cursor-pointer hover:brightness-105"
              style={{ color: 'var(--app-text)' }}
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-3 border-t flex items-center justify-between text-[11px] font-arabic opacity-75" style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text-muted)' }}>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>الصفحة الحالية: ص {currentPage}</span>
            </span>
            <span>جلسات هادئة لزيادة التركيز والاستيعاب</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
