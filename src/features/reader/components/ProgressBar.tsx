import React from 'react';
import { useReaderStore } from '../../../store/readerStore';
import { bookDataService } from '../../../data/service';

export const ProgressBar: React.FC = () => {
  const { currentPage, setCurrentPage, preferences } = useReaderStore();
  const totalPages = bookDataService.getPages().length;
  const pageData = bookDataService.getPage(currentPage);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(Number(e.target.value));
  };

  const percentage = Math.round((currentPage / totalPages) * 100);

  return (
    <div 
      className={`absolute bottom-0 left-0 w-full z-20 flex flex-col transition-transform duration-300 ${preferences.theme === 'dark' ? 'glass-panel-dark text-white border-t border-gray-800' : 'glass-panel text-brand-900 border-t border-gray-200'}`}
      onClick={(e) => e.stopPropagation()} 
      dir="rtl"
    >
      <input
        type="range"
        min="1"
        max={totalPages}
        value={currentPage}
        onChange={handleChange}
        className="w-full h-1 bg-gray-200 appearance-none cursor-pointer accent-brand-600 absolute top-0 -mt-[2px]"
        dir="ltr"
        style={{ direction: 'rtl' }}
      />
      <div className="flex justify-between items-center px-4 py-3 font-sans text-xs">
        <div className="w-16 text-right font-bold text-brand-600">{percentage}%</div>
        <div className="flex-1 text-center font-bold truncate px-4 opacity-80">
          {(pageData?.title && pageData.title.length > 5 && !pageData.title.startsWith('صفحة')) 
            ? pageData.title 
            : `صفحة ${currentPage}`}
        </div>
        <div className="w-16 text-left opacity-60">ص {currentPage} / {totalPages}</div>
      </div>
    </div>
  );
};
