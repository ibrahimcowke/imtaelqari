import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../../lib/db';
import { useReaderStore } from '../../../store/readerStore';
import { Copy, Check, Sparkles, Volume2, Film, Music2 } from 'lucide-react';
import type { HighlightColor } from '../../../types/book';
import { arabicTtsService } from '../../../services/arabicTtsService';
import { useLanguage } from '../../../i18n/LanguageContext';

interface SelectionState {
  text: string;
  rect: DOMRect;
  blockId: string;
  startOffset: number;
  endOffset: number;
}

export interface HighlightPopoverProps {
  onOpenQuoteCard?: (selectedText: string) => void;
  onOpenReels?: (selectedText: string) => void;
  onOpenPoetry?: (selectedText: string) => void;
}

export const HighlightPopover: React.FC<HighlightPopoverProps> = ({
  onOpenQuoteCard,
  onOpenReels,
  onOpenPoetry,
}) => {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [copied, setCopied] = useState(false);
  const { currentPage } = useReaderStore();
  const { t, isRTL, dir } = useLanguage();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const activeSelection = window.getSelection();
      if (!activeSelection || activeSelection.isCollapsed) {
        setTimeout(() => setSelection(null), 100);
        return;
      }

      const range = activeSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = activeSelection.toString().trim();

      if (!text) {
        setSelection(null);
        return;
      }

      let container = range.commonAncestorContainer as HTMLElement;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement!;
      }

      const blockElement = container.closest('[data-block-id]');
      if (!blockElement) return;

      const blockId = blockElement.getAttribute('data-block-id')!;

      setSelection({
        text,
        rect,
        blockId,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      });
      setCopied(false);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [currentPage]);

  const handleHighlight = async (color: HighlightColor) => {
    if (!selection) return;

    try {
      await db.highlights.add({
        id: crypto.randomUUID(),
        page: currentPage,
        blockId: selection.blockId,
        selectedText: selection.text,
        startOffset: selection.startOffset,
        endOffset: selection.endOffset,
        color,
        createdAt: new Date().toISOString()
      });
      window.getSelection()?.removeAllRanges();
      setSelection(null);
    } catch (err) {
      console.error('Failed to save highlight', err);
    }
  };

  const handleCopy = () => {
    if (!selection) return;
    navigator.clipboard.writeText(selection.text);
    setCopied(true);
    setTimeout(() => {
      window.getSelection()?.removeAllRanges();
      setSelection(null);
    }, 1000);
  };

  const handleSpeakSelected = () => {
    if (!selection) return;
    const textToSpeak = selection.text;
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    arabicTtsService.readText(textToSpeak);
  };

  if (!selection) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 rounded-2xl p-2 flex items-center gap-2 shadow-2xl animate-fade-in select-none max-w-[96vw] overflow-x-auto custom-scrollbar"
      style={{
        top: Math.max(12, selection.rect.top - 54) + 'px',
        left: Math.max(12, Math.min(window.innerWidth - 320, selection.rect.left + (selection.rect.width / 2) - 150)) + 'px',
        background: 'rgba(20, 20, 20, 0.94)',
        color: '#ffffff',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}
      dir={dir}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Highlight Color Pickers */}
      <div className={`flex items-center gap-1.5 ${isRTL ? 'border-l pl-2' : 'border-r pr-2'} border-white/20`}>
        {[
          { color: 'amber' as HighlightColor, bg: 'bg-amber-400', title: t('popover_highlight_amber') },
          { color: 'rose' as HighlightColor, bg: 'bg-rose-400', title: t('popover_highlight_rose') },
          { color: 'sage' as HighlightColor, bg: 'bg-teal-400', title: t('popover_highlight_sage') },
          { color: 'blue-gray' as HighlightColor, bg: 'bg-slate-400', title: t('popover_highlight_blue') },
        ].map(c => (
          <button
            key={c.color}
            onClick={() => handleHighlight(c.color)}
            className={`w-5 h-5 rounded-full ${c.bg} transition-all hover:scale-125 active:scale-95 shadow-sm cursor-pointer`}
            title={c.title}
          />
        ))}
      </div>

      {/* Copy Action */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-arabic hover:bg-white/10 transition-colors cursor-pointer"
        title={t('popover_copy')}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-80" />}
        <span>{copied ? t('popover_copied') : t('popover_copy')}</span>
      </button>

      {/* Listen / TTS Action */}
      <button
        onClick={handleSpeakSelected}
        className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-arabic hover:bg-white/10 transition-colors cursor-pointer text-emerald-300 font-medium"
        title={t('popover_listen')}
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span>{t('popover_listen')}</span>
      </button>

      {/* Quote Card */}
      {onOpenQuoteCard && (
        <button
          onClick={() => {
            if (!selection) return;
            const textToQuote = selection.text;
            window.getSelection()?.removeAllRanges();
            setSelection(null);
            onOpenQuoteCard(textToQuote);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-arabic hover:bg-white/15 transition-all text-amber-300 font-bold border border-amber-400/30 bg-amber-400/10 active:scale-95 cursor-pointer shrink-0"
          title={t('tool_quote_studio')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('popover_quote_card')}</span>
        </button>
      )}

      {/* Story Reel */}
      {onOpenReels && (
        <button
          onClick={() => {
            if (!selection) return;
            const textToReel = selection.text;
            window.getSelection()?.removeAllRanges();
            setSelection(null);
            onOpenReels(textToReel);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-arabic hover:bg-white/15 transition-all text-rose-300 font-bold border border-rose-400/30 bg-rose-400/10 active:scale-95 cursor-pointer shrink-0"
          title={t('tool_reels')}
        >
          <Film className="w-3.5 h-3.5" />
          <span>{t('popover_reels')}</span>
        </button>
      )}

      {/* Poetic Meter */}
      {onOpenPoetry && (
        <button
          onClick={() => {
            if (!selection) return;
            window.getSelection()?.removeAllRanges();
            setSelection(null);
            onOpenPoetry(selection.text);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-arabic hover:bg-white/10 transition-colors cursor-pointer text-indigo-300 shrink-0"
          title={t('tool_poetry')}
        >
          <Music2 className="w-3.5 h-3.5" />
          <span>{t('popover_poetry')}</span>
        </button>
      )}
    </div>
  );
};
