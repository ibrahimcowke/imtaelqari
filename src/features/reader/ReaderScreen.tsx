import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useReaderStore } from '../../store/readerStore';
import { bookDataService } from '../../data/service';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SettingsSheet } from './components/SettingsSheet';
import { ReaderHeader } from './components/ReaderHeader';
import { AnnotationsSidebar } from './components/AnnotationsSidebar';
import { TableOfContents } from './components/TableOfContents';
import { ProgressBar } from './components/ProgressBar';
import { HighlightPopover } from './components/HighlightPopover';
import { QuoteCardModal } from '../quote-studio/QuoteCardModal';
import { AmbientSoundModal } from '../audio/AmbientSoundModal';
import { ArabicDictionaryModal } from '../dictionary/ArabicDictionaryModal';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { checkInToday } from '../../services/streakService';

/* ── Edge Tap Zone with Animated Hand Hint ── */
const TapZone: React.FC<{
  side: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}> = ({ side, onClick, disabled }) => {
  const [pressed, setPressed] = useState(false);

  if (disabled) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="hidden md:flex absolute top-16 bottom-20 z-10 w-20 items-center justify-center cursor-pointer transition-all group select-none"
      style={{
        [side]: 0,
        background: pressed
          ? 'var(--app-brand-dim)'
          : 'transparent',
      }}
      title={side === 'left' ? 'الصفحة التالية (يسار)' : 'الصفحة السابقة (يمين)'}
    >
      <motion.div
        animate={pressed ? { scale: 0.85 } : { scale: [1, 1.1, 1] }}
        transition={pressed
          ? { duration: 0.1 }
          : { duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }
        }
        className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 p-2.5 rounded-2xl app-surface shadow-lg"
      >
        <span className="text-xl" style={{ transform: side === 'left' ? 'scaleX(-1)' : 'none' }}>
          👈
        </span>
        <span className="text-[10px] font-arabic font-bold" style={{ color: 'var(--app-brand)' }}>
          {side === 'left' ? 'التالية' : 'السابقة'}
        </span>
      </motion.div>
    </div>
  );
};

/* ── Mobile Navigation Pill ── */
const MobileNavBtn: React.FC<{
  direction: 'next' | 'prev';
  onClick: () => void;
  disabled?: boolean;
}> = ({ direction, onClick, disabled }) => (
  <motion.button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    whileTap={{ scale: 0.88 }}
    className="flex items-center justify-center rounded-2xl transition-all disabled:opacity-20 shrink-0 app-surface"
    style={{
      width: 44,
      height: 44,
    }}
    aria-label={direction === 'next' ? 'الصفحة التالية' : 'الصفحة السابقة'}
  >
    {direction === 'next'
      ? <ChevronLeft  className="w-5 h-5" style={{ color: 'var(--app-brand)' }} />
      : <ChevronRight className="w-5 h-5" style={{ color: 'var(--app-brand)' }} />
    }
  </motion.button>
);



/* ── Page Flip Animation Variants ── */
const pageFlipVariants: Variants = {
  enter: (dir: number) => ({
    x: dir < 0 ? 40 : -40,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? -40 : 40,
    opacity: 0,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const ReaderScreen: React.FC = () => {
  const { currentPage, preferences, setCurrentPage, toggleControls, isControlsVisible, isReadingAloud, toggleReadingAloud } = useReaderStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [isCardStudioOpen, setIsCardStudioOpen] = useState(false);
  const [quoteStudioInitialText, setQuoteStudioInitialText] = useState<string>('');
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [slideDir, setSlideDir] = useState<-1 | 1>(-1); // -1: Next, 1: Prev
  const totalPages = bookDataService.getPages().length;

  const pageData = bookDataService.getPage(currentPage);

  const isBookmarked = (useLiveQuery(
    () => db.bookmarks.where({ page: currentPage }).count(),
    [currentPage]
  ) ?? 0) > 0;

  const pageHighlights = useLiveQuery(
    () => db.highlights.where({ page: currentPage }).toArray(),
    [currentPage]
  ) ?? [];

  // Automatically record today's reading streak progress
  useEffect(() => {
    checkInToday();
  }, [currentPage]);

  // Touch gesture coordinates for swipe detection
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setSlideDir(-1);
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setSlideDir(1);
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, setCurrentPage]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // Text to speech
  useEffect(() => {
    const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window && !!window.speechSynthesis;

    if (!hasSpeechSynthesis) {
      return;
    }

    try {
      if (isReadingAloud) {
        window.speechSynthesis.cancel();
        const textToRead = pageData?.display_text || '';
        if (!textToRead) return;

        if (typeof SpeechSynthesisUtterance === 'undefined') return;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'ar-SA';
        utterance.rate = preferences.ttsRate;

        utterance.onend = () => {
          if (isReadingAloud) {
            if (currentPage < totalPages) {
              handleNextPage();
            } else {
              toggleReadingAloud();
            }
          }
        };

        utterance.onerror = () => {
          // Gracefully ignore TTS playback errors
        };

        window.speechSynthesis.speak(utterance);
      } else {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Graceful fallback if speech synthesis fails
    }

    return () => {
      if (hasSpeechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [isReadingAloud, currentPage, preferences.ttsRate, pageData, totalPages, handleNextPage, toggleReadingAloud]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      const bms = await db.bookmarks.where({ page: currentPage }).toArray();
      bms.forEach(bm => db.bookmarks.delete(bm.id));
    } else {
      await db.bookmarks.add({
        id: crypto.randomUUID(),
        page: currentPage,
        preview: pageData?.display_text.substring(0, 100) || '',
        createdAt: new Date().toISOString()
      });
    }
  };

  // Touch Swipe Handlers for Flip Gesture
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = touchEnd.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    if (window.getSelection()?.toString().length) return;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && deltaTime < 800) {
      if (deltaX < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
  };

  const handleReaderClick = (e: React.MouseEvent) => {
    if (window.getSelection()?.toString().length) return;

    const { clientX } = e;
    const { innerWidth } = window;

    if (clientX < innerWidth * 0.25) {
      handleNextPage();
    } else if (clientX > innerWidth * 0.75) {
      handlePrevPage();
    } else {
      if (preferences.autoHideControls) {
        toggleControls();
      }
    }
  };

  const showControls = preferences.autoHideControls ? isControlsVisible : true;

  const renderTextWithHighlights = (text: string, blockId: string) => {
    const highlights = pageHighlights.filter(h => h.blockId === blockId);
    if (!highlights.length) return text;

    let result = text;
    highlights.forEach(h => {
      const colorClass = h.color === 'amber' ? 'bg-amber-300/50 dark:bg-amber-500/30' :
                         h.color === 'rose' ? 'bg-rose-300/50 dark:bg-rose-500/30' :
                         h.color === 'sage' ? 'bg-teal-300/50 dark:bg-teal-500/30' : 'bg-slate-300/50 dark:bg-slate-500/30';
      result = result.replace(h.selectedText, `<mark class="${colorClass} px-1 rounded transition-colors">${h.selectedText}</mark>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  if (!pageData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-arabic gap-3" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
        <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: 'var(--app-brand-grad)' }} />
        <span>جاري فتح الصفحة...</span>
      </div>
    );
  }

  const containerMaxWidth =
    preferences.readerWidth === 'narrow' ? 'max-w-xl' :
    preferences.readerWidth === 'medium' ? 'max-w-3xl' : 'max-w-5xl';

  return (
    <div
      className="h-screen flex flex-col reader-container relative overflow-hidden select-text"
      style={{
        fontFamily: `"${preferences.fontFamily}", var(--app-font-family), "Noto Naskh Arabic", sans-serif`,
        fontSize: `${preferences.fontSize}px`,
        lineHeight: preferences.lineHeight,
        letterSpacing: preferences.letterSpacing === 'tight' ? '-0.5px' : preferences.letterSpacing === 'loose' ? '1px' : 'normal',
        textAlign: preferences.textAlign,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <HighlightPopover
        onOpenQuoteCard={(selectedText) => {
          setQuoteStudioInitialText(selectedText);
          setIsCardStudioOpen(true);
        }}
      />

      {/* ══════════════════════════════════════════════════
          1. TOP APP BAR
          ══════════════════════════════════════════════════ */}
      <ReaderHeader
        showControls={showControls}
        chapterTitle={pageData.title}
        currentPage={currentPage}
        totalPages={totalPages}
        isBookmarked={!!isBookmarked}
        isReadingAloud={isReadingAloud}
        onToggleBookmark={toggleBookmark}
        onToggleReadingAloud={toggleReadingAloud}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTOC={() => setIsTOCOpen(true)}
        onOpenAnnotations={() => setIsAnnotationsOpen(true)}
        onOpenQuoteStudio={() => {
          setQuoteStudioInitialText('');
          setIsCardStudioOpen(true);
        }}
        onOpenSoundModal={() => setIsSoundModalOpen(true)}
        onOpenDictModal={() => setIsDictModalOpen(true)}
      />

      {/* ── Left & Right Edge Tap Zones ── */}
      <TapZone
        side="left"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
      />
      <TapZone
        side="right"
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
      />

      {/* ══════════════════════════════════════════════════
          2. MAIN READING CANVAS
          ══════════════════════════════════════════════════ */}
      <div
        className="flex-1 overflow-y-auto w-full pt-16 pb-24 px-4 md:px-12 custom-scrollbar touch-pan-y"
        onClick={handleReaderClick}
      >
        <AnimatePresence mode="wait" initial={false} custom={slideDir}>
          <motion.div
            key={currentPage}
            custom={slideDir}
            variants={pageFlipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`${containerMaxWidth} mx-auto my-4 md:my-8 min-h-[60vh]`}
          >
            {preferences.mode === 'text' && (
              <div>
                {pageData.blocks.map(block => (
                  <div
                    key={block.id}
                    data-block-id={block.id}
                    className="mb-4 relative group"
                    style={{ marginBottom: `${preferences.paragraphSpacing}em` }}
                  >
                    {block.type === 'heading' && (
                      <div className="my-7 text-center">
                        <h2
                          className="text-2xl md:text-3xl font-bold font-arabic mb-2 leading-relaxed"
                          style={{ color: 'var(--app-brand)' }}
                        >
                          {renderTextWithHighlights(block.text, block.id)}
                        </h2>
                        <div className="ornament-divider text-xs text-brand-400">
                          <span>❊ ❊ ❊</span>
                        </div>
                      </div>
                    )}
                    {block.type === 'paragraph' && (
                      <p className="leading-relaxed font-arabic">
                        {renderTextWithHighlights(block.text, block.id)}
                      </p>
                    )}
                    {block.type === 'bullet' && (
                      <li className="list-disc list-inside ms-4 leading-relaxed font-arabic">
                        {renderTextWithHighlights(block.text, block.id)}
                      </li>
                    )}
                    {block.type === 'quote' && (
                      <blockquote
                        className="border-r-4 pr-4 italic my-6 p-4 rounded-l-2xl font-arabic leading-relaxed"
                        style={{
                          borderColor: 'var(--app-brand)',
                          background: 'var(--app-brand-dim)',
                        }}
                      >
                        {renderTextWithHighlights(block.text, block.id)}
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Desktop Floating Nav Chevrons ── */}
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-5 z-10">
        <motion.button
          onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
          disabled={currentPage >= totalPages}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-2xl shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none app-surface"
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-6 h-6" style={{ color: 'var(--app-brand)' }} />
        </motion.button>
      </div>
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-5 z-10">
        <motion.button
          onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
          disabled={currentPage <= 1}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-2xl shadow-xl transition-all disabled:opacity-0 disabled:pointer-events-none app-surface"
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-6 h-6" style={{ color: 'var(--app-brand)' }} />
        </motion.button>
      </div>

      {/* ══════════════════════════════════════════════════
          3. BOTTOM SCRUBBAR & MOBILE CONTROLS
          ══════════════════════════════════════════════════ */}
      <div className={`transition-transform duration-300 absolute bottom-0 left-0 right-0 z-20 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Mobile prev/next row above progress bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-2 gap-3 app-bar border-t"
          style={{
            borderTopColor: 'var(--app-bar-border)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Next page (RTL: left arrow) */}
          <MobileNavBtn
            direction="next"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          />

          {/* Page info */}
          <div className="flex-1 text-center">
            <div className="text-xs font-bold font-arabic" style={{ color: 'var(--app-text)' }}>
              صفحة {currentPage} من {totalPages}
            </div>
            <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--app-brand-grad)', width: `${Math.round((currentPage / totalPages) * 100)}%` }}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          </div>

          {/* Prev page (RTL: right arrow) */}
          <MobileNavBtn
            direction="prev"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          />
        </div>
        <ProgressBar />
      </div>

      {/* Modals & Dialogs */}
      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <AnnotationsSidebar open={isAnnotationsOpen} onOpenChange={setIsAnnotationsOpen} />
      <TableOfContents open={isTOCOpen} onOpenChange={setIsTOCOpen} />
      <QuoteCardModal
        open={isCardStudioOpen}
        onOpenChange={(isOpen) => {
          setIsCardStudioOpen(isOpen);
          if (!isOpen) setQuoteStudioInitialText('');
        }}
        quoteText={quoteStudioInitialText || pageData?.blocks?.[0]?.text || pageData?.display_text?.slice(0, 280) || ''}
        sourceText={pageData?.title || 'كتاب إمتاع القارئ'}
        pageNumber={currentPage}
      />
      <AmbientSoundModal
        open={isSoundModalOpen}
        onOpenChange={setIsSoundModalOpen}
      />
      <ArabicDictionaryModal
        open={isDictModalOpen}
        onOpenChange={setIsDictModalOpen}
      />
    </div>
  );
};
