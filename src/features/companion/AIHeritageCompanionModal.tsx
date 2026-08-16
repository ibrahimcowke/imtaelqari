import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import {
  Sparkles, BookOpen, X, Copy, Check, Feather,
  Compass, Lightbulb
} from 'lucide-react';
import { bookDataService, normalizeArabic } from '../../data/service';
import { useReaderStore } from '../../store/readerStore';

// Built-in curated heritage vocabulary & literary insights dictionary for classical Arabic texts
const HERITAGE_KNOWLEDGE_BASE: Record<string, { root: string; meaning: string; context: string; benefit: string; rhetorical: string }> = {
  'القارئ': {
    root: 'ق-ر-أ',
    meaning: 'التالي لكتاب الله والعالم بوجوه قراءته، والناظر المتدبر في بطون الكتب والأسفار.',
    context: 'وردت في مطلع الكتاب للإشادة بحامل العلم ومحب المطالعة والتدبر.',
    benefit: 'القراءة مفتاح البصيرة ووعاء الحكمة وغذاء العقول النيرة.',
    rhetorical: 'اسم فاعل دال على الثبوت والملازمة لطلب العلم.',
  },
  'إمتاع': {
    root: 'م-ت-ع',
    meaning: 'الإيناس، وإدخال السرور، والبهجة والتلذذ بما في الشيء من نفائس وحسن.',
    context: 'عنوان الكتاب الدال على غايته في الجمع بين لذة الأدب ونفع المعرفة.',
    benefit: 'حُسن التأليف يجمع بين الإفادة العلمية والترويح الروحي الأدبي.',
    rhetorical: 'مصدر لفعل (أمتع) يفيد التعدية والمبالغة في الإحسان إلى القارئ.',
  },
  'حكمة': {
    root: 'ح-ك-م',
    meaning: 'وضع الشيء في موضعه اللائق به، والإصابة في القول والعمل وحسن التقدير.',
    context: 'الحكم والدرر المبثوثة في ثنايا الكتاب لتوجيه السلوك وتهذيب النفوس.',
    benefit: 'الحكمة ضالة المؤمن أنى وجدها فهو أحق الناس بها.',
    rhetorical: 'لفظ جامع لمعاني الرشاد وحسن السداد.',
  },
  'بلاغة': {
    root: 'ب-ل-غ',
    meaning: 'مطابقة الكلام الفصيح لمقتضى الحال مع فصاحة ألفاظه وعذوبة معانيه.',
    context: 'الأساليب البلاغية والبيانية الرفيعة التي صاغ بها المؤلف فصول كتابه.',
    benefit: 'البلاغة حلية اللسان وترجمان العقل ووسيلة التأثير والإقناع.',
    rhetorical: 'إيجاز في غير إخلال وإطناب في غير إملال.',
  },
};

export const AIHeritageCompanionModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageNumber?: number;
  initialQuery?: string;
}> = ({ open, onOpenChange, pageNumber, initialQuery = '' }) => {
  const storeCurrentPage = useReaderStore((state) => state.currentPage);
  const activePage = pageNumber || storeCurrentPage || 1;
  const pageData = useMemo(() => bookDataService.getPage(activePage), [activePage]);

  const [activeTab, setActiveTab] = useState<'insights' | 'vocab' | 'rhetoric'>('insights');
  const [copied, setCopied] = useState(false);
  const customText = initialQuery;

  // Derive benefits and key extracted sentences from current page
  const pageSentences = useMemo(() => {
    if (!pageData?.display_text) return [];
    return pageData.display_text
      .split(/[.،؛\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.length < 160)
      .slice(0, 6);
  }, [pageData]);

  // Extract matched or suggested heritage terms for the current page
  const detectedTerms = useMemo(() => {
    const text = (customText || pageData?.display_text || '');
    const found: string[] = [];
    Object.keys(HERITAGE_KNOWLEDGE_BASE).forEach((term) => {
      if (text.includes(term) || normalizeArabic(text).includes(normalizeArabic(term))) {
        found.push(term);
      }
    });
    if (found.length === 0) return ['القارئ', 'إمتاع', 'حكمة'];
    return found;
  }, [customText, pageData]);

  const handleCopyBenefit = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl z-50 p-0 shadow-2xl focus:outline-none max-h-[90vh] flex flex-col overflow-hidden border"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  الشارح والمساعد التراثي الذكي
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-arabic"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                  >
                    ص {activePage}
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70 truncate max-w-xs sm:max-w-md">
                  {pageData?.title || 'إيضاح المعاني اللغوية والفوائد الأدبية'}
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all opacity-80 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          <div
            className="flex px-6 pt-3 border-b gap-2 shrink-0"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <button
              onClick={() => setActiveTab('insights')}
              className="pb-2.5 text-xs font-arabic font-bold flex items-center gap-1.5 border-b-2 transition-all"
              style={{
                borderColor: activeTab === 'insights' ? 'var(--app-brand)' : 'transparent',
                color: activeTab === 'insights' ? 'var(--app-brand)' : 'var(--app-text)',
                opacity: activeTab === 'insights' ? 1 : 0.6,
              }}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              الفوائد المستنبطة
            </button>

            <button
              onClick={() => setActiveTab('vocab')}
              className="pb-2.5 text-xs font-arabic font-bold flex items-center gap-1.5 border-b-2 transition-all"
              style={{
                borderColor: activeTab === 'vocab' ? 'var(--app-brand)' : 'transparent',
                color: activeTab === 'vocab' ? 'var(--app-brand)' : 'var(--app-text)',
                opacity: activeTab === 'vocab' ? 1 : 0.6,
              }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              المفردات وغريب اللغة
            </button>

            <button
              onClick={() => setActiveTab('rhetoric')}
              className="pb-2.5 text-xs font-arabic font-bold flex items-center gap-1.5 border-b-2 transition-all"
              style={{
                borderColor: activeTab === 'rhetoric' ? 'var(--app-brand)' : 'transparent',
                color: activeTab === 'rhetoric' ? 'var(--app-brand)' : 'var(--app-text)',
                opacity: activeTab === 'rhetoric' ? 1 : 0.6,
              }}
            >
              <Feather className="w-3.5 h-3.5" />
              الإضاءات البلاغية
            </button>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {/* Tab 1: Extracted Benefits & Wisdom */}
            {activeTab === 'insights' && (
              <div className="space-y-3 animate-fade-in">
                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-arabic"
                  style={{
                    background: 'var(--app-brand-dim)',
                    borderColor: 'var(--app-brand-border)',
                  }}
                >
                  <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    الفوائد التربوية والدرر المستخلصة من سياق الصفحة الحالية ({pageData?.title}):
                  </span>
                </div>

                {pageSentences.map((sentence, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border flex flex-col gap-2 transition-all hover:border-amber-400/50"
                    style={{
                      background: 'var(--app-bg-2)',
                      borderColor: 'var(--app-surface-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-arabic">
                        درّة إيمانية #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleCopyBenefit(sentence)}
                        className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition-all text-xs flex items-center gap-1 font-arabic"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-arabic leading-relaxed opacity-95">
                      « {sentence} »
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Tab 2: Vocabulary & Classical Meanings */}
            {activeTab === 'vocab' && (
              <div className="space-y-3 animate-fade-in">
                {detectedTerms.map((termKey) => {
                  const item = HERITAGE_KNOWLEDGE_BASE[termKey] || HERITAGE_KNOWLEDGE_BASE['حكمة'];
                  return (
                    <motion.div
                      key={termKey}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border flex flex-col gap-2"
                      style={{
                        background: 'var(--app-bg-2)',
                        borderColor: 'var(--app-surface-border)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-arabic font-bold text-sm text-amber-600 dark:text-amber-400">
                            {termKey}
                          </h4>
                          <span className="text-[10px] font-arabic opacity-60 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                            الجذر: {item.root}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-arabic leading-relaxed opacity-90">
                        <strong className="text-amber-500">المعنى والدلالة: </strong>
                        {item.meaning}
                      </p>

                      <div className="text-[11px] font-arabic p-2.5 rounded-xl bg-black/5 dark:bg-white/5 opacity-80">
                        <strong>السياق الأدبي: </strong> {item.context}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Rhetorical Illuminations */}
            {activeTab === 'rhetoric' && (
              <div className="space-y-3 animate-fade-in">
                <div
                  className="p-4 rounded-2xl border flex flex-col gap-2"
                  style={{
                    background: 'var(--app-brand-dim)',
                    borderColor: 'var(--app-brand-border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-amber-500" />
                    <h4 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-brand)' }}>
                      الجماليات البيانية في أسلوب «إمتاع القارئ»
                    </h4>
                  </div>
                  <p className="text-xs font-arabic leading-relaxed opacity-90">
                    يمتاز الكتاب بحسن الصياغة وجزالة اللفظ وتدبيج المعاني بالسجع اللطيف غير المتكلف، مع اعتماد الإيجاز البليغ الذي يوصل المراد بأقرب طريق.
                  </p>
                </div>

                <div
                  className="p-4 rounded-2xl border space-y-2 text-xs font-arabic"
                  style={{
                    background: 'var(--app-bg-2)',
                    borderColor: 'var(--app-surface-border)',
                  }}
                >
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">
                    مظاهر الفصاحة في النص:
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside opacity-85 leading-relaxed">
                    <li>التوازن الإيقاعي بين فقرات الحكم والمواعظ.</li>
                    <li>استخدام الطباق والمقابلة لترسيخ المعاني في ذهن القارئ.</li>
                    <li>اختيار المفردات التراثية الأصيلة التي ترتقي بذائقة القارئ اللغوية.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
