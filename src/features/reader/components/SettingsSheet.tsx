import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useReaderStore } from '../../../store/readerStore';
import { X, Type, Palette, Settings, Layout, Maximize, Minus, Plus } from 'lucide-react';

export const SettingsSheet: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const { preferences, updatePreferences } = useReaderStore();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl z-50 shadow-2xl p-6 md:p-8 overflow-y-auto focus:outline-none custom-scrollbar"
          style={{
            background: 'var(--app-bg)',
            color: 'var(--app-text)',
            borderTop: '1px solid var(--app-surface-border)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold font-arabic flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Settings className="w-5 h-5" />
              </div>
              <span>إعدادات وتخصيص القارئ</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Theme notice */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-arabic"
              style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' }}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span>تغيير سمات وألوان القارئ متاح في شاشة الملف الشخصي لتطبيقها عالمياً.</span>
            </div>

            {/* Typography Section */}
            <section className="app-surface rounded-3xl p-5 space-y-5">
              <h3 className="text-sm font-bold font-arabic flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Type className="w-4 h-4 text-brand-500" />
                <span>حجم ونوع الخط</span>
              </h3>

              {/* Font size */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-arabic font-semibold opacity-80">حجم الخط</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePreferences({ fontSize: Math.max(14, preferences.fontSize - 2) })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold w-8 text-center text-sm">{preferences.fontSize}</span>
                  <button
                    onClick={() => updatePreferences({ fontSize: Math.min(36, preferences.fontSize + 2) })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Noto Naskh Arabic', name: 'نسخ' },
                  { id: 'Amiri', name: 'أميري' },
                  { id: 'Cairo', name: 'كايرو' },
                  { id: 'Tajawal', name: 'تجوال' },
                  { id: 'Almarai', name: 'المراعي' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => updatePreferences({ fontFamily: f.id })}
                    className="py-2.5 px-3 rounded-2xl text-xs font-arabic transition-all active:scale-95 text-center font-semibold"
                    style={preferences.fontFamily === f.id
                      ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 2px 10px var(--app-brand-glow)' }
                      : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
                    }
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* Text Alignment */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-arabic font-semibold opacity-80">محاذاة النص</span>
                <div className="flex gap-2">
                  {(['right', 'center', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updatePreferences({ textAlign: align })}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-arabic font-semibold transition-all active:scale-95"
                      style={preferences.textAlign === align
                        ? { background: 'var(--app-brand-grad)', color: 'white' }
                        : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
                      }
                    >
                      {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'ضبط'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Spacing & Layout */}
            <section className="app-surface rounded-3xl p-5 space-y-5">
              <h3 className="text-sm font-bold font-arabic flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Layout className="w-4 h-4 text-brand-500" />
                <span>التباعد وعرض الصفحة</span>
              </h3>

              {/* Line height */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-arabic font-semibold opacity-80">تباعد الأسطر</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePreferences({ lineHeight: Math.max(1.2, preferences.lineHeight - 0.2) })}
                    className="w-8 h-8 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold w-8 text-center text-xs">{preferences.lineHeight.toFixed(1)}</span>
                  <button
                    onClick={() => updatePreferences({ lineHeight: Math.min(3, preferences.lineHeight + 0.2) })}
                    className="w-8 h-8 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reader Width */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-arabic font-semibold opacity-80">عرض مساحة القراءة</span>
                <div className="flex gap-2">
                  {(['narrow', 'medium', 'wide'] as const).map((width) => (
                    <button
                      key={width}
                      onClick={() => updatePreferences({ readerWidth: width })}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-arabic font-semibold transition-all active:scale-95"
                      style={preferences.readerWidth === width
                        ? { background: 'var(--app-brand-grad)', color: 'white' }
                        : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
                      }
                    >
                      {width === 'narrow' ? 'ضيق' : width === 'medium' ? 'متوسط' : 'واسع'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Extra options */}
            <section className="app-surface rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-arabic flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Maximize className="w-4 h-4 text-brand-500" />
                <span>خيارات إضافية</span>
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-arabic font-bold block" style={{ color: 'var(--app-text)' }}>
                    إخفاء القوائم تلقائياً
                  </span>
                  <span className="text-[10px] font-arabic opacity-60">
                    إخفاء الأشرطة العلوية والسفلية للتركيز الكامل
                  </span>
                </div>
                <button
                  onClick={() => updatePreferences({ autoHideControls: !preferences.autoHideControls })}
                  className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
                  style={{ background: preferences.autoHideControls ? 'var(--app-brand-grad)' : 'var(--app-brand-dim)' }}
                >
                  <span
                    className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-md"
                    style={{ left: preferences.autoHideControls ? '26px' : '2px' }}
                  />
                </button>
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
