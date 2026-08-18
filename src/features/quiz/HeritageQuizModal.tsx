import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Trophy, X, CheckCircle2, XCircle, RotateCcw,
  Flame, Award, ArrowLeft,
  BookOpen, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QuizQuestion {
  id: string;
  category: 'wisdom' | 'poetry' | 'language' | 'rhetoric';
  categoryName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourcePage?: number;
  quote?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'wisdom',
    categoryName: 'حكم وأمثال',
    question: 'ما هو أصل الحكمة الشهيرة: «لكل جواد كبوة، ولكل صارم نبوة»؟',
    options: [
      'بيان أن الكمال لله وحده وأن الخطأ يعتري حتى الفضلاء',
      'الحث على ركوب الخيل في السفر والترحال',
      'التحذير من استخدام السيوف غير المشحوذة',
      'مدح الفرسان في ساحات القتال'
    ],
    correctIndex: 0,
    explanation: 'تضرب هذه الحكمة لبيان أن الإنسان مهما بلغ فضله وحذقه فلابد أن يقع منه السهو أو الزلل، فلا يُعاب الفاضل بهفوة نادرة.',
    sourcePage: 12,
  },
  {
    id: 'q2',
    category: 'poetry',
    categoryName: 'روائع الشعر',
    question: 'من القائل: «إذا غامَرْتَ في شَرَفٍ مَرُومِ .. فَلا تَقْنَعْ بما دُونَ النّجُومِ»؟',
    options: [
      'أبو الطيب المتنبي',
      'امرؤ القيس',
      'عنترة بن شداد',
      'أبو تمام'
    ],
    correctIndex: 0,
    explanation: 'البيت لأبي الطيب المتنبي في قصيدته الشهيرة، ويحث فيه على علو الهمة وطلب المعالي وعدم الرضا بالدون.',
    sourcePage: 45,
  },
  {
    id: 'q3',
    category: 'rhetoric',
    categoryName: 'البلاغة والبيان',
    question: 'ما الفن البلاغي في قوله تعالى: «وَجَنَى الْجَنَّتَيْنِ دَانٍ»؟',
    options: [
      'جناس تام بين كلمتي (جنى) و(الجنتين)',
      'جناس اشتقاقي بديع يجمع بين حسن اللفظ وتماسك المعنى',
      'طباق سلب وإيجاب',
      'تورية في كلمة (دان)'
    ],
    correctIndex: 1,
    explanation: 'الجناس الاشتقاقي هنا بين (جَنَى) وهو الثمر المجتنى، و(الجنّتين) مشتقان من أصل واحد مع اختلاف المعنى اللطيف.',
    sourcePage: 78,
  },
  {
    id: 'q4',
    category: 'language',
    categoryName: 'فرائد اللغة',
    question: 'ما معنى كلمة «السَّوْرَة» في فصيح كلام العرب؟',
    options: [
      'الحائط المرتفع فقط',
      'الحدة والسطوة والوثوب، ومنه سورة الغضب أو سورة الخمر',
      'الكتابة المختصرة',
      'السير في الليل المظلم'
    ],
    correctIndex: 1,
    explanation: 'السَّوْرة بالفتح تعني الشدة والسطوة والوثوب، يقال: لفلان سورة أي سطوة ووثبة، وسورة الشرابه أي حدته.',
    sourcePage: 104,
  },
  {
    id: 'q5',
    category: 'wisdom',
    categoryName: 'حكم وأمثال',
    question: 'ما المراد بالمثل العربي السائر: «مواعيد عُرقوب»؟',
    options: [
      'المواعيد الدقيقة التي لا تتخلف',
      'إخلاف الوعد والمماطلة المستمرة',
      'المواعيد التي تكون في الصباح الباكر',
      'العهود المكتوبة في الصكوك'
    ],
    correctIndex: 1,
    explanation: 'يضرب المثل فيمن يكثر الإخلاف والمطل بالوعد، ونسبته إلى عرقوب رجل من يثرب كان يعد أخاه بثمر النخل حتى صرمه ولم يعطه شيئاً.',
    sourcePage: 132,
  },
  {
    id: 'q6',
    category: 'poetry',
    categoryName: 'روائع الشعر',
    question: 'أكمل صدر البيت: «................. .. ومن يهن يسهل الهوان عليه»؟',
    options: [
      'ما لجرح بميت إيلام',
      'إذا أنت لم تشرب مراراً على القذى',
      'وما نيل المطالب بالتمني',
      'ألا كل شيء ما خلا الله باطل'
    ],
    correctIndex: 0,
    explanation: 'البيت للمتنبي: «من يهن يسهل الهوان عليه .. ما لجرح بميت إيلام»، وهو من أروع ما قيل في عزة النفس ورفض الدنية.',
    sourcePage: 160,
  },
  {
    id: 'q7',
    category: 'rhetoric',
    categoryName: 'البلاغة والبيان',
    question: 'ما هو «حسن الابتداء» أو «براعة الاستهلال» في فن الخطابة والأدب؟',
    options: [
      'أن يبدأ الخطيب بالصياح لجذب الانتباه',
      'أن يفتتح المتكلم كلامه بما يشير ببراعة ولطف إلى مقصوده وغرضه',
      'أن يذكر تاريخ ولادته ونسبه أولاً',
      'أن يختم القصيدة ببيت حكمة'
    ],
    correctIndex: 1,
    explanation: 'براعة الاستهلال أن يأتي الأديب أو الشاعر في أول كلامه بما يدل على مراده وموضوع خطابه بإيجاز وعذوبة لفظ.',
    sourcePage: 198,
  },
  {
    id: 'q8',
    category: 'language',
    categoryName: 'فرائد اللغة',
    question: 'ما الفرق بين «العَطْف» و«الشَّفَقَة» في دقائق الفروق اللغوية التراثية؟',
    options: [
      'العطف ميل القلب مع النفع، والشفقة رقة القلب وخوف الضرر على المرحوم',
      'لا يوجد أي فرق وهما مترادفان تماماً',
      'الشفقة تكون للحيوان فقط والعطف للإنسان',
      'العطف خاص بالقرابة والشفقة للغرباء'
    ],
    correctIndex: 0,
    explanation: 'العطف ميل وإحسان وإقبال، بينما الشفقة مشوبة بالخوف والإشفاق على من يُرحم من مكروه يصيبه.',
    sourcePage: 230,
  }
];

const RANKS = [
  { minScore: 0, title: 'طالب علم مبتدئ', icon: '🌱', color: '#94a3b8' },
  { minScore: 3, title: 'قارئ متأمل', icon: '📖', color: '#38bdf8' },
  { minScore: 5, title: 'راوية فطن', icon: '✨', color: '#10b981' },
  { minScore: 7, title: 'أديب بليغ', icon: '🏆', color: '#f59e0b' },
  { minScore: 8, title: 'علّامة متقن', icon: '👑', color: '#ec4899' },
];

export const HeritageQuizModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToPage?: (page: number) => void;
}> = ({ open, onOpenChange, onNavigateToPage }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > highestStreak) setHighestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  };

  const userRank = [...RANKS].reverse().find((r) => score >= r.minScore) || RANKS[0];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl max-h-[90vh] rounded-3xl z-50 shadow-2xl p-5 sm:p-7 overflow-y-auto focus:outline-none custom-scrollbar border"
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
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  <span>تحدي المسابقات وروائع الحكم</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    تفاعلي
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-75" style={{ color: 'var(--app-text-muted)' }}>
                  اختبر حصيلتك الأدبية والبلاغية من درر الكتاب
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {!isCompleted ? (
            <div className="space-y-4">
              {/* Progress & Stats Bar */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-2xl border app-surface">
                <div className="flex items-center gap-1.5 text-xs font-arabic font-bold">
                  <span className="opacity-60">السؤال:</span>
                  <span className="font-sans text-amber-600 dark:text-amber-400 font-extrabold">
                    {currentIndex + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {streak > 1 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-500 animate-bounce">
                      <Flame className="w-4 h-4 fill-orange-500" />
                      <span>{streak} متتالية!</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs font-arabic font-bold">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>النقاط: <strong className="font-sans font-black">{score}</strong></span>
                  </div>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                    background: 'var(--app-brand-grad)',
                  }}
                />
              </div>

              {/* Question Card */}
              <div className="p-4 sm:p-5 rounded-3xl border app-surface space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-arabic font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {currentQ.categoryName}
                  </span>
                  {currentQ.sourcePage && (
                    <span className="text-[10px] font-arabic opacity-70">
                      ص {currentQ.sourcePage}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold font-arabic leading-relaxed pt-1" style={{ color: 'var(--app-text)' }}>
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  let btnBg = 'var(--app-surface)';
                  let btnBorder = 'var(--app-surface-border)';
                  let icon = null;

                  if (isAnswered) {
                    if (isCorrect) {
                      btnBg = 'rgba(16, 185, 129, 0.15)';
                      btnBorder = '#10b981';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                    } else if (isSelected) {
                      btnBg = 'rgba(239, 68, 68, 0.15)';
                      btnBorder = '#ef4444';
                      icon = <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-200 active:scale-98 text-right cursor-pointer hover:brightness-105 disabled:cursor-default"
                      style={{
                        background: btnBg,
                        borderColor: btnBorder,
                        color: 'var(--app-text)',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-sans shrink-0 border"
                          style={{
                            background: isSelected ? 'var(--app-brand)' : 'var(--app-bg-2)',
                            color: isSelected ? 'white' : 'var(--app-text)',
                            borderColor: 'var(--app-divider)',
                          }}
                        >
                          {['أ', 'ب', 'ج', 'د'][idx]}
                        </span>
                        <span className="font-arabic text-xs sm:text-sm font-semibold leading-snug">
                          {option}
                        </span>
                      </div>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl border space-y-2"
                    style={{
                      background: selectedAnswer === currentQ.correctIndex ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      borderColor: selectedAnswer === currentQ.correctIndex ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h4 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                        {selectedAnswer === currentQ.correctIndex ? 'إجابة صحيحة! أحسنت 🌟' : 'إجابة غير صحيحة'}
                      </h4>
                    </div>
                    <p className="text-xs font-arabic leading-relaxed opacity-90" style={{ color: 'var(--app-text)' }}>
                      {currentQ.explanation}
                    </p>

                    {currentQ.sourcePage && onNavigateToPage && (
                      <button
                        onClick={() => {
                          onOpenChange(false);
                          onNavigateToPage(currentQ.sourcePage!);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-arabic font-bold text-amber-600 dark:text-amber-400 hover:underline pt-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>مراجعة الموضع في الكتاب (صفحة {currentQ.sourcePage})</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 rounded-2xl font-arabic text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
                  style={{ background: 'var(--app-brand-grad)' }}
                >
                  <span>{currentIndex < QUIZ_QUESTIONS.length - 1 ? 'السؤال التالي' : 'عرض النتيجة النهائية'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Result Screen */
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl border animate-bounce"
                style={{
                  background: 'var(--app-brand-dim)',
                  borderColor: userRank.color,
                }}
              >
                {userRank.icon}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-arabic font-bold text-amber-500 uppercase tracking-widest block">
                  المرتبة الأدبية المحققة
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-arabic" style={{ color: userRank.color }}>
                  {userRank.title}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                <div className="p-3 rounded-2xl border app-surface">
                  <span className="text-[10px] font-arabic opacity-70 block">الدرجة</span>
                  <span className="text-lg font-black font-sans text-amber-500">
                    {score}/{QUIZ_QUESTIONS.length}
                  </span>
                </div>
                <div className="p-3 rounded-2xl border app-surface">
                  <span className="text-[10px] font-arabic opacity-70 block">النسبة</span>
                  <span className="text-lg font-black font-sans text-emerald-500">
                    {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className="p-3 rounded-2xl border app-surface">
                  <span className="text-[10px] font-arabic opacity-70 block">أعلى تتابع</span>
                  <span className="text-lg font-black font-sans text-orange-500">
                    {highestStreak} 🔥
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 rounded-2xl font-arabic text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer app-surface hover:brightness-105"
                  style={{ color: 'var(--app-text)' }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة التحدي</span>
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 py-3 rounded-2xl font-arabic text-xs font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
                  style={{ background: 'var(--app-brand-grad)' }}
                >
                  <span>متابعة القراءة</span>
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
