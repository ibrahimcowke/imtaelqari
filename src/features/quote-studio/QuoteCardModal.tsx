import React, { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Download, Share2, Sparkles, X, Check,
} from 'lucide-react';

type CardTemplate = 'gold' | 'parchment' | 'emerald' | 'midnight' | 'rose';

const TEMPLATES: { id: CardTemplate; name: string; bg: string; text: string; ring: string }[] = [
  { id: 'gold',      name: 'ذهب ملكي',    bg: '#14110f', text: '#e6c88b', ring: '#d4af37' },
  { id: 'parchment', name: 'مخطوطة عتيقة', bg: '#f4ebd0', text: '#2c1810', ring: '#8b5a2b' },
  { id: 'emerald',   name: 'زمرد أندلسي', bg: '#081c14', text: '#a3e8ca', ring: '#2ea879' },
  { id: 'midnight',  name: 'سماء الليل',   bg: '#0a1128', text: '#c8dcff', ring: '#38bdf8' },
  { id: 'rose',      name: 'وردي دمشقي',  bg: '#fcf3f2', text: '#4a151b', ring: '#c96868' },
];

export const QuoteCardModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteText: string;
  sourceText?: string;
  pageNumber?: number;
}> = ({ open, onOpenChange, quoteText, sourceText = 'كتاب إمتاع القارئ', pageNumber }) => {
  const [template, setTemplate] = useState<CardTemplate>('gold');
  const [fontSize, setFontSize] = useState<number>(36);
  const [fontFamily, setFontFamily] = useState<string>('Amiri');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw Card onto HTML5 Canvas
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1080x1080 High-Res Square Card for Instagram / WhatsApp / X
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Background
    if (template === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1c1714');
      grad.addColorStop(0.5, '#0f0c0a');
      grad.addColorStop(1, '#18120e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gold Outer Border
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Inner Fine Border
      ctx.strokeStyle = 'rgba(212,175,55,0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, width - 140, height - 140);
    } else if (template === 'parchment') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#f9f3e3');
      grad.addColorStop(0.5, '#f3ebd4');
      grad.addColorStop(1, '#e8dcbd');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 8;
      ctx.strokeRect(50, 50, width - 100, height - 100);
      ctx.strokeStyle = 'rgba(139,90,43,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(66, 66, width - 132, height - 132);
    } else if (template === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0d281d');
      grad.addColorStop(0.5, '#071610');
      grad.addColorStop(1, '#0e2b1f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#2ea879';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, width - 100, height - 100);
      ctx.strokeStyle = 'rgba(46,168,121,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(68, 68, width - 136, height - 136);
    } else if (template === 'midnight') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0d1730');
      grad.addColorStop(0.5, '#070b18');
      grad.addColorStop(1, '#111e3d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, width - 100, height - 100);
      ctx.strokeStyle = 'rgba(56,189,248,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(68, 68, width - 136, height - 136);
    } else if (template === 'rose') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#fff5f4');
      grad.addColorStop(0.5, '#faecea');
      grad.addColorStop(1, '#f3ddda');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#c96868';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 50, width - 100, height - 100);
      ctx.strokeStyle = 'rgba(201,104,104,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(68, 68, width - 136, height - 136);
    }

    // 2. Decorative Quotes Symbol « »
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const tConfig = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

    // Top Ornament
    ctx.font = `44px ${fontFamily}, "Amiri", serif`;
    ctx.fillStyle = tConfig.ring;
    ctx.fillText('﷽', width / 2, 140);

    // Decorative Quote Marks
    ctx.font = `60px ${fontFamily}, "Amiri", serif`;
    ctx.fillStyle = tConfig.ring;
    ctx.fillText('« ✦ »', width / 2, 220);

    // 3. Multi-line Quote Text
    ctx.fillStyle = tConfig.text;
    ctx.font = `${fontSize}px "${fontFamily}", "Noto Naskh Arabic", sans-serif`;

    const maxTextWidth = width - 240;
    const words = quoteText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        lines.push(currentLine);
        currentLine = words[n];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Calculate vertical centering
    const lineHeight = fontSize * 1.7;
    const totalTextHeight = lines.length * lineHeight;
    let startY = (height / 2) - (totalTextHeight / 2) + 20;

    lines.forEach((line) => {
      ctx.fillText(line, width / 2, startY);
      startY += lineHeight;
    });

    // 4. Bottom Author Badge & Book Info
    ctx.strokeStyle = tConfig.ring;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, height - 190);
    ctx.lineTo(width / 2 + 120, height - 190);
    ctx.stroke();

    ctx.font = `bold 28px "${fontFamily}", "Noto Naskh Arabic", sans-serif`;
    ctx.fillStyle = tConfig.ring;
    ctx.fillText('إمتاع القارئ بجمال الكلم وروائع الحكم', width / 2, height - 145);

    ctx.font = `22px "${fontFamily}", "Noto Naskh Arabic", sans-serif`;
    ctx.fillStyle = tConfig.text;
    const footerText = `محمد بن سعد النهاري ${pageNumber ? `• ص ${pageNumber}` : ''}`;
    ctx.fillText(footerText, width / 2, height - 105);

  }, [open, template, fontSize, fontFamily, quoteText, sourceText, pageNumber]);

  // Download Action
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `إمتاع_القارئ_اقتباس_${Date.now()}.png`;
    a.click();
  };

  // Web Share API
  const shareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'quote.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'إمتاع القارئ بجمال الكلم',
            text: `«${quoteText}»\n— كتاب إمتاع القارئ`,
          });
        } catch {
          downloadImage();
        }
      } else if (navigator.share) {
        navigator.share({
          title: 'إمتاع القارئ بجمال الكلم',
          text: `«${quoteText}»\n— كتاب إمتاع القارئ`,
        }).catch(() => downloadImage());
      } else {
        downloadImage();
      }
    }, 'image/png');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl z-50 p-6 shadow-2xl focus:outline-none max-h-[95vh] overflow-y-auto custom-scrollbar"
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold font-arabic">
                  استوديو بطاقات الاقتباسات
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  صمم بطاقة أدبية فائقة الجودة للمشاركة والتحميل
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Live Canvas Preview */}
          <div className="flex justify-center mb-5">
            <div className="w-full max-w-85 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-black/10">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Template Selector */}
          <div className="mb-4">
            <label className="text-xs font-arabic font-bold uppercase tracking-wider block mb-2 opacity-70">
              قالب التصميم
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TEMPLATES.map((t) => {
                const isActive = template === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all active:scale-95"
                    style={{
                      background: isActive ? 'var(--app-brand-dim)' : 'transparent',
                      border: isActive ? `2px solid ${t.ring}` : '2px solid transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl relative flex items-center justify-center shadow-sm"
                      style={{ background: t.bg, border: `1px solid ${t.ring}` }}
                    >
                      {isActive && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-[10px] font-arabic font-medium truncate max-w-full">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Font size */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-xs font-arabic font-bold block mb-1.5 opacity-70">نوع الخط</label>
              <div className="flex gap-1.5">
                {['Amiri', 'Noto Naskh Arabic', 'Cairo', 'Tajawal'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFontFamily(f)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-arabic transition-all"
                    style={fontFamily === f
                      ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                      : { background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }
                    }
                  >
                    {f === 'Amiri' ? 'أميري' : f === 'Noto Naskh Arabic' ? 'نسخ' : f === 'Cairo' ? 'كايرو' : 'تجوال'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-arabic font-bold opacity-70">
                <span>حجم النص</span>
                <span className="font-mono">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={26}
                max={50}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                style={{ accentColor: 'var(--app-brand)' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={shareImage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-sm font-bold shadow-md transition-all active:scale-95"
              style={{ background: 'var(--app-brand-grad)', color: 'white' }}
            >
              <Share2 className="w-4 h-4" />
              مشاركة البطاقة
            </button>

            <button
              onClick={downloadImage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-sm font-bold border transition-all active:scale-95"
              style={{
                background: 'var(--app-brand-dim)',
                borderColor: 'var(--app-brand-border)',
                color: 'var(--app-brand)',
              }}
            >
              <Download className="w-4 h-4" />
              تحميل صورة PNG
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
