import React, { useEffect, useState, useCallback } from 'react';
import { useReaderStore } from '../../store/readerStore';
import { bookDataService } from '../../data/service';
import {
  ArrowRight, Settings, Bookmark,
  List, ChevronLeft, ChevronRight,
  Volume2, VolumeX, PanelRightOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SettingsSheet } from './components/SettingsSheet';
import { ReaderModeToggle } from './components/ReaderModeToggle';
import { AnnotationsSidebar } from './components/AnnotationsSidebar';
import { TableOfContents } from './components/TableOfContents';
import { ProgressBar } from './components/ProgressBar';
import { HighlightPopover } from './components/HighlightPopover';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Flip-hand tap zone ── */
const TapZone: React.FC<{
  side: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}> = ({ side, onClick, disabled }) => {
  const [pressed, setPressed] = useState(false);

  if (disabled) return null;

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onClick(); }}
      onPointerLeave={() => setPressed(false)}
      className="absolute top-16 bottom-16 z-10 w-[22%] flex items-center justify-center select-none"
      style={{
        [side]: 0,
        background: pressed
          ? 'rgba(163,124,108,0.07)'
          : 'transparent',
        transition: 'background 0.15s ease',
      }}
      aria-label={side === 'left' ? 'الصفحة التالية' : 'الصفحة السابقة'}
    >
      <motion.div
        animate={pressed ? { scale: 0.85 } : { scale: [1, 1.08, 1] }}
        transition={pressed
          ? { duration: 0.1 }
          : { duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }
        }
        className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100"
        style={{ opacity: pressed ? 0.7 : 0 }}
      >
        <span className="text-3xl" style={{ transform: side === 'left' ? 'scaleX(-1)' : 'none' }}>👆</span>
      </motion.div>

      {/* Visible hint shown only on first-render pulse */}
      <motion.div
        initial={{ opacity: 0.5, scale: 0.9 }}
        animate={{ opacity: [0.5, 0.15, 0.5], scale: [0.9, 1, 0.9] }}
        transition={{ duration: 3, repeat: 2, repeatDelay: 1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0 }}
      />
    </button>
  );
};

/* ── Mobile nav arrow button ── */
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
    className="flex items-center justify-center rounded-2xl transition-all disabled:opacity-20"
    style={{
      width: 44,
      height: 44,
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(163,124,108,0.1)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(163,124,108,0.2)',
    }}
  >
    {direction === 'next'
      ? <ChevronLeft  className="w-5 h-5" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
      : <ChevronRight className="w-5 h-5" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
    }
  </motion.button>
);

/* ── Header icon button ── */
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
    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 flex-shrink-0"
    style={{
      background: active
        ? isDark ? 'rgba(163,124,108,0.4)' : 'rgba(163,124,108,0.15)'
        : 'transparent',
      color: active
        ? isDark ? '#e0cec7' : '#a37c6c'
        : isDark ? 'rgba(224,206,199,0.55)' : 'rgba(117,89,78,0.65)',
      border: active
        ? isDark ? '1px solid rgba(163,124,108,0.5)' : '1px solid rgba(163,124,108,0.3)'
        : '1px solid transparent',
    }}
  >
    {icon}
  </button>
);

export const ReaderScreen: React.FC = () => {
  const { currentPage, preferences, setCurrentPage, toggleControls, isControlsVisible, isReadingAloud, toggleReadingAloud } = useReaderStore();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [slideDir, setSlideDir] = useState(0); // 1 for next, -1 for prev
  const totalPages = bookDataService.getPages().length;
  const isDark = preferences.theme === 'dark';

  const pageData = bookDataService.getPage(currentPage);

  const isBookmarked = useLiveQuery(
    () => db.bookmarks.where({ page: currentPage }).count(),
    [currentPage]
  ) ?? 0 > 0;

  const pageHighlights = useLiveQuery(
    () => db.highlights.where({ page: currentPage }).toArray(),
    [currentPage]
  ) ?? [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { setSlideDir(1); handlePrevPage(); }
      if (e.key === 'ArrowLeft') { setSlideDir(-1); handleNextPage(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  useEffect(() => {
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      const textToRead = pageData?.display_text || '';
      if (!textToRead) return;
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'ar-SA';
      utterance.rate = preferences.ttsRate;
      
      utterance.onend = () => {
        if (isReadingAloud) {
          if (currentPage < bookDataService.getPages().length) {
            setSlideDir(-1);
            setCurrentPage(currentPage + 1);
          } else {
            toggleReadingAloud();
          }
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
    
    return () => window.speechSynthesis.cancel();
  }, [isReadingAloud, currentPage, preferences.ttsRate, pageData]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setSlideDir(-1);
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setSlideDir(1);
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

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

  const handleReaderClick = (e: React.MouseEvent) => {
    // Don't trigger if user is selecting text
    if (window.getSelection()?.toString().length) return;
    
    const { clientX } = e;
    const { innerWidth } = window;
    
    // Arabic RTL: Left side (0-25%) goes to next page, Right side (75-100%) goes to prev page
    if (clientX < innerWidth * 0.25) {
      setSlideDir(-1);
      handleNextPage();
    } else if (clientX > innerWidth * 0.75) {
      setSlideDir(1);
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

    // A simplified render: If there are highlights for this block, we wrap the matching text.
    // Exact offset mapping requires complex HTML node reconstruction.
    // For now, we replace exact text matches.
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
    return <div className="h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  const containerMaxWidth = 
    preferences.readerWidth === 'narrow' ? 'max-w-xl' :
    preferences.readerWidth === 'medium' ? 'max-w-3xl' : 'max-w-5xl';

  return (
    <div className={`h-screen flex flex-col reader-container relative overflow-hidden`}
         style={{ 
           fontFamily: preferences.fontFamily, 
           fontSize: `${preferences.fontSize}px`, 
           lineHeight: preferences.lineHeight,
           letterSpacing: preferences.letterSpacing === 'tight' ? '-0.5px' : preferences.letterSpacing === 'loose' ? '1px' : 'normal',
           textAlign: preferences.textAlign,
         }}>
      
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
          <div className="flex items-center gap-2 flex-shrink-0">
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

          {/* CENTER — mode toggle + page title */}
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0 overflow-hidden">
            <ReaderModeToggle isDark={isDark} />
            <div
              className="text-[10px] font-arabic font-medium truncate max-w-[160px] sm:max-w-xs opacity-60"
              style={{ color: isDark ? '#e0cec7' : '#75594e' }}
            >
              {pageData.title}
            </div>
          </div>

          {/* RIGHT — action icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Table of Contents */}
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsTOCOpen(true); }}
              icon={<List className="w-4 h-4" />}
              label="المحتويات"
              isDark={isDark}
            />
            {/* TTS */}
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
            {/* Bookmark */}
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
            {/* Annotations sidebar */}
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsAnnotationsOpen(true); }}
              icon={<PanelRightOpen className="w-4 h-4" />}
              label="الملاحظات"
              isDark={isDark}
            />
            {/* Settings */}
            <HeaderBtn
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
              icon={<Settings className="w-4 h-4" />}
              label="الإعدادات"
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* ── Left tap zone (next page in RTL) ── */}
      <TapZone
        side="left"
        onClick={() => handleNextPage()}
        disabled={currentPage >= totalPages}
      />

      {/* ── Right tap zone (prev page in RTL) ── */}
      <TapZone
        side="right"
        onClick={() => handlePrevPage()}
        disabled={currentPage <= 1}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 overflow-y-auto w-full pt-16 pb-20 px-4 md:px-8 custom-scrollbar"
        onClick={handleReaderClick}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={currentPage}
            initial={{ opacity: 0, x: slideDir * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir * -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`${containerMaxWidth} mx-auto my-4 md:my-8`}
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

            {preferences.mode === 'scan' && (
              <div className="flex justify-center bg-gray-100 p-4 rounded-xl">
                <img 
                  src={`/${pageData.image}`} 
                  alt={pageData.title} 
                  className="max-w-full h-auto shadow-md rounded border border-gray-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748b">الصورة الأصلية غير متوفرة</text></svg>';
                  }}
                />
              </div>
            )}

            {preferences.mode === 'compare' && (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 bg-gray-100 p-4 rounded-xl flex items-center justify-center min-h-[50vh]">
                   <img 
                    src={`/${pageData.image}`} 
                    alt={pageData.title} 
                    className="max-w-full h-auto shadow-md rounded border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2364748b">الصورة الأصلية غير متوفرة</text></svg>';
                    }}
                  />
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-brand-100 h-fit" onClick={(e) => e.stopPropagation()}>
                  <div className="text-sm font-bold text-brand-600 mb-4 pb-2 border-b flex justify-between items-center font-sans">
                    <span>تعديل النص المستخرج</span>
                    <button className="bg-brand-50 text-brand-600 px-3 py-1 rounded text-xs hover:bg-brand-100">حفظ التصحيح</button>
                  </div>
                  <textarea 
                    className="w-full h-[60vh] p-4 font-arabic leading-relaxed resize-none outline-none focus:ring-2 focus:ring-brand-500 rounded bg-gray-50 border border-gray-200"
                    defaultValue={pageData.raw_ocr_text}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Desktop nav arrows ── */}
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-4 z-10">
        <motion.button
          onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
          disabled={currentPage >= totalPages}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-2xl shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
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
        >
          <ChevronRight className="w-7 h-7" style={{ color: isDark ? '#e0cec7' : '#a37c6c' }} />
        </motion.button>
      </div>

      {/* ── Scrubbable Progress Bar + Mobile Nav Buttons ── */}
      <div className={`transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Mobile prev/next row above progress bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 gap-3"
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
    </div>
  );
};
