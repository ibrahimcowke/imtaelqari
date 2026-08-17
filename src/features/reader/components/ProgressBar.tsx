import React from 'react';
import { useReaderStore } from '../../../store/readerStore';
import { bookDataService } from '../../../data/service';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const ProgressBar: React.FC = () => {
  const { currentPage, setCurrentPage } = useReaderStore();
  const totalPages = bookDataService.getPages().length;
  const pageData = bookDataService.getPage(currentPage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(Number(e.target.value));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const percentage = Math.round((currentPage / totalPages) * 100);

  return (
    <div
      className="w-full flex flex-col select-none border-t shadow-lg backdrop-blur-xl"
      style={{
        background: 'var(--app-bar)',
        borderTopColor: 'var(--app-bar-border)',
      }}
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      {/* Interactive Range Slider Scrubber */}
      <div className="relative w-full flex items-center h-2">
        <input
          type="range"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handleChange}
          className="w-full h-1.5 appearance-none cursor-pointer absolute top-0 z-10 opacity-85 hover:opacity-100 transition-opacity"
          dir="ltr"
          style={{
            direction: 'rtl',
            accentColor: 'var(--app-brand)',
            background: `linear-gradient(to left, var(--app-brand) ${(currentPage / totalPages) * 100}%, rgba(128,128,128,0.2) 0%)`,
          }}
        />
      </div>

      <div className="flex justify-between items-center px-3 sm:px-6 py-2.5 sm:py-3 gap-2">
        {/* Next page button (RTL: left in Arabic / next) & Percentage badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-25 active:scale-90 border cursor-pointer hover:brightness-105"
            style={{
              background: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              color: 'var(--app-brand)',
            }}
            title="الصفحة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span
            className="font-bold font-sans text-xs px-2.5 py-1 rounded-xl"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
          >
            {percentage}%
          </span>
        </div>

        {/* Current Chapter / Section Title */}
        <div
          className="flex-1 text-center font-arabic font-bold truncate px-2 text-xs sm:text-sm"
          style={{ color: 'var(--app-text)' }}
        >
          {(pageData?.title && pageData.title.length > 3 && !pageData.title.startsWith('صفحة'))
            ? pageData.title
            : `صفحة ${currentPage}`}
        </div>

        {/* Page numbers & Prev button (RTL: right in Arabic / prev) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="font-sans font-bold text-xs"
            style={{ color: 'var(--app-text-muted)' }}
          >
            {currentPage} <span className="opacity-50">/</span> {totalPages}
          </div>

          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-25 active:scale-90 border cursor-pointer hover:brightness-105"
            style={{
              background: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              color: 'var(--app-brand)',
            }}
            title="الصفحة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
