import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../../lib/db';
import { useReaderStore } from '../../../store/readerStore';
import { Copy, Check } from 'lucide-react';
import type { HighlightColor } from '../../../types/book';

interface SelectionState {
  text: string;
  rect: DOMRect;
  blockId: string;
  startOffset: number;
  endOffset: number;
}

export const HighlightPopover: React.FC = () => {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [copied, setCopied] = useState(false);
  const { currentPage } = useReaderStore();
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

  if (!selection) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 rounded-2xl p-2 flex items-center gap-3 shadow-2xl animate-fade-in select-none"
      style={{
        top: Math.max(12, selection.rect.top - 54) + 'px',
        left: Math.max(12, Math.min(window.innerWidth - 220, selection.rect.left + (selection.rect.width / 2) - 100)) + 'px',
        background: 'rgba(20, 20, 20, 0.92)',
        color: '#ffffff',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 border-l border-white/20 pl-2.5">
        {[
          { color: 'amber' as HighlightColor, bg: 'bg-amber-400', title: 'تظليل أصفر' },
          { color: 'rose' as HighlightColor, bg: 'bg-rose-400', title: 'تظليل أحمر' },
          { color: 'sage' as HighlightColor, bg: 'bg-teal-400', title: 'تظليل أخضر' },
          { color: 'blue-gray' as HighlightColor, bg: 'bg-slate-400', title: 'تظليل رمادي' },
        ].map(c => (
          <button
            key={c.color}
            onClick={() => handleHighlight(c.color)}
            className={`w-6 h-6 rounded-full ${c.bg} transition-all hover:scale-125 active:scale-95 shadow-sm`}
            title={c.title}
          />
        ))}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-arabic hover:bg-white/10 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 opacity-80" />}
        <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
      </button>
    </div>
  );
};
