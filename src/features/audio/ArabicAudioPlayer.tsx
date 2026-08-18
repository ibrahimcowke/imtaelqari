import React, { useState, useEffect } from 'react';
import {
  Volume2, Play, Pause, SkipForward, SkipBack,
  X, Sparkles, ChevronDown, ChevronUp,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { arabicTtsService, type TtsState } from '../../services/arabicTtsService';

export const ArabicAudioPlayer: React.FC<{
  onNextPage?: () => void;
}> = () => {
  const [ttsState, setTtsState] = useState<TtsState>(arabicTtsService.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = arabicTtsService.subscribe((state) => {
      setTtsState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!ttsState.isPlaying) {
    return null;
  }

  const speedRates = [0.75, 1.0, 1.25, 1.5, 1.75];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="fixed bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-lg select-none"
        dir="rtl"
      >
        <div
          className="rounded-3xl border shadow-2xl p-3 sm:p-4 backdrop-blur-2xl transition-all relative overflow-hidden"
          style={{
            background: 'var(--app-bar)',
            borderColor: 'var(--app-bar-border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            color: 'var(--app-text)',
          }}
        >
          {/* Progress Bar Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${ttsState.progress}%`,
                background: 'var(--app-brand-grad)',
              }}
            />
          </div>

          {/* Main Row */}
          <div className="flex items-center justify-between gap-2.5">
            {/* Right: Audio Wave & Engine Badge */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border relative shadow-sm"
                style={{
                  background: 'var(--app-brand-dim)',
                  borderColor: 'var(--app-brand-border)',
                  color: 'var(--app-brand)',
                }}
              >
                {!ttsState.isPaused ? (
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                    <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" style={{ height: '100%' }} />
                    <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
                    <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: '80%' }} />
                  </div>
                ) : (
                  <Volume2 className="w-5 h-5 opacity-60" />
                )}
              </div>

              {/* Spoken Text Preview */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-arabic font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {ttsState.engineMode === 'neural' ? 'صوت طبيعي فصيح' : 'صوت الجهاز'}
                  </span>
                  <span className="text-[10px] font-sans font-bold opacity-60">
                    {ttsState.progress}%
                  </span>
                </div>
                <p
                  className="text-xs font-arabic font-bold truncate mt-0.5 leading-snug cursor-pointer"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={ttsState.currentSentence}
                  style={{ color: 'var(--app-text)' }}
                >
                  {ttsState.currentSentence || 'جاري القراءة الصوتية...'}
                </p>
              </div>
            </div>

            {/* Center/Left Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Prev Sentence */}
              <button
                onClick={() => arabicTtsService.prevSentence()}
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer app-surface hover:brightness-105"
                style={{ color: 'var(--app-text)' }}
                title="الجملة السابقة"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={() => arabicTtsService.togglePlayPause()}
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white transition-all active:scale-90 cursor-pointer hover:brightness-110"
                style={{ background: 'var(--app-brand-grad)' }}
                title={ttsState.isPaused ? 'استئناف' : 'إيقاف مؤقت'}
              >
                {ttsState.isPaused ? (
                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                ) : (
                  <Pause className="w-4 h-4 fill-white" />
                )}
              </button>

              {/* Next Sentence */}
              <button
                onClick={() => arabicTtsService.nextSentence()}
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer app-surface hover:brightness-105"
                style={{ color: 'var(--app-text)' }}
                title="الجملة التالية"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Expand Settings */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer app-surface hover:brightness-105"
                style={{ color: 'var(--app-brand)' }}
                title="خيارات الصوت والسرعة"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* Stop & Close */}
              <button
                onClick={() => arabicTtsService.stop()}
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer hover:bg-rose-500/10 hover:text-rose-500"
                style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text-muted)' }}
                title="إغلاق القراءة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Drawer: Speed & Engine Chooser */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-3 mt-3 border-t space-y-2.5 overflow-hidden"
                style={{ borderColor: 'var(--app-divider)' }}
              >
                {/* Full Spoken Sentence Card */}
                <div
                  className="p-2.5 rounded-2xl border text-xs font-arabic leading-relaxed font-semibold"
                  style={{
                    background: 'var(--app-bg-2)',
                    borderColor: 'var(--app-divider)',
                    color: 'var(--app-text)',
                  }}
                >
                  {ttsState.currentSentence}
                </div>

                {/* Speed Rates & Voice Modes */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-arabic font-bold opacity-70 ml-1" style={{ color: 'var(--app-text-muted)' }}>
                      السرعة:
                    </span>
                    {speedRates.map((rate) => {
                      const isSelected = ttsState.rate === rate;
                      return (
                        <button
                          key={rate}
                          onClick={() => arabicTtsService.setRate(rate)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-sans font-bold border transition-all active:scale-95 cursor-pointer"
                          style={{
                            background: isSelected ? 'var(--app-brand-grad)' : 'var(--app-surface)',
                            borderColor: isSelected ? 'transparent' : 'var(--app-surface-border)',
                            color: isSelected ? 'white' : 'var(--app-text)',
                          }}
                        >
                          {rate}x
                        </button>
                      );
                    })}
                  </div>

                  {/* Engine Mode Toggle */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => arabicTtsService.setEngineMode('neural')}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-arabic font-bold border transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      style={{
                        background: ttsState.engineMode === 'neural' ? 'var(--app-brand-dim)' : 'transparent',
                        borderColor: ttsState.engineMode === 'neural' ? 'var(--app-brand)' : 'var(--app-divider)',
                        color: 'var(--app-brand)',
                      }}
                      title="صوت طبيعي نقي عبر الإنترنت"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>صوت طبيعي (Neural)</span>
                    </button>

                    <button
                      onClick={() => arabicTtsService.setEngineMode('system')}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-arabic font-bold border transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      style={{
                        background: ttsState.engineMode === 'system' ? 'var(--app-brand-dim)' : 'transparent',
                        borderColor: ttsState.engineMode === 'system' ? 'var(--app-brand)' : 'var(--app-divider)',
                        color: 'var(--app-brand)',
                      }}
                      title="صوت النظام المدمج دون اتصال"
                    >
                      <Radio className="w-3 h-3" />
                      <span>صوت الجهاز</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
