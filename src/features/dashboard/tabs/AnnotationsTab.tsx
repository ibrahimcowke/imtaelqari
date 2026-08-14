import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { useReaderStore } from '../../../store/readerStore';
import { Bookmark, Highlighter, Trash2, FileX } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const COLOR_MAP: Record<string, { border: string; bg: string; label: string; dot: string }> = {
  amber: {
    border: 'rgba(245,158,11,0.5)',
    bg: 'rgba(245,158,11,0.07)',
    label: 'أصفر',
    dot: '#f59e0b',
  },
  rose: {
    border: 'rgba(244,63,94,0.4)',
    bg: 'rgba(244,63,94,0.06)',
    label: 'أحمر',
    dot: '#f43f5e',
  },
  sage: {
    border: 'rgba(20,184,166,0.4)',
    bg: 'rgba(20,184,166,0.06)',
    label: 'أخضر',
    dot: '#14b8a6',
  },
  slate: {
    border: 'rgba(100,116,139,0.3)',
    bg: 'rgba(100,116,139,0.05)',
    label: 'رمادي',
    dot: '#64748b',
  },
};

export const AnnotationsTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { setCurrentPage } = useReaderStore();

  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('createdAt').reverse().toArray()) || [];
  const highlights = useLiveQuery(() => db.highlights.orderBy('createdAt').reverse().toArray()) || [];

  const handleJump = (page: number) => {
    setCurrentPage(page);
    onNavigate();
  };

  const deleteBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.bookmarks.delete(id);
  };

  const deleteHighlight = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.highlights.delete(id);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count: number; iconBg: string; iconColor: string }> = ({ icon, title, count, iconBg, iconColor }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4', style: { color: iconColor } })}
      </div>
      <div>
        <h2 className="text-lg font-bold font-arabic text-gray-900">{title}</h2>
      </div>
      <span className="mr-auto text-xs font-sans font-bold px-2.5 py-1 rounded-full"
        style={{ background: iconBg, color: iconColor }}>
        {count}
      </span>
    </div>
  );

  const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="rounded-2xl p-10 text-center flex flex-col items-center gap-3"
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(163,124,108,0.2)' }}>
      <FileX className="w-8 h-8 text-gray-300" />
      <p className="text-gray-400 font-arabic text-sm">{message}</p>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">

      {/* ── Bookmarks ── */}
      <section>
        <motion.div variants={itemVariants}>
          <SectionHeader
            icon={<Bookmark />}
            title="العلامات المرجعية"
            count={bookmarks.length}
            iconBg="rgba(163,124,108,0.12)"
            iconColor="#a37c6c"
          />
        </motion.div>

        {bookmarks.length === 0 ? (
          <motion.div variants={itemVariants}><EmptyState message="لا توجد علامات مرجعية محفوظة" /></motion.div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <AnimatePresence>
              {bookmarks.map(bm => (
                <motion.div
                  key={bm.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  onClick={() => handleJump(bm.page)}
                  className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 12px rgba(163,124,108,0.07)',
                    transition: 'all 0.3s ease',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(163,124,108,0.14)' }}
                >
                  {/* Accent bar */}
                  <div className="absolute right-0 top-4 bottom-4 w-1 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #e0cec7 0%, #a37c6c 50%, #e0cec7 100%)' }} />

                  <div className="flex justify-between items-start mb-3 pr-3">
                    <button
                      onClick={(e) => deleteBookmark(bm.id, e)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold font-sans px-2.5 py-1 rounded-lg"
                      style={{ background: 'rgba(163,124,108,0.1)', color: '#8c6b5d' }}>
                      ص {bm.page}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 font-arabic pr-3">{bm.preview}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Highlights ── */}
      <section>
        <motion.div variants={itemVariants}>
          <SectionHeader
            icon={<Highlighter />}
            title="التظليلات"
            count={highlights.length}
            iconBg="rgba(245,158,11,0.1)"
            iconColor="#b07d1a"
          />
        </motion.div>

        {highlights.length === 0 ? (
          <motion.div variants={itemVariants}><EmptyState message="لا توجد نصوص مظللة" /></motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {highlights.map(hl => {
                const colorInfo = COLOR_MAP[hl.color] || COLOR_MAP.slate;
                return (
                  <motion.div
                    key={hl.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    onClick={() => handleJump(hl.page)}
                    className="rounded-2xl cursor-pointer group relative overflow-hidden"
                    style={{
                      background: `${colorInfo.bg}, rgba(255,255,255,0.85)`,
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${colorInfo.border}`,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                    }}
                    whileHover={{ y: -2, boxShadow: `0 8px 32px ${colorInfo.bg}` }}
                  >
                    <div className="flex items-stretch gap-0">
                      {/* Left colour stripe */}
                      <div className="w-1 flex-shrink-0 rounded-r-full my-3 mr-4"
                        style={{ background: colorInfo.dot }} />

                      <div className="flex-1 py-4 pl-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <button
                            onClick={(e) => deleteHighlight(hl.id, e)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                            style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-2 mr-auto flex-shrink-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colorInfo.dot }} />
                            <span className="text-[11px] font-sans font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: `${colorInfo.bg}`, color: colorInfo.dot }}>
                              {colorInfo.label}
                            </span>
                            <span className="text-[11px] font-sans text-gray-400 px-2 py-1 rounded-lg"
                              style={{ background: 'rgba(0,0,0,0.04)' }}>
                              ص {hl.page}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-800 font-arabic leading-relaxed text-base">{hl.selectedText}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </motion.div>
  );
};
