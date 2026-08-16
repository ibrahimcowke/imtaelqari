import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../lib/db';
import { useReaderStore } from '../../../store/readerStore';
import {
  Bookmark, Highlighter, Trash2, FileX, Search,
  Copy, Check, Download
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const COLOR_MAP: Record<string, { border: string; bg: string; label: string; dot: string }> = {
  amber: {
    border: 'rgba(245,158,11,0.4)',
    bg: 'rgba(245,158,11,0.12)',
    label: 'أصفر',
    dot: '#f59e0b',
  },
  rose: {
    border: 'rgba(244,63,94,0.4)',
    bg: 'rgba(244,63,94,0.12)',
    label: 'أحمر',
    dot: '#f43f5e',
  },
  sage: {
    border: 'rgba(20,184,166,0.4)',
    bg: 'rgba(20,184,166,0.12)',
    label: 'أخضر',
    dot: '#14b8a6',
  },
  slate: {
    border: 'rgba(100,116,139,0.3)',
    bg: 'rgba(100,116,139,0.1)',
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
    let content = `# فوائد وملاحظات من كتاب إمتاع القارئ بجمال الكلم وروائع الحكم\n\n`;
    content += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}\n\n`;
    
    content += `## العلامات المرجعية (${bookmarks.length})\n`;
    bookmarks.forEach(bm => {
      content += `- ص ${bm.page}: ${bm.preview}\n`;
    });

    content += `\n## التظليلات الملونة (${highlights.length})\n`;
    highlights.forEach(hl => {
      content += `- ص ${hl.page} [${hl.color}]: «${hl.selectedText}»\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `إمتاع_القارئ_فوائد_${Date.now()}.md`;
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
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const totalCount = bookmarks.length + highlights.length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">

      {/* ── 1. Top Section Header ── */}
      <motion.div
        variants={itemVariants}
        className="app-surface rounded-3xl p-5 md:p-6"
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
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-arabic" style={{ color: 'var(--app-text)' }}>
                الملاحظات والفوائد المحفوظة
              </h2>
              <p className="text-xs font-arabic opacity-70 mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                {totalCount} فائدة محفوظة ({bookmarks.length} علامة مرجعية • {highlights.length} تظليل ملون)
              </p>
            </div>
          </div>

          {totalCount > 0 && (
            <button
              onClick={exportAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-arabic text-xs font-bold transition-all active:scale-95 text-white shadow-md self-start sm:self-center"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 4px 12px var(--app-brand-glow)',
              }}
              title="تصدير الفوائد كملف Markdown"
            >
              <Download className="w-4 h-4" />
              <span>تصدير الكل (Markdown)</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ── 2. Search & Filter Controls ── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الفوائد والتظليلات والعلامات..."
            className="w-full pl-4 pr-11 py-3.5 rounded-2xl font-arabic text-sm outline-none transition-all app-surface"
            style={{
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
              className="px-3.5 py-2 rounded-2xl font-arabic text-xs font-semibold whitespace-nowrap transition-all active:scale-95"
              style={activeFilter === f.id
                ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 4px 12px var(--app-brand-glow)' }
                : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── 3. Bookmarks Section ── */}
      {filteredBookmarks.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-arabic font-bold text-sm flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
            <Bookmark className="w-4 h-4 text-brand-600" />
            <span>العلامات المرجعية ({filteredBookmarks.length})</span>
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
                  className="rounded-2xl p-4 cursor-pointer group relative overflow-hidden transition-all app-surface app-surface-hover"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <span
                      className="text-xs font-bold font-sans px-2.5 py-0.5 rounded-xl"
                      style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }}
                    >
                      ص {bm.page}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyText(bm.preview, bm.id, e)}
                        className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:opacity-100 transition-all"
                        style={{ color: copiedId === bm.id ? '#0d8f60' : 'var(--app-brand)' }}
                        title="نسخ"
                      >
                        {copiedId === bm.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => deleteBookmark(bm.id, e)}
                        className="p-1.5 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-arabic text-sm leading-relaxed line-clamp-3 font-medium" style={{ color: 'var(--app-text)' }}>
                    {bm.preview}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── 4. Highlights Section ── */}
      {filteredHighlights.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-arabic font-bold text-sm flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
            <Highlighter className="w-4 h-4 text-amber-500" />
            <span>التظليلات الملونة ({filteredHighlights.length})</span>
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
                    className="rounded-2xl cursor-pointer group relative overflow-hidden transition-all app-surface app-surface-hover"
                    style={{
                      borderRight: `4px solid ${colorInfo.dot}`,
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-xl"
                          style={{ background: colorInfo.bg, color: colorInfo.dot, border: `1px solid ${colorInfo.border}` }}
                        >
                          {colorInfo.label} • ص {hl.page}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => copyText(hl.selectedText, hl.id, e)}
                            className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:opacity-100 transition-all"
                            style={{ color: copiedId === hl.id ? '#0d8f60' : 'var(--app-brand)' }}
                            title="نسخ النص"
                          >
                            {copiedId === hl.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => deleteHighlight(hl.id, e)}
                            className="p-1.5 rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredBookmarks.length === 0 && filteredHighlights.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="app-surface rounded-3xl p-12 text-center flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/5 opacity-60">
            <FileX className="w-7 h-7" />
          </div>
          <h4 className="font-arabic font-bold text-base" style={{ color: 'var(--app-text)' }}>
            {totalCount === 0 ? 'لا توجد علامات أو نصوص مظللة حتى الآن' : 'لا توجد نتائج مطابقة للبحث'}
          </h4>
          <p className="font-arabic text-xs opacity-70 max-w-sm" style={{ color: 'var(--app-text-muted)' }}>
            {totalCount === 0
              ? 'أثناء قراءتك للكتاب، يمكنك تحديد أي نص وتظليله أو حفظ الصفحة في العلامات المرجعية لتعود إليها في أي وقت.'
              : 'جرب البحث بكلمات أخرى أو تصفية فئات الألوان المختلفة.'
            }
          </p>
        </motion.div>
      )}

    </motion.div>
  );
};
