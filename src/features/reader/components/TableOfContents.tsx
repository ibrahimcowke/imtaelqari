import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { List, X } from 'lucide-react';
import { useReaderStore } from '../../../store/readerStore';
import { bookDataService } from '../../../data/service';

interface TOCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableOfContents: React.FC<TOCProps> = ({ open, onOpenChange }) => {
  const { setCurrentPage, currentPage } = useReaderStore();
  
  // Extract all headings from the book
  const headings = useMemo(() => {
    const pages = bookDataService.getPages();
    const result: { title: string, page: number }[] = [];
    
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden animate-fade-in" />
        <Dialog.Content 
          className="fixed top-0 bottom-0 right-0 w-full md:w-80 bg-white shadow-2xl z-50 flex flex-col animate-fade-in focus:outline-none"
          dir="rtl"
        >
          <div className="flex justify-between items-center p-4 border-b bg-brand-50 text-brand-900">
            <Dialog.Title className="text-lg font-bold font-arabic flex items-center gap-2">
              <List className="w-5 h-5" /> الفهرس
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-brand-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {headings.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentPage(h.page);
                  onOpenChange(false);
                }}
                className={`w-full text-right p-3 rounded-lg text-sm font-arabic leading-relaxed transition-colors border-b border-gray-50 last:border-0 ${
                  currentPage >= h.page && (i === headings.length - 1 || currentPage < headings[i+1].page)
                    ? 'bg-brand-100 text-brand-900 font-bold border-r-4 border-r-brand-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="flex-1 pr-4">{h.title}</span>
                  <span className="text-xs text-gray-400 font-sans">{h.page}</span>
                </div>
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
