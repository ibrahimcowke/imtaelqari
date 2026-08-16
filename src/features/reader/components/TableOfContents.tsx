import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { List, X, Search } from 'lucide-react';
import { useReaderStore } from '../../../store/readerStore';
import { bookDataService, normalizeArabic } from '../../../data/service';

interface TOCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableOfContents: React.FC<TOCProps> = ({ open, onOpenChange }) => {
  const { setCurrentPage, currentPage } = useReaderStore();
  const [search, setSearch] = useState('');

  const headings = useMemo(() => {
    const pages = bookDataService.getPages();
    const result: { title: string; page: number }[] = [];

    pages.forEach(p => {
      const headingBlock = p.blocks.find(b => b.type === 'heading');
      if (headingBlock) {
        result.push({ title: headingBlock.text, page: p.page });
      } else if (p.title && p.title.length > 5 && !p.title.startsWith('صفحة')) {
        result.push({ title: p.title, page: p.page });
      }
    });
    return result;
  }, []);

  const filteredHeadings = useMemo(() => {
    if (!search.trim()) return headings;
    const norm = normalizeArabic(search.trim().toLowerCase());
    return headings.filter(h =>
      normalizeArabic(h.title.toLowerCase()).includes(norm) ||
      h.page.toString().includes(norm)
    );
  }, [headings, search]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-0 bottom-0 right-0 w-full sm:w-96 shadow-2xl z-50 flex flex-col focus:outline-none"
          style={{
            background: 'var(--app-bg)',
            color: 'var(--app-text)',
            borderLeft: '1px solid var(--app-surface-border)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex justify-between items-center p-4 md:p-5 border-b"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <Dialog.Title className="text-base font-bold font-arabic flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <List className="w-4 h-4" />
              </div>
              <span>فهرس موضوعات الكتاب</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في الفهرس..."
                className="w-full pl-4 pr-10 py-2 rounded-xl text-xs font-arabic outline-none app-surface"
              />
              <Search className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            </div>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {filteredHeadings.map((h, i) => {
              const isCurrent = currentPage >= h.page && (i === headings.length - 1 || currentPage < (headings[i+1]?.page ?? 9999));
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(h.page);
                    onOpenChange(false);
                  }}
                  className="w-full text-right p-3 rounded-2xl text-xs font-arabic transition-all flex items-center justify-between group"
                  style={isCurrent
                    ? { background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)', fontWeight: 'bold' }
                    : { border: '1px solid transparent' }
                  }
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isCurrent ? 'var(--app-brand)' : 'var(--app-brand-border)' }} />
                    <span className="truncate leading-relaxed">{h.title}</span>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg opacity-70 shrink-0">
                    ص {h.page}
                  </span>
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
