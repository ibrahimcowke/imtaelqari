import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Users, Search, X, BookOpen, Quote
} from 'lucide-react';

export interface BiographyItem {
  id: string;
  name: string;
  title: string;
  era: 'pre-islamic' | 'early-islamic' | 'umayyad' | 'abbasid' | 'andalusian';
  eraName: string;
  years: string;
  bio: string;
  famousQuote: string;
  pages: number[];
  tags: string[];
}

const BIOGRAPHIES_DATA: BiographyItem[] = [
  {
    id: 'jahiz',
    name: 'أبو عثمان الجاحظ',
    title: 'شيخ كتاب العربية وإمام البيان',
    era: 'abbasid',
    eraName: 'العصر العباسي',
    years: '159 هـ - 255 هـ',
    bio: 'عمرو بن بحر الكناني، أديب موسوعي، صاحب التصانيف الباهرة في الأدب والبيان والحيوان، اشتهر بأسلوبه الفكه الرصين واستقصاء المعاني.',
    famousQuote: '«والكتاب هو الجليس الذي لا يطريك، والصديق الذي لا يغريك، والرفيق الذي لا يملك.»',
    pages: [14, 38, 89, 142, 210],
    tags: ['أدب', 'بيان', 'نوادر'],
  },
  {
    id: 'mutanabbi',
    name: 'أبو الطيب المتنبي',
    title: 'شاعر العربية الأكبر ومالك زمام القريض',
    era: 'abbasid',
    eraName: 'العصر العباسي',
    years: '303 هـ - 354 هـ',
    bio: 'أحمد بن الحسين الجعفي، نادرة الزمان وأعظم شعراء العرب، شغلت أشعاره الدنيا والناس بحكمتها وعزة النفس وجزالة ألفاظها.',
    famousQuote: '«أَعَزُّ مَكانٍ في الدُّنَى سَرْجُ سابِحٍ .. وَخَيْرُ جَليسٍ في الزّمانِ كِتابُ»',
    pages: [22, 45, 96, 160, 240],
    tags: ['شعر', 'حكمة', 'فروسية'],
  },
  {
    id: 'shafii',
    name: 'الإمام الشافعي',
    title: 'إمام الفقه واللغة والشعر الحكمي',
    era: 'abbasid',
    eraName: 'العصر العباسي',
    years: '150 هـ - 204 هـ',
    bio: 'محمد بن إدريس الشافعي، أحد الأئمة الأربعة، جمع بين فقه الشريعة والفصاحة التامة والشعر السائر في الأخلاق والزهد وطلب العلم.',
    famousQuote: '«ما جادلتُ أحداً إلا تمنيتُ أن يُظهِرَ الله الحق على لسانه.»',
    pages: [18, 52, 115, 178],
    tags: ['فقه', 'زهد', 'حكمة'],
  },
  {
    id: 'asmai',
    name: 'عبد الملك الأصمعي',
    title: 'حجة اللغة ورواية أخبار العرب ونوادرهم',
    era: 'abbasid',
    eraName: 'العصر العباسي',
    years: '121 هـ - 216 هـ',
    bio: 'إمام أهل اللغة وراوية العرب وأشعارهم، عُرف بصدق الرواية وسعة الحفظ ومجالسة الخلفاء كهارون الرشيد ونقل نوادر الأعراب الفصحاء.',
    famousQuote: '«أول العلم الصمت، والثاني الاستماع، والثالث الحفظ، والرابع العمل، والخامس نشره.»',
    pages: [31, 67, 128, 195],
    tags: ['لغة', 'نوادر', 'أعراب'],
  },
  {
    id: 'aktham',
    name: 'أكثم بن صيفي التميمي',
    title: 'حكيم العرب وخطيبهم الأكبر',
    era: 'pre-islamic',
    eraName: 'العصر الجاهلي',
    years: 'توفي قُبيل الهجرة',
    bio: 'من أشهر حكماء العرب وخطبائهم في الجاهلية وأطولهم عمراً، ضُربت به الأمثال في الحكمة وحسن المشورة وفصل الخطاب.',
    famousQuote: '«إن أفضل الأشياء أعاليها، وأعلى الرجال ملوكها، وأفضل الملوك أعمّها نفعاً.»',
    pages: [9, 60, 134, 222],
    tags: ['خطابة', 'أمثال', 'حكمة'],
  },
  {
    id: 'ibnhazm',
    name: 'ابن حزم الأندلسي',
    title: 'فقيه الأدب وفيلسوف الأندلس',
    era: 'andalusian',
    eraName: 'الأندلس والمغرب',
    years: '384 هـ - 456 هـ',
    bio: 'علي بن أحمد بن حزم القرطبي، صاحب كتاب طوق الحمامة في الألفة والأُلاف، تميز بسعة المعرفة ودقة التحليل النفسي والعاطفي.',
    famousQuote: '«لا تبذل نفسك إلا فيما هو أعلى منها، وليس ذلك إلا في الله عز وجل.»',
    pages: [41, 102, 185],
    tags: ['أندلس', 'أدب', 'فلسفة'],
  },
  {
    id: 'ahnaf',
    name: 'الأحنف بن قيس',
    title: 'مضرب المثل في الحلم والكياسة والسؤدد',
    era: 'early-islamic',
    eraName: 'صدر الإسلام',
    years: 'توفي 67 هـ',
    bio: 'سيد بني تميم، ضُرب به المثل فقيل: «أحلم من الأحنف»، قاد قومه بالحكمة والحلم وحسن السياسة ونبذ الغضب.',
    famousQuote: '«الكذب مجانب للإيمان، وما كذب أحد إلا لصغر قدر نفسه عنده.»',
    pages: [27, 75, 149],
    tags: ['حلم', 'سياسة', 'مروءة'],
  },
  {
    id: 'umarebn',
    name: 'عمر بن عبد العزيز',
    title: 'الخليفة الراشد والزاهد العادل',
    era: 'umayyad',
    eraName: 'العصر الأموي',
    years: '61 هـ - 101 هـ',
    bio: 'ثامن الخلفاء الأمويين وخامس الخلفاء الراشدين، اشتهر بالعدل والزهد وبلاغة الرسائل والمواعظ المؤثرة.',
    famousQuote: '«إن لي نفساً توّاقة؛ تاقت إلى الإمارة فنالتها، وتاقت إلى الخلافة فنالتها، وإنها الآن تتوق إلى الجنة.»',
    pages: [35, 82, 168],
    tags: ['خلافة', 'عدل', 'مواعظ'],
  },
];

export const BiographiesModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToPage: (page: number) => void;
}> = ({ open, onOpenChange, onNavigateToPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [activeFigure, setActiveFigure] = useState<BiographyItem | null>(null);

  const filteredData = useMemo(() => {
    return BIOGRAPHIES_DATA.filter((item) => {
      const matchesSearch =
        item.name.includes(searchQuery) ||
        item.title.includes(searchQuery) ||
        item.bio.includes(searchQuery) ||
        item.tags.some((t) => t.includes(searchQuery));
      const matchesEra = selectedEra === 'all' || item.era === selectedEra;
      return matchesSearch && matchesEra;
    });
  }, [searchQuery, selectedEra]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-2xl max-h-[88vh] rounded-3xl z-50 shadow-2xl p-5 sm:p-7 overflow-y-auto focus:outline-none custom-scrollbar border"
          style={{
            background: 'var(--app-bg)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  <span>دليل أعلام وشخصيات الكتاب</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {BIOGRAPHIES_DATA.length} شخصيات
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-75" style={{ color: 'var(--app-text-muted)' }}>
                  تراجم موجزة ومواضع الاستشهاد بأقوالهم في صفحات الكتاب
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2.5 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50" style={{ color: 'var(--app-text)' }} />
              <input
                type="text"
                placeholder="ابحث بالاسم، اللقب، أو الموضوع (مثل: المتنبي، الجاحظ...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl border text-xs font-arabic transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 app-surface"
                style={{
                  borderColor: 'var(--app-surface-border)',
                  color: 'var(--app-text)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Eras filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px] font-arabic font-bold">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pre-islamic', label: 'الجاهلي' },
                { id: 'early-islamic', label: 'صدر الإسلام' },
                { id: 'umayyad', label: 'الأموي' },
                { id: 'abbasid', label: 'العباسي' },
                { id: 'andalusian', label: 'الأندلس والمغرب' },
              ].map((era) => {
                const isSelected = selectedEra === era.id;
                return (
                  <button
                    key={era.id}
                    onClick={() => setSelectedEra(era.id)}
                    className="px-3 py-1 rounded-xl border transition-all shrink-0 cursor-pointer"
                    style={{
                      background: isSelected ? 'var(--app-brand-grad)' : 'var(--app-surface)',
                      borderColor: isSelected ? 'transparent' : 'var(--app-surface-border)',
                      color: isSelected ? 'white' : 'var(--app-text)',
                    }}
                  >
                    {era.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Biographies Cards List */}
          <div className="space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((figure) => {
                const isExpanded = activeFigure?.id === figure.id;
                return (
                  <div
                    key={figure.id}
                    className="rounded-2xl border p-3.5 sm:p-4 transition-all app-surface hover:shadow-sm"
                    style={{ borderColor: isExpanded ? 'var(--app-brand)' : 'var(--app-surface-border)' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-2xs"
                          style={{
                            background: 'var(--app-brand-dim)',
                            borderColor: 'var(--app-brand-border)',
                            color: 'var(--app-brand)',
                          }}
                        >
                          {figure.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold font-arabic" style={{ color: 'var(--app-text)' }}>
                              {figure.name}
                            </h3>
                            <span className="text-[10px] font-arabic font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                              {figure.eraName}
                            </span>
                          </div>
                          <p className="text-xs font-arabic opacity-75 mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                            {figure.title} • <span className="font-sans text-[11px]">{figure.years}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveFigure(isExpanded ? null : figure)}
                        className="p-1.5 rounded-xl border text-xs font-arabic transition-all active:scale-95 cursor-pointer hover:brightness-105 shrink-0"
                        style={{
                          background: isExpanded ? 'var(--app-brand-dim)' : 'transparent',
                          borderColor: 'var(--app-divider)',
                          color: 'var(--app-brand)',
                        }}
                      >
                        {isExpanded ? 'طي' : 'تفاصيل'}
                      </button>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs font-arabic leading-relaxed mt-2.5 opacity-90" style={{ color: 'var(--app-text)' }}>
                      {figure.bio}
                    </p>

                    {/* Quote Box */}
                    <div
                      className="mt-2.5 p-2.5 rounded-xl border flex items-start gap-2 text-xs font-arabic"
                      style={{
                        background: 'rgba(212, 175, 55, 0.08)',
                        borderColor: 'rgba(212, 175, 55, 0.25)',
                        color: 'var(--app-text)',
                      }}
                    >
                      <Quote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium italic">{figure.famousQuote}</span>
                    </div>

                    {/* Mentioned Pages Links */}
                    <div className="mt-3 pt-2.5 border-t flex items-center justify-between flex-wrap gap-2" style={{ borderColor: 'var(--app-divider)' }}>
                      <span className="text-[11px] font-arabic opacity-75 flex items-center gap-1" style={{ color: 'var(--app-text-muted)' }}>
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>مواضع ذكره في صفحات الكتاب:</span>
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {figure.pages.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => {
                              onOpenChange(false);
                              onNavigateToPage(pageNum);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-sans border transition-all active:scale-95 hover:scale-105 cursor-pointer shadow-2xs"
                            style={{
                              background: 'var(--app-brand-dim)',
                              borderColor: 'var(--app-brand-border)',
                              color: 'var(--app-brand)',
                            }}
                            title={`انتقل إلى صفحة ${pageNum}`}
                          >
                            ص {pageNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 opacity-70">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-arabic text-xs font-semibold">لم يتم العثور على شخصية مطابقة للبحث</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
