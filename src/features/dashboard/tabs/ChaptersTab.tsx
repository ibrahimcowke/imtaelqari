import React, { useMemo } from 'react';
import { bookDataService } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import { ChevronLeft, BookMarked } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

export const ChaptersTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { setCurrentPage, currentPage } = useReaderStore();

  const chapters = useMemo(() => {
    const pages = bookDataService.getPages();
    const result: { title: string; page: number; isCurrent: boolean }[] = [];

    pages.forEach(p => {
      const headingBlock = p.blocks.find(b => b.type === 'heading');
      if (headingBlock) {
        result.push({ title: headingBlock.text, page: p.page, isCurrent: false });
      } else if (p.title && p.title.length > 5 && !p.title.startsWith('صفحة')) {
        result.push({ title: p.title, page: p.page, isCurrent: false });
      }
    });

    for (let i = 0; i < result.length; i++) {
      if (currentPage >= result[i].page && (i === result.length - 1 || currentPage < result[i + 1].page)) {
        result[i].isCurrent = true;
      }
    }
    return result;
  }, [currentPage]);

  const handleJump = (page: number) => {
    setCurrentPage(page);
    onNavigate();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)', boxShadow: '0 4px 12px rgba(163,124,108,0.3)' }}>
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-arabic text-gray-900">فصول الكتاب</h2>
          <p className="text-xs text-gray-500">{chapters.length} فصل • انتقل سريعاً لأي فصل</p>
        </div>
      </motion.div>

      {/* Chapter List */}
      {chapters.length === 0 ? (
        <motion.div variants={itemVariants}
          className="rounded-2xl p-10 text-center text-gray-400 font-arabic"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)' }}>
          لا توجد فصول مستخرجة لهذا الكتاب
        </motion.div>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch, idx) => (
            <motion.button
              key={idx}
              variants={itemVariants}
              onClick={() => handleJump(ch.page)}
              className="w-full text-right group relative overflow-hidden"
              style={{
                background: ch.isCurrent
                  ? 'linear-gradient(135deg, rgba(163,124,108,0.18) 0%, rgba(163,124,108,0.06) 100%)'
                  : 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                border: ch.isCurrent
                  ? '1px solid rgba(163,124,108,0.35)'
                  : '1px solid rgba(255,255,255,0.9)',
                borderRadius: '1rem',
                boxShadow: ch.isCurrent
                  ? '0 4px 20px rgba(163,124,108,0.15)'
                  : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(163,124,108,0.15)' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active left border glow */}
              {ch.isCurrent && (
                <div className="absolute right-0 top-3 bottom-3 w-1 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #e0cec7 0%, #a37c6c 50%, #e0cec7 100%)' }} />
              )}

              <div className="flex items-center gap-4 px-5 py-4">
                {/* Chapter number */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-sans"
                  style={ch.isCurrent
                    ? { background: 'linear-gradient(135deg, #a37c6c, #75594e)', color: 'white', boxShadow: '0 4px 12px rgba(163,124,108,0.4)' }
                    : { background: 'rgba(163,124,108,0.08)', color: '#a37c6c' }
                  }>
                  {idx + 1}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-arabic text-base leading-snug truncate ${ch.isCurrent ? 'text-brand-900 font-bold' : 'text-gray-800 font-medium'}`}>
                    {ch.title}
                  </h3>
                  {ch.isCurrent && (
                    <span className="text-[10px] text-brand-500 font-sans font-semibold uppercase tracking-wider">
                      ◉ الفصل الحالي
                    </span>
                  )}
                </div>

                {/* Page badge + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-sans text-gray-500 px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(163,124,108,0.08)', color: '#8c6b5d' }}>
                    ص {ch.page}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-200 -ml-2 group-hover:ml-0" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
