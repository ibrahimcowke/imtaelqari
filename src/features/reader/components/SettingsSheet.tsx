import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useReaderStore } from '../../../store/readerStore';
import { X, Type, Palette, Settings, Layout, Maximize, Minus, Plus, Check, Globe } from 'lucide-react';
import type { ReaderTheme } from '../../../types/book';
import { useLanguage } from '../../../i18n/LanguageContext';

const THEMES: { id: ReaderTheme; label: string; enLabel: string; bg: string; ring: string; icon: string }[] = [
  { id: 'paper',    label: 'ورقي',        enLabel: 'Paper',     bg: '#fdfcf8', ring: '#a37c6c', icon: '📜' },
  { id: 'white',    label: 'أبيض',        enLabel: 'White',     bg: '#ffffff', ring: '#aaaaaa', icon: '☁️' },
  { id: 'sage',     label: 'أخضر هادئ',   enLabel: 'Sage',      bg: '#e8ece1', ring: '#5a8a5a', icon: '🌿' },
  { id: 'sepia',    label: 'بني تراثي',   enLabel: 'Sepia',     bg: '#f4ecd8', ring: '#8a6040', icon: '📚' },
  { id: 'rose',     label: 'وردي أندلسي', enLabel: 'Rose',      bg: '#fbf4f2', ring: '#c96868', icon: '🌸' },
  { id: 'emerald',  label: 'زمردي ملكي',  enLabel: 'Emerald',   bg: '#081711', ring: '#2ea879', icon: '💎' },
  { id: 'midnight', label: 'كحلي ليلي',   enLabel: 'Midnight',  bg: '#080e1a', ring: '#38bdf8', icon: '🌌' },
  { id: 'coffee',   label: 'قهوة عربية',  enLabel: 'Coffee',    bg: '#140f0c', ring: '#d4a373', icon: '☕' },
  { id: 'slate',    label: 'رمادي فحمي',  enLabel: 'Slate',     bg: '#0f1216', ring: '#58a6ff', icon: '⚡' },
  { id: 'dark',     label: 'ليلي أسود',   enLabel: 'Dark',      bg: '#0f0f0f', ring: '#c8a090', icon: '🌙' },
];

const FONTS = [
  { id: 'Noto Naskh Arabic', name: 'نسخ', enName: 'Naskh', sample: 'بسم الله الرحمن الرحيم' },
  { id: 'Amiri', name: 'أميري', enName: 'Amiri', sample: 'بسم الله الرحمن الرحيم' },
  { id: 'Cairo', name: 'كايرو', enName: 'Cairo', sample: 'بسم الله الرحمن الرحيم' },
  { id: 'Tajawal', name: 'تجوال', enName: 'Tajawal', sample: 'بسم الله الرحمن الرحيم' },
  { id: 'Almarai', name: 'المراعي', enName: 'Almarai', sample: 'بسم الله الرحمن الرحيم' },
];

export const SettingsSheet: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const { preferences, updatePreferences } = useReaderStore();
  const { language, setLanguage, isRTL, dir, t } = useLanguage();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl z-50 shadow-2xl p-6 md:p-8 overflow-y-auto focus:outline-none custom-scrollbar"
          style={{
            background: 'var(--app-bg)',
            color: 'var(--app-text)',
            borderTop: '1px solid var(--app-surface-border)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
          }}
          dir={dir}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold font-arabic flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Settings className="w-5 h-5" />
              </div>
              <span>{t('reader_settings')}</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* 0. Language Selector */}
            <section className="app-surface rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-brand-500" />
                  <h3 className="text-sm font-bold font-arabic" style={{ color: 'var(--app-text)' }}>
                    {t('language_toggle')}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`px-4 py-1.5 rounded-xl font-arabic font-bold text-xs transition-all cursor-pointer ${
                      language === 'ar'
                        ? 'shadow-sm text-white'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: language === 'ar' ? 'var(--app-brand-grad)' : 'transparent',
                    }}
                  >
                    العربية (RTL)
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-1.5 rounded-xl font-sans font-bold text-xs transition-all cursor-pointer ${
                      language === 'en'
                        ? 'shadow-sm text-white'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: language === 'en' ? 'var(--app-brand-grad)' : 'transparent',
                    }}
                  >
                    English (LTR)
                  </button>
                </div>
              </div>
            </section>

            {/* 1. Theme Picker */}
            <section className="app-surface rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold font-arabic" style={{ color: 'var(--app-text)' }}>
                  {isRTL ? 'سمة ولون القارئ (10 سمات متناسقة)' : 'Reader Themes (10 Harmonious Palettes)'}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {THEMES.map((th) => {
                  const isActive = preferences.theme === th.id;
                  const label = isRTL ? th.label : th.enLabel;
                  return (
                    <button
                      key={th.id}
                      onClick={() => updatePreferences({ theme: th.id })}
                      className="flex items-center gap-2 p-2.5 rounded-2xl transition-all active:scale-95 text-right border relative cursor-pointer"
                      style={{
                        background: isActive ? 'var(--app-brand-dim)' : 'transparent',
                        borderColor: isActive ? th.ring : 'var(--app-surface-border)',
                        boxShadow: isActive ? `0 0 12px ${th.ring}44` : 'none',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-sm"
                        style={{ background: th.bg, border: '1px solid rgba(0,0,0,0.1)' }}
                      >
                        {th.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-arabic font-bold block truncate" style={{ color: 'var(--app-text)' }}>
                          {label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: th.ring }}>
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Typography Section */}
            <section className="app-surface rounded-3xl p-5 space-y-5">
              <h3 className="text-sm font-bold font-arabic flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Type className="w-4 h-4 text-brand-500" />
                <span>{t('font_family')}</span>
              </h3>

              {/* Font size */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-arabic font-semibold opacity-80">{t('font_size')}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePreferences({ fontSize: Math.max(14, preferences.fontSize - 2) })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold w-8 text-center text-sm">{preferences.fontSize}px</span>
                  <button
                    onClick={() => updatePreferences({ fontSize: Math.min(36, preferences.fontSize + 2) })}
                    className="w-9 h-9 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <span className="text-xs font-arabic font-semibold opacity-80 block">{t('font_family')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FONTS.map(f => {
                    const isSelected = preferences.fontFamily === f.id;
                    const name = isRTL ? f.name : f.enName;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updatePreferences({ fontFamily: f.id })}
                        className={`p-3 rounded-2xl transition-all active:scale-95 flex items-center justify-between border cursor-pointer ${
                          isRTL ? 'text-right' : 'text-left'
                        }`}
                        style={{
                          background: isSelected ? 'var(--app-brand-dim)' : 'transparent',
                          borderColor: isSelected ? 'var(--app-brand)' : 'var(--app-surface-border)',
                          boxShadow: isSelected ? '0 0 14px var(--app-brand-glow)' : 'none',
                        }}
                      >
                        <div>
                          <div className="text-xs font-bold font-arabic" style={{ color: isSelected ? 'var(--app-brand)' : 'var(--app-text)' }}>
                            {name}
                          </div>
                          <div className="text-xs opacity-75 mt-0.5" style={{ fontFamily: `"${f.id}", sans-serif` }}>
                            «{f.sample}»
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--app-brand)' }}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-arabic font-semibold opacity-80">{t('text_align')}</span>
                <div className="flex gap-2">
                  {(['right', 'center', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updatePreferences({ textAlign: align })}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-arabic font-semibold transition-all active:scale-95 cursor-pointer"
                      style={preferences.textAlign === align
                        ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 2px 8px var(--app-brand-glow)' }
                        : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
                      }
                    >
                      {align === 'right' ? t('align_right') : align === 'center' ? t('align_center') : t('align_justify')}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Spacing & Layout */}
            <section className="app-surface rounded-3xl p-5 space-y-5">
              <h3 className="text-sm font-bold font-arabic flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Layout className="w-4 h-4 text-brand-500" />
                <span>{isRTL ? 'التباعد وعرض الصفحة' : 'Spacing & Layout'}</span>
              </h3>

              {/* Line height */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-arabic font-semibold opacity-80">{t('line_spacing')}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePreferences({ lineHeight: Math.max(1.2, preferences.lineHeight - 0.2) })}
                    className="w-8 h-8 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold w-8 text-center text-xs">{preferences.lineHeight.toFixed(1)}</span>
                  <button
                    onClick={() => updatePreferences({ lineHeight: Math.min(3, preferences.lineHeight + 0.2) })}
                    className="w-8 h-8 flex items-center justify-center rounded-xl app-surface active:scale-95 transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reader Width */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-arabic font-semibold opacity-80">{t('page_width')}</span>
                <div className="flex gap-2">
                  {(['narrow', 'medium', 'wide'] as const).map((width) => (
                    <button
                      key={width}
                      onClick={() => updatePreferences({ readerWidth: width })}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-arabic font-semibold transition-all active:scale-95 cursor-pointer"
                      style={preferences.readerWidth === width
                        ? { background: 'var(--app-brand-grad)', color: 'white', boxShadow: '0 2px 8px var(--app-brand-glow)' }
                        : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)', border: '1px solid var(--app-brand-border)' }
                      }
                    >
                      {width === 'narrow' ? t('width_narrow') : width === 'medium' ? t('width_medium') : t('width_wide')}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Extra options */}
            <section className="app-surface rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold font-arabic flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                <Maximize className="w-4 h-4 text-brand-500" />
                <span>{isRTL ? 'خيارات إضافية' : 'Additional Options'}</span>
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-arabic font-bold block" style={{ color: 'var(--app-text)' }}>
                    {isRTL ? 'إخفاء القوائم تلقائياً' : 'Auto-hide App Bars'}
                  </span>
                  <span className="text-[10px] font-arabic opacity-60">
                    {isRTL ? 'إخفاء الأشرطة العلوية والسفلية للتركيز الكامل أثناء القراءة' : 'Hide top and bottom bars for immersive reading'}
                  </span>
                </div>
                <button
                  onClick={() => updatePreferences({ autoHideControls: !preferences.autoHideControls })}
                  className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 cursor-pointer"
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
