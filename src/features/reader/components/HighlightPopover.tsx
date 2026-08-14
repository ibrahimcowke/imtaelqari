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
        // Delay hiding slightly to prevent flickering when clicking options
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

      // Find the closest block container
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
        // Approximate offsets for now. Native exact offset mapping requires complex DOM traversal.
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
      className="fixed z-50 bg-gray-900 text-white shadow-xl rounded-lg p-2 flex items-center gap-3 animate-fade-in"
      style={{
        top: Math.max(10, selection.rect.top - 60) + 'px',
        left: Math.max(10, selection.rect.left + (selection.rect.width / 2) - 100) + 'px',
      }}
      onMouseDown={(e) => e.stopPropagation()} // prevent dismissing selection
    >
      <div className="flex gap-2 border-l border-gray-700 pl-3">
        {(['amber', 'rose', 'sage', 'blue-gray'] as HighlightColor[]).map(color => (
          <button
            key={color}
            onClick={() => handleHighlight(color)}
            className={`w-6 h-6 rounded-full hover:scale-110 transition-transform ${
              color === 'amber' ? 'bg-amber-300' :
              color === 'rose' ? 'bg-rose-300' :
              color === 'sage' ? 'bg-teal-300' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
      <button 
        onClick={handleCopy}
        className="flex items-center gap-1 text-sm hover:text-gray-300 pr-1"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
      </button>
    </div>
  );
};
