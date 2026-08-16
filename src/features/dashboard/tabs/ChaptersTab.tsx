import React, { useMemo, useState } from 'react';
import { bookDataService, normalizeArabic } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import {
  ChevronLeft, BookMarked, Search, CheckCircle2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

type FilterType = 'all' | 'read' | 'unread';

export const ChaptersTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { setCurrentPage, currentPage } = useReaderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const chapters = useMemo(() => {
    const pages = bookDataService.getPages();
    const result: { title: string; page: number; isCurrent: boolean; isRead: boolean; preview: string }[] = [];

    pages.forEach((p) => {
      const headingBlock = p.blocks.find((b) => b.type === 'heading');
      const paragraphBlock = p.blocks.find((b) => b.type === 'paragraph' || b.type === 'quote');
      const preview = paragraphBlock?.text || p.display_text.substring(0, 120) || '';

      if (headingBlock) {
        result.push({
          title: headingBlock.text,
          page: p.page,
          isCurrent: false,
          isRead: p.page <= currentPage,
          preview,
        });
      } else if (p.title && p.title.length > 5 && !p.title.startsWith('صفحة')) {
        result.push({
          title: p.title,
          page: p.page,
          isCurrent: false,
          isRead: p.page <= currentPage,
          preview,
        });
      }
    });

    for (let i = 0; i < result.length; i++) {
      if (currentPage >= result[i].page && (i === result.length - 1 || currentPage < result[i + 1].page)) {
        result[i].isCurrent = true;
      }
    }
    return result;
  }, [currentPage]);

  // Filter & Search
  const filteredChapters = useMemo(() => {
    let list = chapters;

    if (activeFilter === 'read') {
      list = list.filter((ch) => ch.isRead);
    } else if (activeFilter === 'unread') {
      list = list.filter((ch) => !ch.isRead);
    }

    if (searchQuery.trim()) {
      const norm = normalizeArabic(searchQuery.trim().toLowerCase());
      list = list.filter((ch) =>
        normalizeArabic(ch.title.toLowerCase()).includes(norm) ||
        ch.page.toString().includes(norm) ||
        normalizeArabic(ch.preview.toLowerCase()).includes(norm)
      );
    }

    return list;
  }, [chapters, activeFilter, searchQuery]);

  const handleJump = (page: number) => {
    setCurrentPage(page);
    onNavigate();
  };

  const toggleExpand = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChapter((prev) => (prev === idx ? null : idx));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const readCount = chapters.filter((c) => c.isRead).length;
  const readPercent = Math.round((readCount / (chapters.length || 1)) * 100);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5" dir="rtl">

      {/* ── 1. Top Section Header ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 md:p-6 border shadow-sm transition-all"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-surface-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 4px 16px var(--app-brand-glow)',
              }}
            >
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-arabic" style={{ color: 'var(--app-text)' }}>
                فهرس فصول وأبواب الكتاب
              </h2>
              <p className="text-xs font-arabic mt-0.5 font-medium" style={{ color: 'var(--app-text-muted)' }}>
                {chapters.length} فصلاً ومبحثاً • تم قراءة {readCount} من {chapters.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-left">
              <div className="text-sm font-bold font-sans" style={{ color: 'var(--app-brand)' }}>
                {readPercent}%
              </div>
              <div className="text-[10px] font-arabic font-semibold" style={{ color: 'var(--app-text-muted)' }}>نسبة الإنجاز</div>
            </div>
            <div className="w-20 h-2.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 border" style={{ borderColor: 'var(--app-divider)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${readPercent}%`, background: 'var(--app-brand-grad)' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Search & Filter Toolbar ── */}
      <motion.div variants={itemVariants} className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين الفصول، النصوص، أو أرقام الصفحات..."
            className="w-full pl-4 pr-11 py-3.5 rounded-2xl font-arabic text-sm outline-none transition-all border shadow-sm"
            style={{
              background: 'var(--app-surface)',
              borderColor: 'var(--app-surface-border)',
              color: 'var(--app-text)',
            }}
          />
          <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {[
            { id: 'all' as FilterType, label: `جميع الفصول (${chapters.length})` },
            { id: 'read' as FilterType, label: `المقروءة (${readCount})` },
            { id: 'unread' as FilterType, label: `المتبقية (${chapters.length - readCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="flex-1 py-2 rounded-2xl font-arabic text-xs font-semibold transition-all active:scale-95 text-center border"
              style={
                activeFilter === f.id
                  ? { background: 'var(--app-brand-grad)', color: 'white', borderColor: 'transparent', boxShadow: '0 4px 12px var(--app-brand-glow)' }
                  : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', borderColor: 'var(--app-brand-border)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 3. Chapter List ── */}
      {filteredChapters.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-12 text-center font-arabic border shadow-sm"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
          }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--app-text)' }}>لا توجد فصول مطابقة لبحثك</p>
          <p className="text-xs opacity-60" style={{ color: 'var(--app-text-muted)' }}>جرب البحث بكلمات أخرى أو اختر فلتراً مختلفاً</p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {filteredChapters.map((ch, idx) => {
            const isExpanded = expandedChapter === idx;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="w-full text-right group relative overflow-hidden rounded-2xl transition-all border shadow-sm"
                style={{
                  background: ch.isCurrent
                    ? 'var(--app-brand-dim)'
                    : 'var(--app-surface)',
                  borderColor: ch.isCurrent
                    ? 'var(--app-brand)'
                    : 'var(--app-surface-border)',
                }}
              >
                {/* Active Indicator Bar */}
                {ch.isCurrent && (
                  <div
                    className="absolute right-0 top-3 bottom-3 w-1.5 rounded-full"
                    style={{ background: 'var(--app-brand-grad)' }}
                  />
                )}

                <div
                  onClick={() => handleJump(ch.page)}
                  className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer"
                >
                  {/* Chapter number or Read Checkmark */}
                  <div
                    className="shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold font-sans shadow-sm"
                    style={
                      ch.isCurrent
                        ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 4px 12px var(--app-brand-glow)' }
                        : ch.isRead
                        ? { background: 'rgba(16,185,129,0.12)', color: '#0d8f60', border: '1px solid rgba(16,185,129,0.25)' }
                        : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
                    }
                  >
                    {ch.isRead ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  {/* Title & Badge */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-arabic text-sm leading-snug truncate ${ch.isCurrent ? 'font-bold' : 'font-medium'}`}
                      style={{ color: 'var(--app-text)' }}
                    >
                      {ch.title}
                    </h3>
                    {ch.isCurrent && (
                      <span className="text-[10px] font-arabic font-semibold flex items-center gap-1 mt-0.5" style={{ color: 'var(--app-brand)' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--app-brand)' }} />
                        موقعك الحالي في القراءة
                      </span>
                    )}
                  </div>

                  {/* Page Pill & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-xl text-xs font-arabic font-semibold border"
                      style={{
                        background: 'var(--app-bg-2)',
                        borderColor: 'var(--app-divider)',
                        color: 'var(--app-text-muted)',
                      }}
                    >
                      ص {ch.page}
                    </span>

                    {ch.preview && (
                      <button
                        onClick={(e) => toggleExpand(idx, e)}
                        className="p-1.5 rounded-xl transition-all opacity-60 hover:opacity-100 hover:bg-black/5"
                        title={isExpanded ? 'إخفاء المعاينة' : 'معاينة النص'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <ChevronLeft className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Expanded Excerpt Preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 pt-1 border-t text-xs font-arabic leading-relaxed opacity-80"
                      style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text)' }}
                    >
                      <p className="bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                        «{ch.preview}»
                      </p>
                      <button
                        onClick={() => handleJump(ch.page)}
                        className="mt-2 text-xs font-bold font-arabic flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--app-brand)' }}
                      >
                        <span>فتح هذه الصفحة في القارئ</span>
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
