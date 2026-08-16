import React from 'react';
import { useReaderStore } from '../../../store/readerStore';
import { bookDataService } from '../../../data/service';

export const ProgressBar: React.FC = () => {
  const { currentPage, setCurrentPage } = useReaderStore();
  const totalPages = bookDataService.getPages().length;
  const pageData = bookDataService.getPage(currentPage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(Number(e.target.value));
  };

  const percentage = Math.round((currentPage / totalPages) * 100);

  return (
    <div
      className="w-full flex flex-col app-bar border-t select-none"
      style={{
        borderTopColor: 'var(--app-bar-border)',
      }}
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      {/* Scrub Range Slider */}
      <div className="relative w-full flex items-center">
        <input
          type="range"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={handleChange}
          className="w-full h-1.5 appearance-none cursor-pointer absolute top-0 -mt-0.5 z-10 opacity-80 hover:opacity-100 transition-opacity"
          dir="ltr"
          style={{
            direction: 'rtl',
            accentColor: 'var(--app-brand)',
            background: `linear-gradient(to left, var(--app-brand) ${(currentPage / totalPages) * 100}%, rgba(128,128,128,0.2) 0%)`,
          }}
        />
      </div>

      <div className="flex justify-between items-center px-4 md:px-8 py-3 font-sans text-xs">
        {/* Percentage badge */}
        <div className="w-20 text-right">
          <span
            className="font-bold font-sans text-xs px-2.5 py-1 rounded-xl"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
          >
            {percentage}%
          </span>
        </div>

        {/* Title */}
        <div
          className="flex-1 text-center font-arabic font-bold truncate px-4 text-xs md:text-sm"
          style={{ color: 'var(--app-text)' }}
        >
          {(pageData?.title && pageData.title.length > 5 && !pageData.title.startsWith('صفحة'))
            ? pageData.title
            : `صفحة ${currentPage}`}
        </div>

        {/* Page numbers */}
        <div
          className="w-20 text-left font-sans font-semibold text-xs opacity-70"
          style={{ color: 'var(--app-text-muted)' }}
        >
          {currentPage} / {totalPages}
        </div>
      </div>
    </div>
  );
};
