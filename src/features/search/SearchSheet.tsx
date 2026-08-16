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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content 
          className="fixed bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-up focus:outline-none"
          style={{
            background: 'var(--app-bg)',
            color: 'var(--app-text)',
            borderTop: '1px solid var(--app-surface-border)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          }}
          dir="rtl"
        >
          <div className="flex justify-between items-center p-4 md:p-5 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <Dialog.Title className="text-lg font-bold font-arabic flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Search className="w-4 h-4" />
              </div>
              <span>البحث في الكتاب</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 border-b" style={{ borderColor: 'var(--app-divider)', background: 'var(--app-bg-2)' }}>
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن كلمة، عبارة، أو حكمة..."
                className="w-full rounded-2xl py-3 pr-12 pl-4 outline-none font-arabic transition-all app-surface shadow-sm"
                style={{ color: 'var(--app-text)' }}
                autoFocus
              />
              <Search className="absolute right-4 top-3.5 opacity-40 w-5 h-5" style={{ color: 'var(--app-brand)' }} />
            </div>
            {query.length > 2 && (
              <div className="mt-2 text-xs font-arabic opacity-70" style={{ color: 'var(--app-text-muted)' }}>
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
                      className="w-full text-right p-4 rounded-2xl border transition-all flex justify-between items-center group app-surface app-surface-hover"
                      style={{ borderColor: 'var(--app-surface-border)' }}
                    >
                      <div className="flex-1">
                        <div className="text-xs font-bold mb-1 font-arabic" style={{ color: 'var(--app-brand)' }}>
                          {result.page.title}
                        </div>
                        <p className="font-arabic line-clamp-2 text-xs leading-relaxed opacity-85" style={{ color: 'var(--app-text)' }}>
                          {result.page.display_text.substring(0, 150) + '...'}
                        </p>
                      </div>
                      <ChevronLeft className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-colors mr-3" style={{ color: 'var(--app-brand)' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 opacity-60 font-arabic text-sm">
                  لا توجد نتائج مطابقة لبحثك.
                </div>
              )
            ) : (
              <div className="text-center py-12 opacity-50 font-arabic text-xs">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                اكتب 3 أحرف على الأقل للبحث في نص وحكم الكتاب.
              </div>
            )}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
