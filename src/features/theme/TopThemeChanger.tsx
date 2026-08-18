import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Palette, Check, Sun, Moon, Globe } from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import type { ReaderTheme } from '../../types/book';
import { useLanguage } from '../../i18n/LanguageContext';

export interface ThemeOption {
  id: ReaderTheme;
  label: string;
  enLabel: string;
  subLabel: string;
  enSubLabel: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  ring: string;
  icon: string;
  isDark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'paper',
    label: 'ورقي كلاسيكي',
    enLabel: 'Classic Paper',
    subLabel: 'مريح للعين والقراءة المطولة',
    enSubLabel: 'Gentle on the eyes for reading',
    bg: '#fbf6f0',
    surface: '#ffffff',
    border: '#b89685',
    text: '#120b07',
    ring: '#8f5c3d',
    icon: '📜',
    isDark: false,
  },
  {
    id: 'sepia',
    label: 'بني تراثي',
    enLabel: 'Vintage Sepia',
    subLabel: 'أصالة المخطوطات القديمة',
    enSubLabel: 'Authentic manuscript tone',
    bg: '#eee5d3',
    surface: '#faf4e8',
    border: '#bfa37e',
    text: '#1a1008',
    ring: '#85532f',
    icon: '📚',
    isDark: false,
  },
  {
    id: 'white',
    label: 'أبيض ناصع',
    enLabel: 'Pristine White',
    subLabel: 'وضوح فائق وتصميم عصري',
    enSubLabel: 'High clarity modern style',
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#cbd5e1',
    text: '#020617',
    ring: '#704a37',
    icon: '☁️',
    isDark: false,
  },
  {
    id: 'sage',
    label: 'أخضر هادئ',
    enLabel: 'Green Oasis',
    subLabel: 'راحة بصرية وطبيعة خضراء',
    enSubLabel: 'Soothing nature hue',
    bg: '#e2ebdf',
    surface: '#f2f7f0',
    border: '#94b38e',
    text: '#061309',
    ring: '#2a6943',
    icon: '🌿',
    isDark: false,
  },
  {
    id: 'rose',
    label: 'وردي أندلسي',
    enLabel: 'Warm Ruby',
    subLabel: 'طابع شعري دافئ وناعم',
    enSubLabel: 'Poetic warm aesthetics',
    bg: '#fcedea',
    surface: '#fdf4f2',
    border: '#d49b9b',
    text: '#1c0808',
    ring: '#a83c3c',
    icon: '🌸',
    isDark: false,
  },
  {
    id: 'dark',
    label: 'ليلي أسود',
    enLabel: 'Midnight Charcoal',
    subLabel: 'قراءة مريحة في الظلام التام',
    enSubLabel: 'Night reading in dark',
    bg: '#05070a',
    surface: '#0f141d',
    border: '#1f2a3c',
    text: '#f8fafc',
    ring: '#d4935d',
    icon: '🌙',
    isDark: true,
  },
  {
    id: 'midnight',
    label: 'كحلي ليلي',
    enLabel: 'Twilight Sky',
    subLabel: 'سماء صافية وهدوء ليلي',
    enSubLabel: 'Serene deep blue night',
    bg: '#040b14',
    surface: '#081424',
    border: '#163152',
    text: '#f0f9ff',
    ring: '#0284c7',
    icon: '🌌',
    isDark: true,
  },
  {
    id: 'emerald',
    label: 'زمردي ملكي',
    enLabel: 'Royal Emerald',
    subLabel: 'أخضر فاخر وهيبة تراثية',
    enSubLabel: 'Lush royal emerald green',
    bg: '#02120b',
    surface: '#052215',
    border: '#0d472d',
    text: '#ecfdf5',
    ring: '#059669',
    icon: '💎',
    isDark: true,
  },
  {
    id: 'coffee',
    label: 'قهوة عربية',
    enLabel: 'Arabian Coffee',
    subLabel: 'دفء الليالي التراثية',
    enSubLabel: 'Warm heritage roast',
    bg: '#0e0805',
    surface: '#1a100b',
    border: '#382216',
    text: '#fef7ee',
    ring: '#b4632c',
    icon: '☕',
    isDark: true,
  },
  {
    id: 'slate',
    label: 'رمادي فحمي',
    enLabel: 'Indigo Marble',
    subLabel: 'تباين هادئ ومظهر تقني',
    enSubLabel: 'Sleek contrast slate tone',
    bg: '#0b0f15',
    surface: '#131923',
    border: '#243042',
    text: '#f1f5f9',
    ring: '#2563eb',
    icon: '⚡',
    isDark: true,
  },
];

interface TopThemeChangerProps {
  className?: string;
  variant?: 'compact' | 'full' | 'pill';
  showLabel?: boolean;
}

export const TopThemeChanger: React.FC<TopThemeChangerProps> = ({
  className = '',
  variant = 'compact',
  showLabel = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, updatePreferences } = useReaderStore();
  const { language, setLanguage, isRTL, t } = useLanguage();

  const currentTheme = THEME_OPTIONS.find((t) => t.id === preferences.theme) || THEME_OPTIONS[0];
  const themeTitle = isRTL ? currentTheme.label : currentTheme.enLabel;

  const handleSelectTheme = (themeId: ReaderTheme) => {
    updatePreferences({ theme: themeId });
  };

  const handleToggleLightDark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTheme.isDark) {
      updatePreferences({ theme: 'paper' });
    } else {
      updatePreferences({ theme: 'dark' });
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        {variant === 'pill' || showLabel ? (
          <button
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-95 text-xs font-arabic font-bold border cursor-pointer hover:brightness-105 shadow-xs ${className}`}
            style={{
              background: isOpen ? 'var(--app-brand-dim)' : 'var(--app-surface)',
              borderColor: isOpen ? 'var(--app-brand)' : 'var(--app-surface-border)',
              color: 'var(--app-text)',
            }}
            title={t('theme_changer')}
          >
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-2xs"
              style={{
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
              }}
            >
              <span>{currentTheme.icon}</span>
            </div>
            <span className="truncate max-w-20 sm:max-w-none">{themeTitle}</span>
          </button>
        ) : (
          <button
            className={`w-9 h-9 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-90 border cursor-pointer relative shadow-xs hover:brightness-105 shrink-0 ${className}`}
            style={{
              background: isOpen ? 'var(--app-brand-dim)' : 'var(--app-surface)',
              borderColor: isOpen ? 'var(--app-brand)' : 'var(--app-surface-border)',
              color: 'var(--app-brand)',
            }}
            title={`${t('theme_changer')} (${themeTitle})`}
            aria-label={t('theme_changer')}
          >
            <div className="relative flex items-center justify-center">
              <Palette className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border border-black/15 flex items-center justify-center text-[8px] shadow-xs"
                style={{ background: currentTheme.bg }}
              >
                {currentTheme.icon}
              </span>
            </div>
          </button>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-76 sm:w-88 rounded-3xl p-3 sm:p-4 shadow-2xl border backdrop-blur-2xl animate-fade-in focus:outline-none max-h-[85vh] overflow-y-auto custom-scrollbar"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          }}
          sideOffset={8}
          align={isRTL ? 'end' : 'start'}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header with Title & Day/Night Toggle */}
          <div className="flex items-center justify-between pb-3 mb-2.5 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                  {t('theme_changer')}
                </h3>
                <p className="text-[10px] font-arabic font-medium opacity-80" style={{ color: 'var(--app-text-muted)' }}>
                  {isRTL ? 'اختر النمط المناسب لراحتك البصرية' : 'Choose your reading aesthetic'}
                </p>
              </div>
            </div>

            {/* Quick Day / Night Toggle */}
            <button
              onClick={handleToggleLightDark}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-arabic font-bold border transition-all active:scale-95 hover:brightness-105 cursor-pointer shadow-2xs"
              style={{
                background: currentTheme.isDark ? 'rgba(212, 147, 93, 0.15)' : 'rgba(2, 6, 23, 0.08)',
                borderColor: currentTheme.isDark ? 'rgba(212, 147, 93, 0.4)' : 'var(--app-surface-border)',
                color: 'var(--app-brand)',
              }}
              title={currentTheme.isDark ? t('day_mode') : t('night_mode')}
            >
              {currentTheme.isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isRTL ? 'نهاري' : 'Day'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{isRTL ? 'ليلي' : 'Night'}</span>
                </>
              )}
            </button>
          </div>

          {/* Language Switcher Bar */}
          <div
            className="flex items-center justify-between p-2 rounded-2xl border mb-3 text-xs"
            style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: 'var(--app-brand)' }} />
              <span className="font-arabic font-bold text-[11px]" style={{ color: 'var(--app-text)' }}>
                {t('language_toggle')}
              </span>
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-0.5 rounded-lg font-arabic font-bold text-[10px] transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'shadow-xs text-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: language === 'ar' ? 'var(--app-brand-grad)' : 'transparent',
                }}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-0.5 rounded-lg font-sans font-bold text-[10px] transition-all cursor-pointer ${
                  language === 'en'
                    ? 'shadow-xs text-white'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: language === 'en' ? 'var(--app-brand-grad)' : 'transparent',
                }}
              >
                English
              </button>
            </div>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = preferences.theme === theme.id;
              const label = isRTL ? theme.label : theme.enLabel;
              const subLabel = isRTL ? theme.subLabel : theme.enSubLabel;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all duration-150 active:scale-95 relative group cursor-pointer ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                  style={{
                    background: isSelected ? 'var(--app-brand-dim)' : 'var(--app-bg-2)',
                    borderColor: isSelected ? 'var(--app-brand)' : 'var(--app-surface-border)',
                    boxShadow: isSelected ? '0 0 0 1.5px var(--app-brand)' : 'none',
                  }}
                >
                  {/* Theme Swatch Preview */}
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shrink-0 border relative shadow-2xs"
                    style={{
                      background: theme.bg,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  >
                    <span>{theme.icon}</span>
                    {isSelected && (
                      <span
                        className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] shadow"
                        style={{ background: theme.ring }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-3" />
                      </span>
                    )}
                  </div>

                  {/* Theme Info */}
                  <div className="min-w-0 flex-1">
                    <span
                      className="font-arabic font-bold text-[11px] truncate block"
                      style={{ color: isSelected ? 'var(--app-brand)' : 'var(--app-text)' }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[9px] font-arabic opacity-70 block truncate"
                      style={{ color: 'var(--app-text-muted)' }}
                    >
                      {subLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
