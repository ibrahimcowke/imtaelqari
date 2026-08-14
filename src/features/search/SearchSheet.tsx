import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, ChevronLeft } from 'lucide-react';
import { bookDataService } from '../../data/service';
import { useReaderStore } from '../../store/readerStore';
import { useNavigate } from 'react-router-dom';

export const SearchSheet: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const { setCurrentPage } = useReaderStore();
  const navigate = useNavigate();

  const results = query.length > 2 ? bookDataService.search(query) : [];

  const handleResultClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    onOpenChange(false);
    navigate('/read');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content 
          className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-up focus:outline-none"
          dir="rtl"
        >
          <div className="flex justify-between items-center p-4 border-b">
            <Dialog.Title className="text-xl font-bold font-arabic">البحث في الكتاب</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن كلمة، عبارة، أو حكمة..."
                className="w-full bg-white border border-gray-300 rounded-xl py-3 pr-12 pl-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-arabic transition-all shadow-sm"
                autoFocus
              />
              <Search className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
            </div>
            {query.length > 2 && (
              <div className="mt-2 text-sm text-gray-500 font-arabic">
                تم العثور على {results.length} نتيجة
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {query.length > 2 ? (
              results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((result, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleResultClick(result.page.page)}
                      className="w-full text-right p-4 rounded-xl border hover:border-brand-300 hover:bg-brand-50/50 transition-all flex justify-between items-center group"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-brand-600 font-bold mb-1 font-sans">{result.page.title}</div>
                        <p className="text-gray-800 font-arabic line-clamp-2 text-sm leading-relaxed">
                          {/* Highlighting the match ideally here, but simple display for now */}
                          {result.page.display_text.substring(0, 150) + '...'}
                        </p>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors mr-4" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 font-arabic">
                  لا توجد نتائج مطابقة لبحثك.
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500 font-arabic">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                اكتب 3 أحرف على الأقل للبحث.
              </div>
            )}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
