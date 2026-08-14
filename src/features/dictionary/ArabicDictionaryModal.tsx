import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { BookMarked, Search, X } from 'lucide-react';
import { normalizeArabic } from '../../data/service';

interface LexiconEntry {
  word: string;
  root: string;
  type: string;
  meaning: string;
  example: string;
}

const DICTIONARY_ENTRIES: LexiconEntry[] = [
  { word: 'الحكمة', root: 'ح-ك-م', type: 'اسم مصدر', meaning: 'وضع الشيء في موضعه اللائق به، ومعرفة أفضل الأشياء بأفضل العلوم، وصواب الأمر وسداده.', example: '«والحكمة من أجلّ ما يمكن أن يمنحه الله للإنسان»' },
  { word: 'البيان', root: 'ب-ي-ن', type: 'اسم', meaning: 'الفصاحة والبلاغة والقدرة على التعبير عن المعاني الخفية بأبلغ الألفاظ وأوضحها.', example: '«إن من البيان لسحراً وإن من الشعر لحكمة»' },
  { word: 'السؤدد', root: 'س-و-د', type: 'اسم', meaning: 'الشرف والمجد والسيادة وعلو الشأن والمنزلة الرفيعة بين الناس.', example: '«لا ينال السؤدد إلا من تجرع مرارة الصبر»' },
  { word: 'الأناة', root: 'أ-ن-ي', type: 'مصدر', meaning: 'التأني والتروي والوقار وعدم العجلة في اتخاذ القرارات والمسير.', example: '«الأناة في الأمور نجاة، والعجلة ندامة»' },
  { word: 'الحلم', root: 'ح-ل-م', type: 'اسم', meaning: 'ضبط النفس عند الغضب والتجاوز عن زلات الجاهلين برزانة وحكمة.', example: '«كاد الحليم أن يكون نبياً لما في الحلم من وقار»' },
  { word: 'الفطنة', root: 'ف-ط-ن', type: 'مصدر', meaning: 'حدة العقل والذكاء وسرعة الإدراك والبديهة في استنباط الحقائق.', example: '«المؤمن كيس فطن لا يُلدغ من جحر مرتين»' },
  { word: 'الشيمة', root: 'ش-ي-م', type: 'اسم (جمع: شيم)', meaning: 'الخلق والطبع الأصيل والغريزة الكريمة في الإنسان.', example: '«مكارم الأخلاق وشيم الكرام حصن للمرء»' },
  { word: 'الوقار', root: 'و-ق-ر', type: 'اسم', meaning: 'الرزانة والهدوء والسكينة والهيبة في المجلس والحديث.', example: '«لبس رداء الوقار واجتنب لغو المقال»' },
  { word: 'البلاغة', root: 'ب-ل-غ', type: 'مصدر', meaning: 'مطابقة الكلام لمقتضى الحال مع فصاحته وحسن تأثيره في نفوس السامعين.', example: '«البلاغة إيجاز في غير عجز وإطناب في غير خطل»' },
  { word: 'المكرمة', root: 'ك-ر-م', type: 'اسم (جمع: مكارم)', meaning: 'الفعل الجميل المحمود والخصال الرفيعة كالجود والوفاء والشهامة.', example: '«التحلي بمكارم الأخلاق أمل كل الناجحين»' },
  { word: 'الخطل', root: 'خ-ط-ل', type: 'اسم', meaning: 'الفساد والاضطراب والخطأ في الكلام والرأي.', example: '«كثرة الكلام مظنة الخطل والزلل»' },
  { word: 'الجنان', root: 'ج-ن-ن', type: 'اسم', meaning: 'القلب والضمير الباطن والروح المستورة في الجسد.', example: '«نطق اللسان بما أكنّه الجنان»' },
];

export const ArabicDictionaryModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWord?: string;
}> = ({ open, onOpenChange, initialWord = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialWord);
  const [selectedWord, setSelectedWord] = useState<LexiconEntry>(DICTIONARY_ENTRIES[0]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return DICTIONARY_ENTRIES;
    const q = normalizeArabic(searchQuery.trim().toLowerCase());
    return DICTIONARY_ENTRIES.filter((e) =>
      normalizeArabic(e.word).includes(q) ||
      normalizeArabic(e.root).includes(q) ||
      normalizeArabic(e.meaning).includes(q)
    );
  }, [searchQuery]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl z-50 p-6 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto custom-scrollbar"
          style={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}>
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold font-arabic">
                  المعجم اللغوي والأدبي الفوري
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  شرح مفردات وجذور الحكم والأدب العربي
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مفردة أدبية أو جذر لغوي (مثال: الحكمة، الصبر)..."
              className="w-full pl-4 pr-10 py-3 rounded-2xl font-arabic text-sm outline-none transition-all"
              style={{
                background: 'var(--app-brand-dim)',
                border: '1px solid var(--app-brand-border)',
                color: 'var(--app-text)',
              }}
            />
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          </div>

          {/* Word Detail Card */}
          <div
            className="rounded-2xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: 'var(--app-brand-dim)',
              border: '1px solid var(--app-brand-border)',
              boxShadow: '0 4px 20px var(--app-brand-glow)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold font-arabic" style={{ color: 'var(--app-brand)' }}>
                {selectedWord.word}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-arabic px-2.5 py-1 rounded-lg"
                  style={{ background: 'var(--app-surface)', border: '1px solid var(--app-surface-border)' }}>
                  الجذر: <strong>{selectedWord.root}</strong>
                </span>
                <span className="text-xs font-arabic px-2.5 py-1 rounded-lg"
                  style={{ background: 'var(--app-surface)', border: '1px solid var(--app-surface-border)' }}>
                  {selectedWord.type}
                </span>
              </div>
            </div>

            <p className="font-arabic text-sm leading-relaxed mb-3 opacity-90">
              {selectedWord.meaning}
            </p>

            <div className="pt-2.5 border-t border-black/10 text-xs font-arabic italic opacity-80"
              style={{ borderColor: 'var(--app-divider)' }}>
              شاهد الاستعمال: {selectedWord.example}
            </div>
          </div>

          {/* Word List Chips */}
          <div>
            <label className="text-xs font-arabic font-bold uppercase tracking-wider block mb-2 opacity-70">
              مفردات شائعة في الكتاب ({filteredList.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredList.map((item) => {
                const isCurrent = selectedWord.word === item.word;
                return (
                  <button
                    key={item.word}
                    onClick={() => setSelectedWord(item)}
                    className="px-3.5 py-2 rounded-xl text-xs font-arabic font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                    style={isCurrent
                      ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 2px 8px var(--app-brand-glow)' }
                      : { background: 'var(--app-surface)', border: '1px solid var(--app-surface-border)', color: 'var(--app-text)' }
                    }
                  >
                    <span>{item.word}</span>
                    <span className="opacity-60 text-[10px]">({item.root})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
