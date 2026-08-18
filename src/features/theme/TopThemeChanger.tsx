import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import type { ReaderTheme } from '../../types/book';

export interface ThemeOption {
  id: ReaderTheme;
  label: string;
  subLabel: string;
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
    subLabel: 'مريح للعين والقراءة المطولة',
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
    subLabel: 'أصالة المخطوطات القديمة',
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
    subLabel: 'وضوح فائق وتصميم عصري',
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
    subLabel: 'راحة بصرية وطبيعة خضراء',
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
    subLabel: 'طابع شعري دافئ وناعم',
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
    subLabel: 'قراءة مريحة في الظلام التام',
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
    subLabel: 'سماء صافية وهدوء ليلي',
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
    subLabel: 'أخضر فاخر وهيبة تراثية',
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
    subLabel: 'دفء الليالي التراثية',
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
    subLabel: 'تباين هادئ ومظهر تقني',
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

  const currentTheme = THEME_OPTIONS.find((t) => t.id === preferences.theme) || THEME_OPTIONS[0];

  const handleSelectTheme = (themeId: ReaderTheme) => {
    updatePreferences({ theme: themeId });
  };

  const handleToggleLightDark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTheme.isDark) {
      // Switch to default paper light theme
      updatePreferences({ theme: 'paper' });
    } else {
      // Switch to default dark theme
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
            title="تغيير مظهر ولون السمة"
          >
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-2xs"
              style={{
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
              }}
            >
              {currentTheme.icon}
            </div>
            <span className="truncate max-w-20 sm:max-w-none">{currentTheme.label}</span>
            <Palette className="w-3.5 h-3.5 opacity-60" style={{ color: 'var(--app-brand)' }} />
          </button>
        ) : (
          <button
            className={`w-9 h-9 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-200 active:scale-90 border cursor-pointer relative shadow-xs hover:brightness-105 shrink-0 ${className}`}
            style={{
              background: isOpen ? 'var(--app-brand-dim)' : 'var(--app-surface)',
              borderColor: isOpen ? 'var(--app-brand)' : 'var(--app-surface-border)',
              color: 'var(--app-brand)',
            }}
            title={`تغيير السمة (${currentTheme.label})`}
            aria-label="تغيير سمة التطبيق"
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
          align="end"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                  سمات ومظهر القارئ
                </h3>
                <p className="text-[10px] font-arabic font-medium" style={{ color: 'var(--app-text-muted)' }}>
                  اختر النمط المناسب لراحتك البصرية
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
              title={currentTheme.isDark ? 'التحويل إلى وضع النهار' : 'التحويل إلى وضع الليل'}
            >
              {currentTheme.isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>ليلي</span>
                </>
              )}
            </button>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = preferences.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className="flex items-center gap-2.5 p-2 rounded-2xl border transition-all duration-150 active:scale-95 text-right relative group cursor-pointer"
                  style={{
                    background: isSelected ? 'var(--app-brand-dim)' : 'var(--app-bg-2)',
                    borderColor: isSelected ? theme.ring : 'var(--app-divider)',
                    boxShadow: isSelected ? `0 0 12px ${theme.ring}33` : 'none',
                  }}
                >
                  {/* Theme Color Preview Bubble */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-sm border relative"
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
                    <div className="flex items-center justify-between">
                      <span
                        className="font-arabic font-bold text-[11px] truncate block"
                        style={{ color: isSelected ? 'var(--app-brand)' : 'var(--app-text)' }}
                      >
                        {theme.label}
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-arabic font-medium truncate block opacity-75"
                      style={{ color: 'var(--app-text-muted)' }}
                    >
                      {theme.isDark ? 'داكن' : 'فاتح'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-arabic font-medium" style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text-muted)' }}>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>السمة الحالية: <strong className="font-bold" style={{ color: 'var(--app-brand)' }}>{currentTheme.label}</strong></span>
            </span>
            <span className="opacity-70">10 سمات متناسقة</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
