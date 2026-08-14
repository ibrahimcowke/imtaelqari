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
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden animate-fade-in" />
        <Dialog.Content 
          className="fixed top-0 bottom-0 right-0 w-full md:w-80 bg-white shadow-2xl z-50 flex flex-col animate-fade-in focus:outline-none"
          dir="rtl"
        >
          <div className="flex justify-between items-center p-4 border-b bg-brand-50 text-brand-900">
            <Dialog.Title className="text-lg font-bold font-arabic flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 fill-current" /> العلامات المرجعية
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-brand-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {bookmarks.length > 0 ? (
              bookmarks.map(bm => (
                <div key={bm.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                  <div className="flex justify-between items-start mb-2">
                    <button 
                      onClick={() => { setCurrentPage(bm.page); onOpenChange(false); }}
                      className="text-brand-600 font-bold hover:underline font-sans"
                    >
                      صفحة {bm.page}
                    </button>
                    <button 
                      onClick={() => db.bookmarks.delete(bm.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 font-arabic line-clamp-3 leading-relaxed">
                    {bm.preview}
                  </p>
                  <div className="text-xs text-gray-400 mt-2 font-sans">
                    {new Date(bm.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 font-arabic">
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
