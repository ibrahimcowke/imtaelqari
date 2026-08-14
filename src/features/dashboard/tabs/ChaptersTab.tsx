import React, { useMemo, useState } from 'react';
import { bookDataService, normalizeArabic } from '../../../data/service';
import { useReaderStore } from '../../../store/readerStore';
import {
  ChevronLeft, BookMarked, Search, CheckCircle2,
  BookOpen, Eye,
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

    pages.forEach(p => {
      const headingBlock = p.blocks.find(b => b.type === 'heading');
      const paragraphBlock = p.blocks.find(b => b.type === 'paragraph' || b.type === 'quote');
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">

      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)', boxShadow: '0 4px 12px rgba(163,124,108,0.3)' }}>
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-arabic" style={{ color: 'var(--app-text)' }}>فصول الكتاب</h2>
            <p className="text-xs font-arabic" style={{ color: 'var(--app-text-muted)' }}>
              {chapters.length} فصل • تم إنجاز {readCount} من {chapters.length}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold font-sans px-3 py-1 rounded-full"
          style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}>
          {Math.round((readCount / (chapters.length || 1)) * 100)}% مقروء
        </span>
      </motion.div>

      {/* ── Search & Filter Bar ── */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين الفصول أو رقم الصفحة..."
            className="w-full pl-4 pr-10 py-3 rounded-2xl font-arabic text-sm outline-none transition-all"
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-surface-border)',
              color: 'var(--app-text)',
              boxShadow: '0 2px 8px var(--app-surface-shadow)',
            }}
          />
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded-full"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {[
            { id: 'all' as FilterType, label: `الكل (${chapters.length})` },
            { id: 'read' as FilterType, label: `المقروءة (${readCount})` },
            { id: 'unread' as FilterType, label: `المتبقية (${chapters.length - readCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="flex-1 py-1.5 rounded-xl font-arabic text-xs font-semibold transition-all active:scale-95"
              style={activeFilter === f.id
                ? { background: 'linear-gradient(135deg, #a37c6c, #75594e)', color: 'white', boxShadow: '0 2px 8px rgba(163,124,108,0.3)' }
                : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Chapter List ── */}
      {filteredChapters.length === 0 ? (
        <motion.div variants={itemVariants}
          className="rounded-2xl p-10 text-center font-arabic text-sm"
          style={{ background: 'var(--app-surface)', border: '1px solid var(--app-surface-border)', color: 'var(--app-text-muted)' }}>
          لا توجد فصول مطابقة لبحثك
        </motion.div>
      ) : (
        <div className="space-y-2">
          {filteredChapters.map((ch, idx) => {
            const isExpanded = expandedChapter === idx;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="w-full text-right group relative overflow-hidden rounded-2xl transition-all"
                style={{
                  background: ch.isCurrent
                    ? 'linear-gradient(135deg, rgba(163,124,108,0.18) 0%, rgba(163,124,108,0.06) 100%)'
                    : 'var(--app-surface)',
                  backdropFilter: 'blur(16px)',
                  border: ch.isCurrent
                    ? '1px solid rgba(163,124,108,0.35)'
                    : '1px solid var(--app-surface-border)',
                  boxShadow: ch.isCurrent
                    ? '0 4px 20px rgba(163,124,108,0.15)'
                    : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Active left border glow */}
                {ch.isCurrent && (
                  <div className="absolute right-0 top-3 bottom-3 w-1 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #e0cec7 0%, var(--app-brand) 50%, #e0cec7 100%)' }} />
                )}

                <div
                  onClick={() => handleJump(ch.page)}
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                >
                  {/* Chapter number / Status icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-sans"
                    style={ch.isCurrent
                      ? { background: 'linear-gradient(135deg, #a37c6c, #75594e)', color: 'white', boxShadow: '0 4px 12px rgba(163,124,108,0.4)' }
                      : ch.isRead
                        ? { background: 'rgba(16,185,129,0.12)', color: '#0d8f60' }
                        : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
                    }>
                    {ch.isRead ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  {/* Title & Badge */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-arabic text-sm leading-snug truncate ${ch.isCurrent ? 'font-bold' : 'font-medium'}`}
                      style={{ color: 'var(--app-text)' }}>
                      {ch.title}
                    </h3>
                    {ch.isCurrent && (
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-brand-600">
                        ◉ الفصل الحالي
                      </span>
                    )}
                  </div>

                  {/* Actions & Preview Trigger */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => toggleExpand(idx, e)}
                      className="p-1.5 rounded-lg transition-all hover:bg-black/5 active:scale-90"
                      style={{ color: 'var(--app-brand)' }}
                      title="معاينة محتوى الفصل"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-sans px-2 py-0.5 rounded-lg"
                      style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}>
                      ص {ch.page}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </div>
                </div>

                {/* Expandable Preview Snippet */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-4 pt-1 border-t text-xs font-arabic leading-relaxed"
                      style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text-muted)' }}
                    >
                      <p className="mb-2 italic">«{ch.preview}...»</p>
                      <button
                        onClick={() => handleJump(ch.page)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-arabic text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)', color: 'white' }}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        قراءة هذا الفصل
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
