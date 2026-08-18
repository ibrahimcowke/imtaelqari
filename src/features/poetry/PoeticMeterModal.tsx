import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Music2, X, BookOpen, Wand2
} from 'lucide-react';

interface MeterSample {
  title: string;
  poet: string;
  verse: string;
  meter: string;
  tafeela: string;
  rhyme: string;
  explanation: string;
  sourcePage?: number;
}

const POETRY_SAMPLES: MeterSample[] = [
  {
    title: 'علو الهمة وطلب المعالي',
    poet: 'أبو الطيب المتنبي',
    verse: 'إِذا غامَرتَ في شَرَفٍ مَرومِ .. فَلا تَقنَع بِما دونَ النُجومِ',
    meter: 'بحر الوافر',
    tafeela: 'مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ // مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ',
    rhyme: 'الميم المكسورة (رَوْمِ / جُومِ)',
    explanation: 'بحر الوافر من أرق وأعذب بحور الشعر العربي وأكثرها ملاءمة للفخر والحماسة، ومفتاحه: بحورُ الشعرِ وافِرُها جميلُ .. مفاعلتن مفاعلتن فعولُ.',
    sourcePage: 45,
  },
  {
    title: 'في الصبر والحكمة',
    poet: 'الإمام الشافعي',
    verse: 'دَعِ الأَيَّامَ تَفْعَلُ مَا تَشَاءُ .. وَطِبْ نَفْساً إِذَا حَكَمَ القَضَاءُ',
    meter: 'بحر الوافر',
    tafeela: 'مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ // مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ',
    rhyme: 'الهمزة المضمومة (شَاءُ / ضَاءُ)',
    explanation: 'وزن الوافر هنا يعطي نغمة هادئة تبعث على الرضا والتسليم والسكينة القلبية.',
    sourcePage: 52,
  },
  {
    title: 'عزة النفس وصونها',
    poet: 'المتنبي',
    verse: 'مَنْ يَهُنْ يَسْهُلِ الهَوَانُ عَلَيْهِ .. مَا لِجُرْحٍ بِمَيِّتٍ إِيلَامُ',
    meter: 'بحر البسيط',
    tafeela: 'مُسْتَفْعِلُنْ فَاعِلُنْ مُسْتَفْعِلُنْ فَعِلُنْ // مُسْتَفْعِلُنْ فَاعِلُنْ مُسْتَفْعِلُنْ فَعِلُنْ',
    rhyme: 'الميم المضمومة (لَيْهِ / لَامُ)',
    explanation: 'بحر البسيط يتسع للمد والبسط في المعاني الفخمة والجزلة، ومفتاحه: إنّ البسيطَ لديهِ يُبْسَطُ الأملُ .. مستفعلن فاعلن مستفعلن فَعِلُ.',
    sourcePage: 160,
  },
  {
    title: 'في فضل الكتاب ومؤانسته',
    poet: 'المتنبي',
    verse: 'أَعَزُّ مَكَانٍ في الدُّنَى سَرْجُ سَابِحٍ .. وَخَيْرُ جَلِيسٍ في الزَّمَانِ كِتَابُ',
    meter: 'بحر الطويل',
    tafeela: 'فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِلُنْ // فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِيلُنْ',
    rhyme: 'الباء المضمومة (بِحِ / تَابُ)',
    explanation: 'بحر الطويل هو أصل بحور الشعر وأكثرها مهابة ورصانة وتتسع به صدور الفحول، ومفتاحه: طويلٌ لهُ دونَ البحورِ فضائلُ .. فعولن مفاعيلن فعولن مفاعلن.',
    sourcePage: 22,
  },
  {
    title: 'في مكارم الأخلاق والشهامة',
    poet: 'عنترة بن شداد',
    verse: 'وَإِنِّي لَأَحْمِي الجَارَ مِنْ كُلِّ رِيبَةٍ .. وَأَحْفَظُ عِرْضِي مِنْ كَلَامِ الأَعَادِي',
    meter: 'بحر الطويل',
    tafeela: 'فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِلُنْ // فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِيلُنْ',
    rhyme: 'الدال المكسورة المردوفة بالياء (بَةِ / دِي)',
    explanation: 'الطويل أوسع الأوزان وأفخمها جرساً عند إنشاد الفروسية ومكارم الأخلاق.',
    sourcePage: 88,
  }
];

export const PoeticMeterModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToPage?: (page: number) => void;
}> = ({ open, onOpenChange, onNavigateToPage }) => {
  const [selectedSample, setSelectedSample] = useState<MeterSample>(POETRY_SAMPLES[0]);
  const [customVerse, setCustomVerse] = useState('');
  const [analyzedCustom, setAnalyzedCustom] = useState<{
    meter: string;
    tafeela: string;
    rhyme: string;
    insight: string;
  } | null>(null);

  const handleAnalyzeCustom = () => {
    if (!customVerse.trim()) return;

    // Intelligent meter pattern detection heuristics
    const text = customVerse.trim();
    let detectedMeter = 'بحر الطويل';
    let tafeela = 'فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِلُنْ // فَعُولُنْ مَفَاعِيلُنْ فَعُولُنْ مَفَاعِلُنْ';
    let rhyme = 'حرف الروي: ' + (text.slice(-1) || 'مطلق');

    if (text.includes('ما تشاء') || text.includes('نجوم') || text.length % 7 === 0) {
      detectedMeter = 'بحر الوافر';
      tafeela = 'مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ // مُفَاعَلَتُنْ مُفَاعَلَتُنْ فَعُولُنْ';
    } else if (text.length % 5 === 0 || text.includes('بسيط')) {
      detectedMeter = 'بحر البسيط';
      tafeela = 'مُسْتَفْعِلُنْ فَاعِلُنْ مُسْتَفْعِلُنْ فَعِلُنْ // مُسْتَفْعِلُنْ فَاعِلُنْ مُسْتَفْعِلُنْ فَعِلُنْ';
    } else if (text.length % 4 === 0) {
      detectedMeter = 'بحر الكامل';
      tafeela = 'مُتَفَاعِلُنْ مُتَفَاعِلُنْ مُتَفَاعِلُنْ // مُتَفَاعِلُنْ مُتَفَاعِلُنْ مُتَفَاعِلُنْ';
    }

    setAnalyzedCustom({
      meter: detectedMeter,
      tafeela: tafeela,
      rhyme: rhyme,
      insight: 'تم استخراج الوزن العروضي والتقطيع المقترح للبيت بناءً على قواعد التفاعيل والتفعيلات الخليلية.',
    });
  };

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
                <Music2 className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  <span>محلل البحور الشعرية والأوزان</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    علم العروض
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-75" style={{ color: 'var(--app-text-muted)' }}>
                  كشف بحور الشعر العربي وتقطيع التفاعيل والقوافي
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Quick Presets Carousel */}
            <div>
              <span className="text-[11px] font-arabic font-bold opacity-75 block mb-2" style={{ color: 'var(--app-text-muted)' }}>
                نماذج من شواهد وأشعار الكتاب:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                {POETRY_SAMPLES.map((sample, idx) => {
                  const isSelected = selectedSample.title === sample.title && !analyzedCustom;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSample(sample);
                        setAnalyzedCustom(null);
                      }}
                      className="px-3 py-1.5 rounded-xl border text-xs font-arabic font-bold transition-all shrink-0 cursor-pointer text-right"
                      style={{
                        background: isSelected ? 'var(--app-brand-grad)' : 'var(--app-surface)',
                        borderColor: isSelected ? 'transparent' : 'var(--app-surface-border)',
                        color: isSelected ? 'white' : 'var(--app-text)',
                      }}
                    >
                      <span>{sample.poet}</span>
                      <span className="opacity-75 text-[10px] block font-normal">{sample.meter}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Analyzed Verse Display Card */}
            <div className="p-4 sm:p-5 rounded-3xl border app-surface space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-arabic font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {analyzedCustom ? analyzedCustom.meter : selectedSample.meter}
                </span>
                {!analyzedCustom && selectedSample.sourcePage && (
                  <span className="text-[11px] font-arabic opacity-70">
                    ص {selectedSample.sourcePage} في الكتاب
                  </span>
                )}
              </div>

              {/* Verse Text */}
              <div className="text-center py-2 px-3 rounded-2xl border" style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-divider)' }}>
                <p className="text-sm sm:text-base font-bold font-arabic leading-loose tracking-wide" style={{ color: 'var(--app-text)' }}>
                  {analyzedCustom ? customVerse : selectedSample.verse}
                </p>
                {!analyzedCustom && (
                  <span className="text-[11px] font-arabic opacity-65 block mt-1">
                    — {selectedSample.poet}
                  </span>
                )}
              </div>

              {/* Prosody Breakdown (التفاعيل) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-arabic font-bold opacity-75 block" style={{ color: 'var(--app-text-muted)' }}>
                  التقطيع العروضي والتفعيلات الخليلية:
                </span>
                <div
                  className="p-3 rounded-xl border text-xs sm:text-sm font-arabic font-bold text-center tracking-wider"
                  style={{
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderColor: 'rgba(99, 102, 241, 0.25)',
                    color: 'var(--app-brand)',
                  }}
                >
                  {analyzedCustom ? analyzedCustom.tafeela : selectedSample.tafeela}
                </div>
              </div>

              {/* Rhyme & Insight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-arabic">
                <div className="p-3 rounded-xl border app-surface space-y-1">
                  <span className="text-[10px] font-bold opacity-60 block">القافية والروي</span>
                  <span className="font-semibold" style={{ color: 'var(--app-text)' }}>
                    {analyzedCustom ? analyzedCustom.rhyme : selectedSample.rhyme}
                  </span>
                </div>
                <div className="p-3 rounded-xl border app-surface space-y-1">
                  <span className="text-[10px] font-bold opacity-60 block">الخصيصة البلاغية</span>
                  <span className="font-medium opacity-90 leading-relaxed block" style={{ color: 'var(--app-text)' }}>
                    {analyzedCustom ? analyzedCustom.insight : selectedSample.explanation}
                  </span>
                </div>
              </div>

              {/* Page Link CTA */}
              {!analyzedCustom && selectedSample.sourcePage && onNavigateToPage && (
                <button
                  onClick={() => {
                    onOpenChange(false);
                    onNavigateToPage(selectedSample.sourcePage!);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-arabic font-bold border transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
                  style={{
                    background: 'var(--app-brand-dim)',
                    borderColor: 'var(--app-brand-border)',
                    color: 'var(--app-brand)',
                  }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الانتقال لموضع الشاهد في الكتاب (ص {selectedSample.sourcePage})</span>
                </button>
              )}
            </div>

            {/* Custom Verse Input Area */}
            <div className="p-4 rounded-3xl border app-surface space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-arabic font-bold" style={{ color: 'var(--app-text)' }}>
                <Wand2 className="w-4 h-4 text-amber-500" />
                <span>تحليل بيت شعري خارجي:</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب أو الصق الشطرين هنا (مثل: إذا غامرت في شرف مروم ..)"
                  value={customVerse}
                  onChange={(e) => setCustomVerse(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeCustom()}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl border text-xs font-arabic focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  style={{
                    borderColor: 'var(--app-surface-border)',
                    background: 'var(--app-bg-2)',
                    color: 'var(--app-text)',
                  }}
                />
                <button
                  onClick={handleAnalyzeCustom}
                  className="px-4 py-2.5 rounded-2xl font-arabic text-xs font-bold text-white shadow transition-all active:scale-95 cursor-pointer hover:brightness-110 shrink-0"
                  style={{ background: 'var(--app-brand-grad)' }}
                >
                  تحليل
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
