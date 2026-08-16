import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  BookOpen, X, ZoomIn, ZoomOut,
  ChevronRight, ChevronLeft, Image as ImageIcon
} from 'lucide-react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';

export const ManuscriptModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageNumber?: number;
}> = ({ open, onOpenChange, pageNumber }) => {
  const { currentPage } = useReaderStore();
  const [activePage, setActivePage] = useState(pageNumber || currentPage || 1);
  const [zoomLevel, setZoomLevel] = useState(1);

  const totalPages = bookDataService.getPages().length || 174;
  const pageData = bookDataService.getPage(activePage);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed inset-2 sm:inset-6 rounded-3xl z-50 p-0 shadow-2xl focus:outline-none flex flex-col overflow-hidden border"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-3.5 border-b shrink-0"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}
              >
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  مطابقة المخطوطة والصفحة الأصلية
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-arabic"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                  >
                    ص {activePage} من {totalPages}
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70 truncate max-w-xs sm:max-w-md">
                  {pageData?.title || 'مقارنة بصرية بين النص المرقمن والمخطوطة'}
                </p>
              </div>
            </div>

            {/* Top Toolbar Controls */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 p-1 rounded-xl border bg-black/5 dark:bg-white/5"
                style={{ borderColor: 'var(--app-surface-border)' }}
              >
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition-all opacity-80"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs font-mono font-bold opacity-80"
                  title="إعادة ضبط"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition-all opacity-80"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>

              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all opacity-80 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Split-View Body: Digital Text (Right) vs Manuscript Image/Scan (Left) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
            {/* Right: Digital Text */}
            <div
              className="lg:col-span-6 p-5 sm:p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-l flex flex-col justify-between"
              style={{ borderColor: 'var(--app-divider)', background: 'var(--app-bg)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-arabic font-bold text-amber-500 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    النص الرقمي المحقق (ص {activePage})
                  </span>
                  <span className="text-[11px] font-arabic opacity-60">
                    {pageData?.title}
                  </span>
                </div>

                <div className="space-y-3 font-arabic text-sm sm:text-base leading-loose select-text opacity-95">
                  {pageData?.blocks?.map((b) => (
                    <p key={b.id} className="leading-relaxed">
                      {b.text}
                    </p>
                  )) || <p>{pageData?.display_text}</p>}
                </div>
              </div>

              {/* Page Navigator Stepper */}
              <div
                className="mt-4 pt-3 border-t flex items-center justify-between gap-2"
                style={{ borderColor: 'var(--app-divider)' }}
              >
                <button
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  disabled={activePage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-arabic font-bold border disabled:opacity-30 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--app-surface-border)' }}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  السابقة
                </button>

                <span className="text-xs font-arabic font-bold opacity-75">
                  صفحة {activePage} / {totalPages}
                </span>

                <button
                  onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
                  disabled={activePage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-arabic font-bold border disabled:opacity-30 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--app-surface-border)' }}
                >
                  التالية
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Left: Original Scan / Manuscript Visualizer */}
            <div
              className="lg:col-span-6 p-4 flex items-center justify-center overflow-auto custom-scrollbar bg-black/10 dark:bg-black/40 relative"
            >
              <div
                className="transition-transform duration-200 origin-center rounded-2xl shadow-2xl overflow-hidden border"
                style={{
                  transform: `scale(${zoomLevel})`,
                  borderColor: 'var(--app-surface-border)',
                }}
              >
                {pageData?.image ? (
                  <img
                    src={pageData.image}
                    alt={`مخطوطة صفحة ${activePage}`}
                    className="max-h-[70vh] w-auto object-contain select-none"
                    onError={(e) => {
                      // Fallback placeholder with aesthetic calligraphy styling if image path is pending
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}

                {/* Fallback card preview when image is loading or unavailable */}
                <div
                  className="p-8 text-center flex flex-col items-center justify-center gap-3 w-80 sm:w-96 min-h-96"
                  style={{
                    background: 'var(--app-brand-dim)',
                    color: 'var(--app-text)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: 'var(--app-brand-grad)' }}
                  >
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4 className="font-arabic font-bold text-sm">
                    {pageData?.title || `صفحة ${activePage}`}
                  </h4>
                  <p className="font-arabic text-xs opacity-70 leading-relaxed max-w-xs">
                    « {pageData?.display_text?.slice(0, 140)}... »
                  </p>
                  <span className="text-[10px] font-arabic font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-2">
                    كتاب إمتاع القارئ — المجلد الأول
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
