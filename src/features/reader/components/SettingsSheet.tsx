import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useReaderStore } from '../../../store/readerStore';
import { X, Type, Palette, Settings, Volume2, Layout, Maximize } from 'lucide-react';

export const SettingsSheet: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const { preferences, updatePreferences } = useReaderStore();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content 
          className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-2xl z-50 shadow-2xl p-6 overflow-y-auto animate-slide-up focus:outline-none"
          dir="rtl"
        >
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold font-arabic flex items-center gap-2">
              <SettingsIcon /> إعدادات القراءة
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-8">
            {/* Theme Note */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-arabic"
              style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)', color: 'var(--app-brand)' }}>
              <Palette className="w-4 h-4 shrink-0" />
              <span>تغيير سمة التطبيق متاح في الملف الشخصي → سمة التطبيق</span>
            </div>
            {/* Typography */}
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" /> الخط والحجم
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm">حجم الخط</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updatePreferences({ fontSize: Math.max(14, preferences.fontSize - 2) })}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-lg"
                    >-</button>
                    <span className="font-mono w-6 text-center">{preferences.fontSize}</span>
                    <button 
                      onClick={() => updatePreferences({ fontSize: Math.min(36, preferences.fontSize + 2) })}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-lg"
                    >+</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-4">
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
                      className={`py-2 rounded-xl text-xs transition-all active:scale-95 ${
                        preferences.fontFamily === f.id
                          ? 'font-bold shadow-sm'
                          : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                      }`}
                      style={preferences.fontFamily === f.id
                        ? { background: 'var(--app-brand-grad)', color: 'white' }
                        : {}
                      }
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 mt-6">
                  <span className="text-sm">المحاذاة</span>
                  <div className="flex gap-2">
                    {(['right', 'center', 'justify'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => updatePreferences({ textAlign: align })}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          preferences.textAlign === align ? 'bg-brand-100 text-brand-900 font-bold' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'ضبط'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm">هوامش الصفحة</span>
                  <div className="flex gap-2">
                    {(['narrow', 'medium', 'wide'] as const).map((width) => (
                      <button
                        key={width}
                        onClick={() => updatePreferences({ readerWidth: width })}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          preferences.readerWidth === width ? 'bg-brand-100 text-brand-900 font-bold' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {width === 'narrow' ? 'ضيق' : width === 'medium' ? 'متوسط' : 'واسع'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">تباعد الأحرف</span>
                  <div className="flex gap-2">
                    {(['tight', 'normal', 'loose'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        onClick={() => updatePreferences({ letterSpacing: spacing })}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          preferences.letterSpacing === spacing ? 'bg-brand-100 text-brand-900 font-bold' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {spacing === 'tight' ? 'ضيق' : spacing === 'normal' ? 'عادي' : 'واسع'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Layout & Spacing */}
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" /> التنسيق والتباعد
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">تباعد الأسطر</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updatePreferences({ lineHeight: Math.max(1, preferences.lineHeight - 0.2) })}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
                    >-</button>
                    <span className="font-mono w-8 text-center text-sm">{preferences.lineHeight.toFixed(1)}</span>
                    <button 
                      onClick={() => updatePreferences({ lineHeight: Math.min(3, preferences.lineHeight + 0.2) })}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
                    >+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">تباعد الفقرات</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updatePreferences({ paragraphSpacing: Math.max(0.5, preferences.paragraphSpacing - 0.2) })}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
                    >-</button>
                    <span className="font-mono w-8 text-center text-sm">{preferences.paragraphSpacing.toFixed(1)}</span>
                    <button 
                      onClick={() => updatePreferences({ paragraphSpacing: Math.min(4, preferences.paragraphSpacing + 0.2) })}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
                    >+</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Advanced Settings */}
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Maximize className="w-4 h-4" /> خيارات إضافية
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">إخفاء القوائم تلقائياً</span>
                    <span className="text-xs text-gray-500">إخفاء شريط الأدوات العلوي والسفلي عند النقر للقراءة</span>
                  </div>
                  <button 
                    onClick={() => updatePreferences({ autoHideControls: !preferences.autoHideControls })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${preferences.autoHideControls ? 'bg-brand-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.autoHideControls ? 'left-1' : 'right-1'}`} />
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2"><Volume2 className="w-4 h-4 text-brand-500"/> سرعة القراءة الصوتية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">بطيء</span>
                    <input 
                      type="range" 
                      min="0.5" max="2" step="0.1" 
                      value={preferences.ttsRate}
                      onChange={(e) => updatePreferences({ ttsRate: parseFloat(e.target.value) })}
                      className="w-24 accent-brand-500"
                      dir="ltr"
                    />
                    <span className="text-xs text-gray-500">سريع</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const SettingsIcon = () => <Settings className="w-5 h-5" />;
