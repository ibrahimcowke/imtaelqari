import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import {
  Trophy, X, CheckCircle2, Calendar, BookOpen,
  Plus, Check, Flame, Award, Trash2
} from 'lucide-react';
import { db } from '../../lib/db';
import { useReaderStore } from '../../store/readerStore';
import { bookDataService } from '../../data/service';
import type { KhatmaPlan } from '../../types/book';

export const KhatmaModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToPage?: (page: number) => void;
}> = ({ open, onOpenChange, onNavigateToPage }) => {
  const { currentPage, setCurrentPage } = useReaderStore();
  const totalPages = bookDataService.getPages().length || 174;

  const [isCreating, setIsCreating] = useState(false);
  const [planTitle, setPlanTitle] = useState('ختمة كتاب إمتاع القارئ');
  const [selectedDays, setSelectedDays] = useState<number>(30);

  const activeKhatmas = useLiveQuery(
    () => db.khatmas.filter((k) => !k.isCompleted).toArray(),
    []
  ) ?? [];

  const completedKhatmas = useLiveQuery(
    () => db.khatmas.filter((k) => k.isCompleted).toArray(),
    []
  ) ?? [];

  const handleCreatePlan = async (days: number) => {
    const dailyPages = Math.ceil((totalPages - currentPage + 1) / Math.max(1, days));
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + days);

    const newPlan: KhatmaPlan = {
      id: crypto.randomUUID(),
      title: planTitle.trim() || `ختمة الـ ${days} يوماً`,
      targetDays: days,
      startPage: currentPage,
      endPage: totalPages,
      currentPage: currentPage,
      startDate: now.toISOString(),
      targetDate: targetDate.toISOString(),
      isCompleted: false,
      dailyGoalPages: Math.max(1, dailyPages),
      lastReadDate: now.toISOString().split('T')[0],
    };

    await db.khatmas.add(newPlan);
    setIsCreating(false);
  };

  const handleUpdateProgress = async (plan: KhatmaPlan) => {
    const isFinished = currentPage >= plan.endPage;
    await db.khatmas.update(plan.id, {
      currentPage,
      isCompleted: isFinished,
      lastReadDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeletePlan = async (id: string) => {
    await db.khatmas.delete(id);
  };

  const handleResumeKhatma = (plan: KhatmaPlan) => {
    setCurrentPage(plan.currentPage || currentPage);
    if (onNavigateToPage) onNavigateToPage(plan.currentPage || currentPage);
    onOpenChange(false);
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
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  ختمات وتحديات القراءة
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-arabic"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                  >
                    أوراد يومية
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  نظّم قراءتك لكتاب إمتاع القارئ وأتمم ختمتك في موعدك المحدد
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all opacity-80 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {/* Active Khatmas */}
            {!isCreating && activeKhatmas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-arabic font-bold uppercase tracking-wider opacity-80">
                    الختمات النشطة حالياً
                  </h4>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 text-xs font-arabic font-bold text-amber-500 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    خطة جديدة
                  </button>
                </div>

                {activeKhatmas.map((k) => {
                  const pagesLeft = Math.max(0, k.endPage - currentPage);
                  const percent = Math.min(100, Math.round(((currentPage - k.startPage + 1) / (k.endPage - k.startPage + 1)) * 100));
                  const daysRemaining = Math.max(1, Math.ceil((new Date(k.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                  const requiredDailyPages = Math.ceil(pagesLeft / daysRemaining);

                  return (
                    <motion.div
                      key={k.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border flex flex-col gap-3 relative overflow-hidden"
                      style={{
                        background: 'var(--app-brand-dim)',
                        borderColor: 'var(--app-brand-border)',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-arabic font-bold text-sm flex items-center gap-1.5" style={{ color: 'var(--app-text)' }}>
                            <Flame className="w-4 h-4 text-amber-500" />
                            {k.title}
                          </h5>
                          <p className="text-xs font-arabic opacity-70 mt-0.5">
                            المتبقي: {pagesLeft} صفحة • مدة الخطة: {k.targetDays} يوماً
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePlan(k.id)}
                          className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                          title="حذف الخطة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-arabic font-bold mb-1">
                          <span>إنجاز الختمة</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ background: 'var(--app-brand-grad)', width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Daily Target & Quick Action */}
                      <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                        <div className="text-xs font-arabic">
                          <span className="opacity-70">ورد اليوم المطلوب: </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {requiredDailyPages} صفحات يومياً
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateProgress(k)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-arabic border hover:bg-black/5 transition-all"
                            style={{ borderColor: 'var(--app-brand-border)' }}
                            title="تحديث التقدم إلى موضع القراءة الحالي"
                          >
                            تحديث بالصفحة {currentPage}
                          </button>

                          <button
                            onClick={() => handleResumeKhatma(k)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-arabic font-bold text-white flex items-center gap-1 shadow-md active:scale-95 transition-all"
                            style={{ background: 'var(--app-brand-grad)' }}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            متابعة الورد
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Create New Plan Mode or Empty State */}
            {(isCreating || activeKhatmas.length === 0) && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-arabic font-bold block mb-1.5 opacity-80">
                    عنوان خطة الختمة
                  </label>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full p-3 rounded-2xl text-xs sm:text-sm font-arabic border focus:outline-none"
                    style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-brand-border)' }}
                    placeholder="مثال: ختمة رمضان المبارك"
                  />
                </div>

                <div>
                  <label className="text-xs font-arabic font-bold block mb-2 opacity-80">
                    اختر المدة المستهدفة لختم الكتاب
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { days: 7, label: 'أسبوع (7 أيام)', desc: 'مكثفة' },
                      { days: 15, label: '15 يوماً', desc: 'سريعة' },
                      { days: 30, label: 'شهر (30 يوماً)', desc: 'متوازنة' },
                      { days: 60, label: 'شهرين (60 يوماً)', desc: 'هادئة' },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        onClick={() => {
                          setSelectedDays(opt.days);
                        }}
                        className="p-2.5 rounded-2xl border text-center font-arabic flex flex-col items-center gap-1 transition-all active:scale-95"
                        style={
                          selectedDays === opt.days
                            ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                            : { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand-border)', color: 'var(--app-text)' }
                        }
                      >
                        <span className="text-xs">{opt.label}</span>
                        <span className="text-[10px] opacity-80">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Summary Calculation */}
                <div
                  className="p-4 rounded-2xl border flex items-center justify-between text-xs font-arabic"
                  style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-surface-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>معدل القراءة اليومي المقترح:</span>
                  </div>
                  <span className="font-bold text-amber-500 text-sm">
                    {Math.ceil((totalPages - currentPage + 1) / Math.max(1, selectedDays))} صفحة / يوم
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleCreatePlan(selectedDays)}
                    className="flex-1 py-3 px-4 rounded-2xl font-arabic text-xs sm:text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                    style={{ background: 'var(--app-brand-grad)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    بدء الختمة الآن
                  </button>

                  {activeKhatmas.length > 0 && (
                    <button
                      onClick={() => setIsCreating(false)}
                      className="py-3 px-4 rounded-2xl font-arabic text-xs font-bold border hover:bg-black/5 transition-all"
                      style={{ borderColor: 'var(--app-surface-border)' }}
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Completed Khatmas Badge Showcase */}
            {completedKhatmas.length > 0 && (
              <div className="pt-4 border-t space-y-2" style={{ borderColor: 'var(--app-divider)' }}>
                <h4 className="text-xs font-arabic font-bold opacity-80 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  الختمات المكتملة والأوسمة المحققة ({completedKhatmas.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {completedKhatmas.map((ck) => (
                    <div
                      key={ck.id}
                      className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-between text-xs font-arabic text-emerald-700 dark:text-emerald-300"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span className="font-bold">{ck.title}</span>
                      </div>
                      <span className="text-[10px] opacity-80">تم الختم بنجاح 🌟</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
