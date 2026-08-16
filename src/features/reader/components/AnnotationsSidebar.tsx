import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { Bookmark as BookmarkIcon, X, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useReaderStore } from '../../../store/readerStore';

export const AnnotationsSidebar: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('createdAt').reverse().toArray()) || [];
  const { setCurrentPage } = useReaderStore();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content 
          className="fixed top-0 bottom-0 right-0 w-full sm:w-80 shadow-2xl z-50 flex flex-col focus:outline-none"
          style={{
            background: 'var(--app-bg)',
            color: 'var(--app-text)',
            borderLeft: '1px solid var(--app-surface-border)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
          }}
          dir="rtl"
        >
          <div
            className="flex justify-between items-center p-4 border-b"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <Dialog.Title className="text-base font-bold font-arabic flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <BookmarkIcon className="w-4 h-4 fill-current" />
              </div>
              <span>العلامات المرجعية</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {bookmarks.length > 0 ? (
              bookmarks.map(bm => (
                <div
                  key={bm.id}
                  className="p-4 rounded-2xl border group app-surface app-surface-hover"
                  style={{ borderColor: 'var(--app-surface-border)' }}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <button 
                      onClick={() => { setCurrentPage(bm.page); onOpenChange(false); }}
                      className="font-bold text-xs hover:underline font-arabic"
                      style={{ color: 'var(--app-brand)' }}
                    >
                      صفحة {bm.page}
                    </button>
                    <button 
                      onClick={() => db.bookmarks.delete(bm.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-arabic line-clamp-3 leading-relaxed opacity-85" style={{ color: 'var(--app-text)' }}>
                    {bm.preview}
                  </p>
                  <div className="text-[10px] opacity-50 mt-2 font-mono" style={{ color: 'var(--app-text-muted)' }}>
                    {new Date(bm.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-50 font-arabic text-xs">
                <BookmarkIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                لم تقم بإضافة أي علامات مرجعية بعد.
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
