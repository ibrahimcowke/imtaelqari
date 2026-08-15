import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { useReaderStore } from '../../../store/readerStore';
import {
  Bookmark, Highlighter, Trash2, FileX, Search,
  Copy, Check, Download,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const COLOR_MAP: Record<string, { border: string; bg: string; label: string; dot: string }> = {
  amber: {
    border: 'rgba(245,158,11,0.4)',
    bg: 'rgba(245,158,11,0.08)',
    label: 'أصفر',
    dot: '#f59e0b',
  },
  rose: {
    border: 'rgba(244,63,94,0.4)',
    bg: 'rgba(244,63,94,0.08)',
    label: 'أحمر',
    dot: '#f43f5e',
  },
  sage: {
    border: 'rgba(20,184,166,0.4)',
    bg: 'rgba(20,184,166,0.08)',
    label: 'أخضر',
    dot: '#14b8a6',
  },
  slate: {
    border: 'rgba(100,116,139,0.3)',
    bg: 'rgba(100,116,139,0.06)',
    label: 'رمادي',
    dot: '#64748b',
  },
};

type AnnotationFilter = 'all' | 'bookmarks' | 'amber' | 'rose' | 'sage';

export const AnnotationsTab: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const { setCurrentPage } = useReaderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AnnotationFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('createdAt').reverse().toArray(), []) ?? [];
  const highlights = useLiveQuery(() => db.highlights.orderBy('createdAt').reverse().toArray(), []) ?? [];

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

  const copyText = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAll = () => {
    let content = `# ملاحظات وفوائد من كتاب إمتاع القارئ بجمال الكلم وروائع الحكم\n\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
    
    content += `## العلامات المرجعية (${bookmarks.length})\n`;
    bookmarks.forEach(bm => {
      content += `- ص ${bm.page}: ${bm.preview}\n`;
    });

    content += `\n## التظليلات (${highlights.length})\n`;
    highlights.forEach(hl => {
      content += `- ص ${hl.page} [${hl.color}]: «${hl.selectedText}»\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `إمتاع_القارئ_ملاحظات_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter & Search Logic
  const filteredBookmarks = (() => {
    if (activeFilter !== 'all' && activeFilter !== 'bookmarks') return [];
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.trim().toLowerCase();
    return bookmarks.filter(b => b.preview.toLowerCase().includes(q) || b.page.toString().includes(q));
  })();

  const filteredHighlights = (() => {
    if (activeFilter === 'bookmarks') return [];
    let list = highlights;
    if (activeFilter === 'amber' || activeFilter === 'rose' || activeFilter === 'sage') {
      list = list.filter(h => h.color === activeFilter);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter(h => h.selectedText.toLowerCase().includes(q) || h.page.toString().includes(q));
  })();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const totalCount = bookmarks.length + highlights.length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* ── Header with Export ── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #a37c6c, #75594e)', boxShadow: '0 4px 12px rgba(163,124,108,0.3)' }}>
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-arabic" style={{ color: 'var(--app-text)' }}>ملاحظاتي وتظليلاتي</h2>
            <p className="text-xs font-arabic" style={{ color: 'var(--app-text-muted)' }}>
              {totalCount} عنصر محفوظ ({bookmarks.length} علامة • {highlights.length} تظليل)
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={exportAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-arabic text-xs font-bold transition-all active:scale-95 shadow-sm"
            style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
            title="تصدير الملاحظات كملف Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير الكل
          </button>
        )}
      </motion.div>

      {/* ── Search & Filter Controls ── */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الملاحظات والتظليلات..."
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 px-1.5 py-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'all' as AnnotationFilter, label: `الكل (${totalCount})` },
            { id: 'bookmarks' as AnnotationFilter, label: `العلامات (${bookmarks.length})` },
            { id: 'amber' as AnnotationFilter, label: 'أصفر 🟡' },
            { id: 'rose' as AnnotationFilter, label: 'أحمر 🔴' },
            { id: 'sage' as AnnotationFilter, label: 'أخضر 🟢' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="px-3 py-1.5 rounded-xl font-arabic text-xs font-semibold whitespace-nowrap transition-all active:scale-95"
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

      {/* ── Bookmarks Section ── */}
      {filteredBookmarks.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-arabic font-bold text-sm flex items-center gap-2" style={{ color: 'var(--app-text-muted)' }}>
            <Bookmark className="w-4 h-4 text-brand-600" />
            العلامات المرجعية ({filteredBookmarks.length})
          </h3>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <AnimatePresence>
              {filteredBookmarks.map((bm) => (
                <motion.div
                  key={bm.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleJump(bm.page)}
                  className="rounded-2xl p-4 cursor-pointer group relative overflow-hidden transition-all"
                  style={{
                    background: 'var(--app-surface)',
                    border: '1px solid var(--app-surface-border)',
                    boxShadow: '0 2px 12px var(--app-surface-shadow)',
                  }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-xs font-bold font-sans px-2.5 py-0.5 rounded-lg"
                      style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}>
                      ص {bm.page}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyText(bm.preview, bm.id, e)}
                        className="p-1 rounded-lg hover:bg-black/5"
                        style={{ color: copiedId === bm.id ? '#0d8f60' : 'var(--app-brand)' }}
                        title="نسخ"
                      >
                        {copiedId === bm.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => deleteBookmark(bm.id, e)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-arabic text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--app-text)' }}>
                    {bm.preview}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── Highlights Section ── */}
      {filteredHighlights.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-arabic font-bold text-sm flex items-center gap-2" style={{ color: 'var(--app-text-muted)' }}>
            <Highlighter className="w-4 h-4 text-amber-600" />
            التظليلات ({filteredHighlights.length})
          </h3>

          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredHighlights.map((hl) => {
                const colorInfo = COLOR_MAP[hl.color] || COLOR_MAP.slate;
                return (
                  <motion.div
                    key={hl.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleJump(hl.page)}
                    className="rounded-2xl cursor-pointer group relative overflow-hidden transition-all"
                    style={{
                      background: 'var(--app-surface)',
                      border: `1px solid ${colorInfo.border}`,
                      boxShadow: '0 2px 12px var(--app-surface-shadow)',
                    }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-stretch">
                      <div className="w-1.5 shrink-0 my-3 mr-3 rounded-full" style={{ background: colorInfo.dot }} />
                      <div className="flex-1 py-3.5 pl-3">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: colorInfo.bg, color: colorInfo.dot }}>
                            {colorInfo.label} • ص {hl.page}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => copyText(hl.selectedText, hl.id, e)}
                              className="p-1 rounded-lg hover:bg-black/5"
                              style={{ color: copiedId === hl.id ? '#0d8f60' : 'var(--app-brand)' }}
                              title="نسخ النص"
                            >
                              {copiedId === hl.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={(e) => deleteHighlight(hl.id, e)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="font-arabic leading-relaxed text-sm font-medium" style={{ color: 'var(--app-text)' }}>
                          «{hl.selectedText}»
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredBookmarks.length === 0 && filteredHighlights.length === 0 && (
        <motion.div variants={itemVariants}
          className="rounded-3xl p-10 text-center flex flex-col items-center gap-3"
          style={{ background: 'var(--app-surface)', border: '1px dashed var(--app-surface-border)' }}>
          <FileX className="w-8 h-8 text-gray-300" />
          <p className="font-arabic text-sm" style={{ color: 'var(--app-text-muted)' }}>
            {totalCount === 0 ? 'لا توجد علامات مرجعية أو نصوص مظللة حتى الآن' : 'لا توجد عناصر مطابقة لبحثك'}
          </p>
        </motion.div>
      )}

    </motion.div>
  );
};
