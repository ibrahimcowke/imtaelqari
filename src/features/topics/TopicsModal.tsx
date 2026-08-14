import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Layers, X, ArrowRight,
} from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';

interface TopicCategory {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  pages: { page: number; title: string; snippet: string }[];
}

const TOPICS_DATA: TopicCategory[] = [
  {
    id: 'wisdom',
    title: 'الحكمة وفضل العقل',
    emoji: '💡',
    desc: 'روائع الأقوال في نور البصيرة وصواب الرأي وحسن التدبير',
    pages: [
      { page: 1, title: 'المقدمة والبداية', snippet: 'والحكمة من أجلّ ما يمكن أن يمنحه الله للإنسان بعد الإيمان بالله والتحلي بمكارم الأخلاق...' },
      { page: 3, title: 'روائع الحكم', snippet: 'إن من البيان لسحراً وإن من الشعر لحكمة.. وهذا لقاء السحاب حيث تحمل الكلمة روعة الحكمة...' },
      { page: 14, title: 'ثمرات البصيرة', snippet: 'رأس الحكمة مخافة الله، والعاقل من وعظ بغيره ونظر في عواقب الأمور قبل ورودها...' },
    ],
  },
  {
    id: 'patience',
    title: 'الصبر ومواجهة الشدائد',
    emoji: '🌿',
    desc: 'حِكم خالدة في الثبات عند المحن والترفع عن الجزع',
    pages: [
      { page: 12, title: 'أدب البلاء والشدائد', snippet: 'ليس العاقل الذي يعرف الخير من الشر، ولكنه الذي يعرف خير الشرين إذا نزل به البلاء...' },
      { page: 25, title: 'عزة النفس والصبر', snippet: 'الصبر مطية لا تكبو، والحلم رداء لا يبلى، وعزة النفس تاج لا يزول بريقه مع تقلب الأيام...' },
      { page: 54, title: 'تفريج الكروب', snippet: 'اشتدي أزمة تنفرجي.. وما بعد الضيق إلا السعة وما بعد العسر إلا يسرين...' },
    ],
  },
  {
    id: 'morals',
    title: 'مكارم الأخلاق وعزة النفس',
    emoji: '👑',
    desc: 'الشهامة، المروءة، الشرف، وعلو الهمة',
    pages: [
      { page: 4, title: 'شيم الكرام', snippet: 'التحلي بمكارم الأخلاق وشيم الكرام هو الحصن المنيع الذي يرفع صاحبه إلى أرفع المنازل...' },
      { page: 32, title: 'علو الهمة والمروءة', snippet: 'إذا كانت النفوس كباراً تعبت في مرادها الأجسام، والمرء يطير بهمته كما يطير الطير بجناحيه...' },
      { page: 41, title: 'حفظ الكرامة', snippet: 'من هانت عليه نفسه كان على غيره أهون، وتجرع كأس الصبر ولا ترضى بالدنية في دينك وعرضك...' },
    ],
  },
  {
    id: 'speech',
    title: 'أدب الحديث وبلاغة المنطق',
    emoji: '🗣️',
    desc: 'فصاحة اللسان، صمت الحكماء، وبلاغة الإيجاز',
    pages: [
      { page: 2, title: 'جمال الكلم الطيب', snippet: 'الكلم الطيب تحمله قدرات وقوى الجمال.. فهو يحمل أجمل المعاني الروحية التي لا تتأثر بالضغوط...' },
      { page: 48, title: 'أدب المنطق والمجالس', snippet: 'لسانك حصانك إن صنته صانك وإن خنته خانك.. وجمال المنطق زينة العقول وسلامة من الزلل...' },
      { page: 62, title: 'حكمة الصمت', snippet: 'إذا كان الكلام من فضة فالسكوت من ذهب.. وما ندم حكيم على صمت قط كما ندم على كلام...' },
    ],
  },
  {
    id: 'friendship',
    title: 'الصداقة وحسن المعاشرة',
    emoji: '🤝',
    desc: 'أدب الصحبة، الوفاء بالعهود، والتغافل عن الهفوات',
    pages: [
      { page: 18, title: 'اختيار الأصدقاء', snippet: 'الصاحب ساحب، فاختر من إذا صحبته زانك وإن غبت عنه صانك وإن احتجت إليه أعانك...' },
      { page: 39, title: 'أدب التغافل والتسامح', snippet: 'تسعة أعشار حسن الخلق في التغافل، ومن حاسب إخوانه على كل زلة بقي فرداً بلا رفيق...' },
    ],
  },
];

export const TopicsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: () => void;
}> = ({ open, onOpenChange, onNavigate }) => {
  const { setCurrentPage } = useReaderStore();
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>(TOPICS_DATA[0]);

  const handleJump = (page: number) => {
    setCurrentPage(page);
    onOpenChange(false);
    onNavigate();
  };

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
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold font-arabic">
                  التصفح الموضوعي للكتاب
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  تصفح الحكم والأدب مصنفة حسب موضوعات الحياة
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Topics Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 custom-scrollbar">
            {TOPICS_DATA.map((t) => {
              const isSelected = selectedTopic.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-arabic font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5"
                  style={isSelected
                    ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 2px 8px var(--app-brand-glow)' }
                    : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
                  }
                >
                  <span>{t.emoji}</span>
                  <span>{t.title}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Topic Detail */}
          <div className="mb-3">
            <h3 className="font-arabic font-bold text-base mb-0.5" style={{ color: 'var(--app-brand)' }}>
              {selectedTopic.emoji} {selectedTopic.title}
            </h3>
            <p className="text-xs font-arabic opacity-75">{selectedTopic.desc}</p>
          </div>

          {/* Pages matching this topic */}
          <div className="space-y-2.5">
            {selectedTopic.pages.map((p) => (
              <div
                key={p.page}
                onClick={() => handleJump(p.page)}
                className="p-4 rounded-2xl transition-all cursor-pointer group active:scale-98"
                style={{
                  background: 'var(--app-brand-dim)',
                  border: '1px solid var(--app-brand-border)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--app-brand)' }} />
                    <h4 className="font-arabic font-bold text-sm" style={{ color: 'var(--app-text)' }}>
                      {p.title}
                    </h4>
                  </div>
                  <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: 'var(--app-surface)', color: 'var(--app-brand)' }}>
                    ص {p.page}
                  </span>
                </div>

                <p className="text-xs font-arabic leading-relaxed opacity-80 mb-2 line-clamp-2">
                  «{p.snippet}»
                </p>

                <div className="flex items-center justify-end text-xs font-arabic font-bold gap-1"
                  style={{ color: 'var(--app-brand)' }}>
                  <span>اقرأ في الصفحة {p.page}</span>
                  <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
