import React from 'react';
import { Type } from 'lucide-react';

export const ReaderModeToggle: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  // Only text mode is shown — scan/compare removed per user request
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-arabic"
      style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(163,124,108,0.08)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(163,124,108,0.15)',
        color: isDark ? '#e0cec7' : '#8c6b5d',
      }}
    >
      <Type className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? '#d2bab0' : '#a37c6c' }} />
      <span className="text-xs font-medium hidden sm:inline">وضع النص</span>
    </div>
  );
};

