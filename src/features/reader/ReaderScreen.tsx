import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useReaderStore } from '../../store/readerStore';
import { bookDataService } from '../../data/service';
import {
  ArrowRight, Settings, Bookmark,
  List, ChevronLeft, ChevronRight,
  Volume2, VolumeX, PanelRightOpen,
  Music, Sparkles, BookMarked,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SettingsSheet } from './components/SettingsSheet';
import { ReaderModeToggle } from './components/ReaderModeToggle';
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

/* ── Edge Tap Zone with Animated Hand Hint ── */
const TapZone: React.FC<{
  side: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
  isDark: boolean;
}> = ({ side, onClick, disabled, isDark }) => {
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
          ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(163,124,108,0.1)')
          : 'transparent',
      }}
      title={side === 'left' ? 'الصفحة التالية (يسار)' : 'الصفحة السابقة (يمين)'}
    >
      <motion.div
        animate={pressed ? { scale: 0.85 } : { scale: [1, 1.12, 1] }}
        transition={pressed
          ? { duration: 0.1 }
          : { duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }
        }
        className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 p-2 rounded-2xl"
        style={{
          background: isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.9)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(163,124,108,0.2)',
        }}
      >
        <span className="text-xl" style={{ transform: side === 'left' ? 'scaleX(-1)' : 'none' }}>
          👈
        </span>
        <span className="text-[10px] font-arabic font-bold text-brand-600">
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
  isDark: boolean;
}> = ({ direction, onClick, disabled, isDark }) => (
  <motion.button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    whileTap={{ scale: 0.88 }}
    className="flex items-center justify-center rounded-2xl transition-all disabled:opacity-20 shrink-0"
    style={{
      width: 44,
      height: 44,
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(163,124,108,0.12)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(163,124,108,0.25)',
    }}
    aria-label={direction === 'next' ? 'الصفحة التالية' : 'الصفحة السابقة'}
  >
    {direction === 'next'
      ? <ChevronLeft  className="w-5 h-5" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
      : <ChevronRight className="w-5 h-5" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
    }
  </motion.button>
);

/* ── Header Icon Button ── */
const HeaderBtn: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  isDark: boolean;
  active?: boolean;
}> = ({ onClick, icon, label, isDark, active = false }) => (
  <button
    onClick={onClick}
    title={label}
    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 shrink-0"
    style={{
      background: active
        ? (isDark ? 'rgba(163,124,108,0.4)' : 'rgba(163,124,108,0.15)')
        : 'transparent',
      color: active
        ? (isDark ? '#e0cec7' : '#a37c6c')
        : (isDark ? 'rgba(224,206,199,0.55)' : 'rgba(117,89,78,0.65)'),
      border: active
        ? (isDark ? '1px solid rgba(163,124,108,0.5)' : '1px solid rgba(163,124,108,0.3)')
        : '1px solid transparent',
    }}
  >
    {icon}
  </button>
);

/* ── Page Flip Animation Variants ── */
const pageFlipVariants: Variants = {
  enter: (dir: number) => ({
    x: dir < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.98,
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
    x: dir < 0 ? -50 : 50,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const ReaderScreen: React.FC = () => {
  const { currentPage, preferences, setCurrentPage, toggleControls, isControlsVisible, isReadingAloud, toggleReadingAloud } = useReaderStore();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [isCardStudioOpen, setIsCardStudioOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [slideDir, setSlideDir] = useState<-1 | 1>(-1); // -1: Next, 1: Prev
  const totalPages = bookDataService.getPages().length;
  const isDark = preferences.theme === 'dark';

  const pageData = bookDataService.getPage(currentPage);

  const isBookmarked = (useLiveQuery(
    () => db.bookmarks.where({ page: currentPage }).count(),
    [currentPage]
  ) ?? 0) > 0;

  const pageHighlights = useLiveQuery(
    () => db.highlights.where({ page: currentPage }).toArray(),
    [currentPage]
  ) ?? [];

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
      // Graceful fallback if speech synthesis fails in WebView
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

    // Skip if user was selecting text
    if (window.getSelection()?.toString().length) return;

    // Horizontal swipe threshold: min 40px, predominantly horizontal, within reasonable time (800ms)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && deltaTime < 800) {
      if (deltaX < 0) {
        // Swiped Left -> Next page in Arabic (RTL)
        handleNextPage();
      } else {
        // Swiped Right -> Previous page in Arabic (RTL)
        handlePrevPage();
      }
    }
  };

  // Tap handler (Tap left 25% -> next, Tap right 25% -> prev, Tap center -> toggle toolbar)
  const handleReaderClick = (e: React.MouseEvent) => {
    // Don't trigger if user is selecting text
    if (window.getSelection()?.toString().length) return;
    
    const { clientX } = e;
    const { innerWidth } = window;
    
    // Arabic RTL: Left side (0-25%) goes to next page, Right side (75-100%) goes to prev page
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
      const colorClass = h.color === 'amber' ? 'bg-amber-200/60' :
                         h.color === 'rose' ? 'bg-rose-200/60' :
                         h.color === 'sage' ? 'bg-teal-200/60' : 'bg-slate-200/60';
      result = result.replace(h.selectedText, `<mark class="${colorClass} px-1 rounded">${h.selectedText}</mark>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  if (!pageData) {
    return <div className="h-screen flex items-center justify-center font-arabic">جاري التحميل...</div>;
  }

  const containerMaxWidth = 
    preferences.readerWidth === 'narrow' ? 'max-w-xl' :
    preferences.readerWidth === 'medium' ? 'max-w-3xl' : 'max-w-5xl';

  return (
    <div
      className="h-screen flex flex-col reader-container relative overflow-hidden select-text"
      style={{ 
        fontFamily: preferences.fontFamily, 
        fontSize: `${preferences.fontSize}px`, 
        lineHeight: preferences.lineHeight,
        letterSpacing: preferences.letterSpacing === 'tight' ? '-0.5px' : preferences.letterSpacing === 'loose' ? '1px' : 'normal',
        textAlign: preferences.textAlign,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <HighlightPopover />

      {/* ══ Top App Bar ══ */}
      <div
        className={`absolute top-0 w-full z-20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showControls ? 'translate-y-0' : '-translate-y-full'}`}
        style={{
          background: isDark
            ? 'rgba(18,18,18,0.88)'
            : 'rgba(253,248,246,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(163,124,108,0.12)',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.3)'
            : '0 4px 24px rgba(163,124,108,0.08)',
        }}
      >
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          {/* LEFT — back button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95 font-arabic text-xs font-semibold"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(163,124,108,0.1)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(163,124,108,0.18)',
                color: isDark ? '#e0cec7' : '#8c6b5d',
              }}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">القائمة</span>
            </button>
          </div>

          {/* CENTER — mode indicator + page title */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0 overflow-hidden">
            <ReaderModeToggle isDark={isDark} />
            <div
              className="text-[10px] font-arabic font-medium truncate max-w-40 sm:max-w-xs opacity-60"
              style={{ color: isDark ? '#e0cec7' : '#75594e' }}
            >
              {pageData.title}
            </div>
          </div>

          {/* RIGHT — action icons */}
          <div className="flex items-center gap-1 shrink-0">
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsSoundModalOpen(true); }}
              icon={<Music className="w-4 h-4" />}
              label="أصوات التركيز"
              isDark={isDark}
            />
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsDictModalOpen(true); }}
              icon={<BookMarked className="w-4 h-4" />}
              label="المعجم اللغوي"
              isDark={isDark}
            />
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsCardStudioOpen(true); }}
              icon={<Sparkles className="w-4 h-4" />}
              label="استوديو البطاقات"
              isDark={isDark}
            />
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsTOCOpen(true); }}
              icon={<List className="w-4 h-4" />}
              label="المحتويات"
              isDark={isDark}
            />
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); toggleReadingAloud(); }}
              icon={isReadingAloud
                ? <Volume2 className="w-4 h-4 animate-pulse" />
                : <VolumeX className="w-4 h-4" />
              }
              label={isReadingAloud ? 'إيقاف القراءة' : 'قراءة بصوت'}
              isDark={isDark}
              active={isReadingAloud}
            />
            <HeaderBtn
              onClick={toggleBookmark}
              icon={isBookmarked
                ? <Bookmark className="w-4 h-4 fill-current" />
                : <Bookmark className="w-4 h-4" />
              }
              label={isBookmarked ? 'إزالة العلامة' : 'إضافة علامة'}
              isDark={isDark}
              active={isBookmarked as boolean}
            />
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsAnnotationsOpen(true); }}
              icon={<PanelRightOpen className="w-4 h-4" />}
              label="الملاحظات"
              isDark={isDark}
            />
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
              icon={<Settings className="w-4 h-4" />}
              label="الإعدادات"
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* ── Left & Right Edge Tap/Flip Zones ── */}
      <TapZone
        side="left"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
        isDark={isDark}
      />
      <TapZone
        side="right"
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
        isDark={isDark}
      />

      {/* ── Main Content Area with Flip Animations ── */}
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
                  <div key={block.id} data-block-id={block.id} className="mb-4 relative group" style={{ marginBottom: `${preferences.paragraphSpacing}em` }}>
                    {block.type === 'heading' && (
                      <h2 className={`text-2xl font-bold text-brand-800 my-6 ${preferences.textAlign === 'center' ? 'text-center' : ''}`}>{renderTextWithHighlights(block.text, block.id)}</h2>
                    )}
                    {block.type === 'paragraph' && (
                      <p className="leading-relaxed">{renderTextWithHighlights(block.text, block.id)}</p>
                    )}
                    {block.type === 'bullet' && (
                      <li className="list-disc list-inside ms-4 leading-relaxed">{renderTextWithHighlights(block.text, block.id)}</li>
                    )}
                    {block.type === 'quote' && (
                      <blockquote className="border-r-4 border-brand-500 pr-4 italic opacity-90 my-6 bg-brand-50/50 p-4 rounded-l-lg">
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

      {/* ── Desktop Nav Floating Buttons ── */}
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-4 z-10">
        <motion.button
          onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
          disabled={currentPage >= totalPages}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-2xl shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
          title="الصفحة التالية"
        >
          <ChevronLeft className="w-7 h-7" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
        </motion.button>
      </div>
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-4 z-10">
        <motion.button
          onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
          disabled={currentPage <= 1}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-2xl shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
          title="الصفحة السابقة"
        >
          <ChevronRight className="w-7 h-7" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
        </motion.button>
      </div>

      {/* ── Scrubbable Progress Bar + Mobile Nav Buttons ── */}
      <div className={`transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Mobile prev/next row above progress bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-2 gap-3"
          style={{
            background: isDark ? 'rgba(18,18,18,0.85)' : 'rgba(253,248,246,0.9)',
            backdropFilter: 'blur(16px)',
            borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(163,124,108,0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Next page (RTL: left arrow) */}
          <MobileNavBtn
            direction="next"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            isDark={isDark}
          />

          {/* Page info */}
          <div className="flex-1 text-center">
            <div className="text-xs font-bold font-arabic" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }}>
              صفحة {currentPage} / {totalPages}
            </div>
            <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(163,124,108,0.15)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #a37c6c, #e0cec7)', width: `${Math.round((currentPage / totalPages) * 100)}%` }}
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
            isDark={isDark}
          />
        </div>
        <ProgressBar />
      </div>
      
      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <AnnotationsSidebar open={isAnnotationsOpen} onOpenChange={setIsAnnotationsOpen} />
      <TableOfContents open={isTOCOpen} onOpenChange={setIsTOCOpen} />
      <QuoteCardModal
        open={isCardStudioOpen}
        onOpenChange={setIsCardStudioOpen}
        quoteText={pageData.display_text.slice(0, 280)}
        sourceText={pageData.title}
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
