import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import {
  Download, Share2, Sparkles, X, Check, Copy, Type,
  Palette, Edit3, Smartphone, Square, Monitor,
  Sliders, RefreshCw, CheckCircle2, BookOpen, ChevronRight, ChevronLeft,
  Search, FileText, List, RotateCcw
} from 'lucide-react';
import { bookDataService } from '../../data/service';
import { useReaderStore } from '../../store/readerStore';

export type CardRatio = '1:1' | '9:16' | '4:5' | '16:9';
export type CardTemplate =
  | 'gold'
  | 'parchment'
  | 'emerald'
  | 'midnight'
  | 'ruby'
  | 'marble'
  | 'terracotta'
  | 'obsidian';

export type HeaderOrnament = 'bismillah' | 'stars' | 'rub-el-hizb' | 'fleuron' | 'royal' | 'none';
export type FrameStyle = 'royal' | 'minimal' | 'vintage' | 'none';
export type TextAlign = 'center' | 'right';

interface TemplateConfig {
  id: CardTemplate;
  name: string;
  category: 'dark' | 'light';
  bgGrad: [string, string, string];
  textColor: string;
  accentColor: string;
  subtextColor: string;
  borderInner: string;
  glowColor: string;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'gold',
    name: 'ذهب ملكي فاخر',
    category: 'dark',
    bgGrad: ['#1c1714', '#0d0a08', '#1a130f'],
    textColor: '#f5e6c8',
    accentColor: '#d4af37',
    subtextColor: '#c4a77d',
    borderInner: 'rgba(212, 175, 55, 0.35)',
    glowColor: 'rgba(212, 175, 55, 0.15)',
  },
  {
    id: 'parchment',
    name: 'مخطوطة أثرية عتيقة',
    category: 'light',
    bgGrad: ['#faf4e6', '#f2e8cf', '#e6d7b9'],
    textColor: '#2a1810',
    accentColor: '#8b5a2b',
    subtextColor: '#6e4823',
    borderInner: 'rgba(139, 90, 43, 0.3)',
    glowColor: 'rgba(139, 90, 43, 0.08)',
  },
  {
    id: 'emerald',
    name: 'زمرد أندلسي ملكي',
    category: 'dark',
    bgGrad: ['#0a2218', '#05130d', '#0d2b1f'],
    textColor: '#d4f7e6',
    accentColor: '#34d399',
    subtextColor: '#86efac',
    borderInner: 'rgba(52, 211, 153, 0.35)',
    glowColor: 'rgba(52, 211, 153, 0.15)',
  },
  {
    id: 'midnight',
    name: 'سماء الليل الكحلية',
    category: 'dark',
    bgGrad: ['#0d1b2a', '#060b14', '#112238'],
    textColor: '#e0f2fe',
    accentColor: '#38bdf8',
    subtextColor: '#93c5fd',
    borderInner: 'rgba(56, 189, 248, 0.35)',
    glowColor: 'rgba(56, 189, 248, 0.15)',
  },
  {
    id: 'ruby',
    name: 'عقيق دمشقي مخملي',
    category: 'dark',
    bgGrad: ['#28090d', '#130305', '#330c11'],
    textColor: '#ffe4e6',
    accentColor: '#fb7185',
    subtextColor: '#fda4af',
    borderInner: 'rgba(251, 113, 133, 0.35)',
    glowColor: 'rgba(251, 113, 133, 0.15)',
  },
  {
    id: 'marble',
    name: 'رخام أبيض كلاسيكي',
    category: 'light',
    bgGrad: ['#ffffff', '#f8fafc', '#f1f5f9'],
    textColor: '#0f172a',
    accentColor: '#475569',
    subtextColor: '#64748b',
    borderInner: 'rgba(71, 85, 105, 0.25)',
    glowColor: 'rgba(0, 0, 0, 0.04)',
  },
  {
    id: 'terracotta',
    name: 'كثبان الصحراء والصلصال',
    category: 'light',
    bgGrad: ['#fdf6ee', '#f8ebd9', '#ebd5bb'],
    textColor: '#3a2012',
    accentColor: '#c26d38',
    subtextColor: '#9c5428',
    borderInner: 'rgba(194, 109, 56, 0.3)',
    glowColor: 'rgba(194, 109, 56, 0.08)',
  },
  {
    id: 'obsidian',
    name: 'فحم وألماس ناصع',
    category: 'dark',
    bgGrad: ['#121214', '#080809', '#141416'],
    textColor: '#ffffff',
    accentColor: '#e2e8f0',
    subtextColor: '#94a3b8',
    borderInner: 'rgba(226, 232, 240, 0.3)',
    glowColor: 'rgba(255, 255, 255, 0.1)',
  },
];

const FONTS = [
  { id: 'Amiri', name: 'أميري تراثي' },
  { id: 'Noto Naskh Arabic', name: 'نسخ واضح' },
  { id: 'Cairo', name: 'كايرو هندسي' },
  { id: 'Tajawal', name: 'تجوال عصري' },
  { id: 'Almarai', name: 'المراعي حديث' },
];

const ORNAMENTS: { id: HeaderOrnament; name: string; symbol: string }[] = [
  { id: 'bismillah', name: 'البسملة الشريفة', symbol: '﷽' },
  { id: 'stars', name: 'نجمة كلاسيكية', symbol: '« ✦ »' },
  { id: 'rub-el-hizb', name: 'الربع القرآني', symbol: '۞' },
  { id: 'fleuron', name: 'زهرة مورقة', symbol: '❦' },
  { id: 'royal', name: 'شارة ملكية', symbol: '⚜' },
  { id: 'none', name: 'بدون زخرفة', symbol: '—' },
];

const RATIO_CONFIG: Record<CardRatio, { width: number; height: number; label: string; icon: any }> = {
  '1:1': { width: 1080, height: 1080, label: 'مربع (1:1)', icon: Square },
  '9:16': { width: 1080, height: 1920, label: 'قصة / ريلز (9:16)', icon: Smartphone },
  '4:5': { width: 1080, height: 1350, label: 'منشور إنستغرام (4:5)', icon: Square },
  '16:9': { width: 1920, height: 1080, label: 'عرضي / لاندسكيب (16:9)', icon: Monitor },
};

export const QuoteCardModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteText?: string;
  sourceText?: string;
  pageNumber?: number;
}> = ({ open, onOpenChange, quoteText: initialQuote = '', sourceText = 'كتاب إمتاع القارئ', pageNumber }) => {
  const readerCurrentPage = useReaderStore((state) => state.currentPage);

  // Tabs & Customization State
  const [activeTab, setActiveTab] = useState<'style' | 'page' | 'text' | 'decor'>('page');
  const [template, setTemplate] = useState<CardTemplate>('gold');
  const [ratio, setRatio] = useState<CardRatio>('1:1');
  const [fontSize, setFontSize] = useState<number>(38);
  const [lineHeightMult, setLineHeightMult] = useState<number>(1.75);
  const [fontFamily, setFontFamily] = useState<string>('Amiri');
  const [textAlign, setTextAlign] = useState<TextAlign>('center');
  const [headerOrnament, setHeaderOrnament] = useState<HeaderOrnament>('bismillah');
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('royal');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showAuthorBadge, setShowAuthorBadge] = useState<boolean>(true);
  const [quoteMarks, setQuoteMarks] = useState<boolean>(true);

  // Active reading page navigation state
  const [readingPage, setReadingPage] = useState<number>(pageNumber || readerCurrentPage || 1);
  const totalPages = useMemo(() => bookDataService.getPages().length || 174, []);
  const activePageData = useMemo(() => bookDataService.getPage(readingPage), [readingPage]);

  // Page selection extraction mode & filters
  const [pageExtractionMode, setPageExtractionMode] = useState<'paragraphs' | 'sentences' | 'full'>('paragraphs');
  const [pageSearchQuery, setPageSearchQuery] = useState<string>('');
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // Extract chapters for quick navigation dropdown
  const chaptersList = useMemo(() => {
    const pages = bookDataService.getPages();
    return pages
      .filter((p) => p.title && p.title.length > 3 && !p.title.startsWith('صفحة'))
      .map((p) => ({ page: p.page, title: p.title }));
  }, []);

  // Intelligent Sentence & Wisdom Extractor for the active page
  const pageSentences = useMemo(() => {
    if (!activePageData?.display_text) return [];
    const raw = activePageData.display_text;
    const splitRegex = /[.\n!؟؛]+/;
    const sentences = raw
      .split(splitRegex)
      .map((s) => s.replace(/^[«\s\-"•]+|[»\s\-"•]+$/g, '').trim())
      .filter((s) => s.length >= 15 && s.length <= 260);
    return sentences;
  }, [activePageData]);

  // Editable text & metadata
  const [editableQuote, setEditableQuote] = useState<string>(initialQuote);
  const [customAuthor, setCustomAuthor] = useState<string>('محمد بن سعد النهاري');
  const [customSource, setCustomSource] = useState<string>(sourceText);
  const [customPage, setCustomPage] = useState<string>(pageNumber ? `${pageNumber}` : `${readingPage}`);

  // Feedback states
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize when modal opens or initial props change
  useEffect(() => {
    if (open) {
      const pageToUse = pageNumber || readerCurrentPage || 1;
      setReadingPage(pageToUse);
      setJumpPageInput(`${pageToUse}`);

      if (initialQuote && initialQuote.trim().length > 0) {
        setEditableQuote(initialQuote);
      } else {
        const p = bookDataService.getPage(pageToUse);
        const excerpt = p?.blocks?.[0]?.text || p?.display_text?.slice(0, 240) || '';
        setEditableQuote(excerpt);
      }

      setCustomSource(sourceText || bookDataService.getPage(pageToUse)?.title || 'كتاب إمتاع القارئ');
      setCustomPage(`${pageToUse}`);
    }
  }, [open, initialQuote, sourceText, pageNumber, readerCurrentPage]);

  // Helper to select a paragraph from the current page
  const handleSelectParagraph = (text: string, title?: string) => {
    setEditableQuote(text);
    if (title) setCustomSource(title);
    setCustomPage(`${readingPage}`);

    // Intelligent auto-font size adjustment based on text length
    const len = text.length;
    if (len < 60) setFontSize(46);
    else if (len < 130) setFontSize(40);
    else if (len < 220) setFontSize(34);
    else if (len < 320) setFontSize(28);
    else setFontSize(24);
  };

  // Helper to navigate page within Quote Studio
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setReadingPage(newPage);
    setJumpPageInput(`${newPage}`);
    const p = bookDataService.getPage(newPage);
    if (p) {
      setCustomPage(`${newPage}`);
      if (p.title) setCustomSource(p.title);
      const firstBlock = p.blocks?.[0]?.text || p.display_text.slice(0, 220);
      if (firstBlock) {
        handleSelectParagraph(firstBlock, p.title);
      }
    }
  };

  // Render Canvas Function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = RATIO_CONFIG[ratio];
    canvas.width = width;
    canvas.height = height;

    const t = TEMPLATES.find((item) => item.id === template) || TEMPLATES[0];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, t.bgGrad[0]);
    bgGrad.addColorStop(0.5, t.bgGrad[1]);
    bgGrad.addColorStop(1, t.bgGrad[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glow in center
    const radialGlow = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      Math.max(width, height) / 1.5
    );
    radialGlow.addColorStop(0, t.glowColor);
    radialGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Frames and Borders
    const padding = ratio === '9:16' ? 70 : 60;
    const innerPad = padding + 20;

    if (frameStyle === 'royal') {
      // Outer Solid Accent Frame
      ctx.strokeStyle = t.accentColor;
      ctx.lineWidth = 5;
      ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

      // Inner Fine Frame
      ctx.strokeStyle = t.borderInner;
      ctx.lineWidth = 2;
      ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);

      // Arabesque Corner Ornaments
      const cornerSize = 40;
      const corners = [
        { x: innerPad, y: innerPad, dx: 1, dy: 1 },
        { x: width - innerPad, y: innerPad, dx: -1, dy: 1 },
        { x: innerPad, y: height - innerPad, dx: 1, dy: -1 },
        { x: width - innerPad, y: height - innerPad, dx: -1, dy: -1 },
      ];

      ctx.fillStyle = t.accentColor;
      ctx.strokeStyle = t.accentColor;
      ctx.lineWidth = 2.5;

      corners.forEach(({ x, y, dx, dy }) => {
        ctx.beginPath();
        ctx.moveTo(x + dx * 8, y);
        ctx.lineTo(x + dx * cornerSize, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + dy * 8);
        ctx.lineTo(x, y + dy * cornerSize);
        ctx.stroke();

        // Little diamond at inner junction
        ctx.beginPath();
        const cx = x + dx * 14;
        const cy = y + dy * 14;
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 4, cy);
        ctx.closePath();
        ctx.fill();
      });
    } else if (frameStyle === 'minimal') {
      ctx.strokeStyle = t.accentColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
    } else if (frameStyle === 'vintage') {
      ctx.strokeStyle = t.accentColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
      ctx.strokeStyle = t.borderInner;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padding + 8, padding + 8, width - (padding + 8) * 2, height - (padding + 8) * 2);
      ctx.strokeRect(padding + 16, padding + 16, width - (padding + 16) * 2, height - (padding + 16) * 2);
    }

    // 3. Header Section (Top Ornament)
    let headerY = ratio === '9:16' ? 220 : 150;
    if (headerOrnament !== 'none') {
      const ornConfig = ORNAMENTS.find((o) => o.id === headerOrnament);
      if (ornConfig && ornConfig.id !== 'none') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = t.accentColor;

        if (headerOrnament === 'bismillah') {
          ctx.font = `52px "${fontFamily}", "Amiri", serif`;
          ctx.fillText('﷽', width / 2, headerY);
          headerY += 60;
        } else if (headerOrnament === 'stars') {
          ctx.font = `40px "${fontFamily}", "Amiri", serif`;
          ctx.fillText('« ✦ ✦ ✦ »', width / 2, headerY);
          headerY += 50;
        } else if (headerOrnament === 'rub-el-hizb') {
          ctx.font = `44px "${fontFamily}", "Amiri", serif`;
          ctx.fillText('۞ ۞ ۞', width / 2, headerY);
          headerY += 50;
        } else {
          ctx.font = `42px "${fontFamily}", "Amiri", serif`;
          ctx.fillText(ornConfig.symbol, width / 2, headerY);
          headerY += 50;
        }
      }
    }

    // 4. Footer Section (Branding & Author)
    const footerBaseY = height - (ratio === '9:16' ? 190 : 130);

    if (showAuthorBadge) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Decorative divider line above footer
      ctx.strokeStyle = t.accentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const divWidth = Math.min(width * 0.4, 280);
      ctx.moveTo(width / 2 - divWidth, footerBaseY - 60);
      ctx.lineTo(width / 2 - 20, footerBaseY - 60);
      ctx.moveTo(width / 2 + 20, footerBaseY - 60);
      ctx.lineTo(width / 2 + divWidth, footerBaseY - 60);
      ctx.stroke();

      // Center diamond on divider
      ctx.fillStyle = t.accentColor;
      ctx.beginPath();
      ctx.moveTo(width / 2, footerBaseY - 65);
      ctx.lineTo(width / 2 + 6, footerBaseY - 60);
      ctx.lineTo(width / 2, footerBaseY - 55);
      ctx.lineTo(width / 2 - 6, footerBaseY - 60);
      ctx.closePath();
      ctx.fill();

      // Book Title / Chapter
      if (customSource) {
        ctx.font = `bold 26px "${fontFamily}", "Noto Naskh Arabic", sans-serif`;
        ctx.fillStyle = t.accentColor;
        ctx.fillText(customSource, width / 2, footerBaseY - 24);
      }

      // Author & Page
      const authorTextParts = [];
      if (customAuthor) authorTextParts.push(customAuthor);
      if (customPage) authorTextParts.push(`ص ${customPage}`);
      const authorFullText = authorTextParts.join('  •  ');

      if (authorFullText) {
        ctx.font = `20px "${fontFamily}", "Noto Naskh Arabic", sans-serif`;
        ctx.fillStyle = t.subtextColor;
        ctx.fillText(authorFullText, width / 2, footerBaseY + 14);
      }
    }

    // Watermark at very bottom
    if (showWatermark) {
      ctx.textAlign = 'center';
      ctx.font = `14px "${fontFamily}", "Cairo", sans-serif`;
      ctx.fillStyle = t.subtextColor;
      ctx.globalAlpha = 0.6;
      ctx.fillText('تطبيق إمتاع القارئ', width / 2, height - (ratio === '9:16' ? 45 : 30));
      ctx.globalAlpha = 1.0;
    }

    // 5. Quote Text Formatting & Multi-line Flow
    const rawQuote = (editableQuote || '').trim();
    const quoteContent = quoteMarks && rawQuote ? `« ${rawQuote} »` : rawQuote;

    const maxTextWidth = width - (padding * 2 + 120);
    const availableTop = headerY + 20;
    const availableBottom = showAuthorBadge ? footerBaseY - 90 : height - padding - 40;
    const availableHeight = availableBottom - availableTop;

    ctx.fillStyle = t.textColor;
    ctx.font = `${fontSize}px "${fontFamily}", "Noto Naskh Arabic", sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    // Word Wrap Algorithm supporting hard breaks
    const rawParagraphs = quoteContent.split('\n');
    const lines: string[] = [];

    rawParagraphs.forEach((para) => {
      const words = para.split(' ').filter(Boolean);
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
      if (currentLine) {
        lines.push(currentLine);
      }
    });

    const lineHeight = fontSize * lineHeightMult;
    const totalTextHeight = lines.length * lineHeight;

    // Centered Y Position in the available content bounding box
    let startY = availableTop + (availableHeight - totalTextHeight) / 2 + lineHeight / 2;

    if (startY - lineHeight / 2 < availableTop) {
      startY = availableTop + lineHeight / 2;
    }

    const textX = textAlign === 'center' ? width / 2 : width - padding - 80;

    lines.forEach((line) => {
      ctx.fillText(line, textX, startY);
      startY += lineHeight;
    });
  }, [
    ratio,
    template,
    fontSize,
    lineHeightMult,
    fontFamily,
    textAlign,
    headerOrnament,
    frameStyle,
    showWatermark,
    showAuthorBadge,
    quoteMarks,
    editableQuote,
    customAuthor,
    customSource,
    customPage,
  ]);

  // Re-draw canvas on any change
  useEffect(() => {
    if (open) {
      const timer = setTimeout(renderCanvas, 40);
      return () => clearTimeout(timer);
    }
  }, [open, renderCanvas]);

  // Download / Save Card to Device
  const downloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    const fileName = `imta_quote_p${readingPage}_${Date.now()}.png`;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: customSource || 'إمتاع القارئ',
          text: `«${editableQuote}»\n— ${customSource} • ${customAuthor} (ص ${customPage})`,
          url: savedFile.uri,
          dialogTitle: 'حفظ أو مشاركة بطاقة الاقتباس',
        });
      } else {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `إمتاع_القارئ_صفحة_${readingPage}_${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        }, 'image/png');
      }

      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (err) {
      console.warn('Native save error, running fallback:', err);
      const url = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = url;
      a.download = `إمتاع_القارئ_اقتباس_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  // Copy Image to Clipboard
  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2500);
        } else {
          await navigator.clipboard.writeText(`«${editableQuote}»\n— ${customSource} • ${customAuthor} (ص ${customPage})`);
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 2500);
        }
      } catch (err) {
        console.warn('Clipboard write error:', err);
        downloadImage();
      }
    }, 'image/png');
  };

  // Share Card via Native or Web Share API
  const shareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const fileName = `imta_quote_share_${Date.now()}.png`;

      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: customSource || 'إمتاع القارئ',
          text: `«${editableQuote}»\n— ${customSource} • ${customAuthor} (ص ${customPage})`,
          url: savedFile.uri,
          dialogTitle: 'مشاركة بطاقة الاقتباس',
        });
      } else if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'imta-quote.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: customSource || 'إمتاع القارئ',
              text: `«${editableQuote}»\n— ${customSource} • ${customAuthor} (ص ${customPage})`,
            });
          } else {
            await navigator.share({
              title: customSource || 'إمتاع القارئ',
              text: `«${editableQuote}»\n— ${customSource} • ${customAuthor} (ص ${customPage})`,
            });
          }
        }, 'image/png');
      } else {
        await downloadImage();
      }
    } catch {
      await downloadImage();
    }
  };

  // Reset to original
  const handleReset = () => {
    const p = bookDataService.getPage(readingPage);
    const excerpt = p?.blocks?.[0]?.text || p?.display_text?.slice(0, 240) || initialQuote;
    setEditableQuote(excerpt);
    setFontSize(38);
    setLineHeightMult(1.75);
    setFontFamily('Amiri');
    setTextAlign('center');
    setHeaderOrnament('bismillah');
    setFrameStyle('royal');
    setQuoteMarks(true);
    setCustomPage(`${readingPage}`);
    if (p?.title) setCustomSource(p.title);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl z-50 p-0 shadow-2xl focus:outline-none max-h-[96vh] flex flex-col overflow-hidden border"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header Bar */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b shrink-0"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  استوديو بطاقات الاقتباسات الفاخرة
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-arabic"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                  >
                    ص {readingPage}
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70 truncate max-w-60 sm:max-w-md">
                  {activePageData?.title || 'مقتطفات وتصميم بطاقات احترافية للنشر'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                title="إعادة ضبط الافتراضي"
                className="p-2 rounded-xl text-xs font-arabic opacity-70 hover:opacity-100 hover:bg-black/5 active:scale-95 transition-all flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">استعادة</span>
              </button>
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all opacity-80 hover:opacity-100">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Main Modal Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto custom-scrollbar flex-1 min-h-0">
            {/* Left/Top: Live Canvas Preview Area */}
            <div
              className="lg:col-span-6 p-4 sm:p-6 flex flex-col items-center justify-center bg-black/5 border-b lg:border-b-0 lg:border-l relative min-h-80"
              style={{ borderColor: 'var(--app-divider)' }}
            >
              {/* Ratio Selector Pills */}
              <div
                className="flex items-center gap-1 p-1 rounded-2xl mb-4 shadow-sm border"
                style={{
                  background: 'var(--app-surface)',
                  borderColor: 'var(--app-surface-border)',
                }}
              >
                {(['1:1', '9:16', '4:5', '16:9'] as CardRatio[]).map((r) => {
                  const Icon = RATIO_CONFIG[r].icon;
                  const isActive = ratio === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-arabic font-medium transition-all active:scale-95"
                      style={
                        isActive
                          ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                          : { color: 'var(--app-text)', opacity: 0.8 }
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{r}</span>
                    </button>
                  );
                })}
              </div>

              {/* Canvas Container with dynamic Aspect Ratio */}
              <div
                className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 flex items-center justify-center"
                style={{
                  aspectRatio:
                    ratio === '1:1'
                      ? '1/1'
                      : ratio === '9:16'
                      ? '9/16'
                      : ratio === '4:5'
                      ? '4/5'
                      : '16/9',
                  maxHeight: ratio === '9:16' ? '400px' : '360px',
                  borderColor: 'var(--app-surface-border)',
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain select-none"
                  style={{ display: 'block' }}
                />
              </div>

              {/* Toast Feedback */}
              {copiedToast && (
                <div className="absolute bottom-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-arabic font-bold shadow-xl animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  تم نسخ البطاقة بنجاح إلى الحافظة!
                </div>
              )}
            </div>

            {/* Right/Bottom: Controls & Customization Studio */}
            <div className="lg:col-span-6 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Control Category Navigation Tabs */}
                <div
                  className="flex rounded-2xl p-1 mb-5 border gap-1"
                  style={{
                    background: 'var(--app-brand-dim)',
                    borderColor: 'var(--app-brand-border)',
                  }}
                >
                  <button
                    onClick={() => setActiveTab('page')}
                    className="flex-1 py-2 rounded-xl text-xs font-arabic font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={
                      activeTab === 'page'
                        ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
                        : { opacity: 0.7 }
                    }
                  >
                    <BookOpen className="w-4 h-4" />
                    الصفحة المقروءة
                  </button>

                  <button
                    onClick={() => setActiveTab('style')}
                    className="flex-1 py-2 rounded-xl text-xs font-arabic font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={
                      activeTab === 'style'
                        ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
                        : { opacity: 0.7 }
                    }
                  >
                    <Palette className="w-4 h-4" />
                    المظهر
                  </button>

                  <button
                    onClick={() => setActiveTab('text')}
                    className="flex-1 py-2 rounded-xl text-xs font-arabic font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={
                      activeTab === 'text'
                        ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
                        : { opacity: 0.7 }
                    }
                  >
                    <Type className="w-4 h-4" />
                    الخط
                  </button>

                  <button
                    onClick={() => setActiveTab('decor')}
                    className="flex-1 py-2 rounded-xl text-xs font-arabic font-bold flex items-center justify-center gap-1.5 transition-all"
                    style={
                      activeTab === 'decor'
                        ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
                        : { opacity: 0.7 }
                    }
                  >
                    <Sliders className="w-4 h-4" />
                    الزخارف
                  </button>
                </div>

                {/* TAB 0: CURRENT READING PAGE (محتوى وتصفح واختيار الصفحة المقروءة) */}
                {activeTab === 'page' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Active Reading Page Stepper & Selector */}
                    <div
                      className="p-3.5 rounded-2xl border flex flex-col gap-3 shadow-xs"
                      style={{
                        background: 'var(--app-brand-dim)',
                        borderColor: 'var(--app-brand-border)',
                      }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" style={{ color: 'var(--app-brand)' }} />
                          <span className="text-xs font-arabic font-bold" style={{ color: 'var(--app-brand)' }}>
                            تصفح واقتباس صفحات الكتاب
                          </span>
                        </div>

                        {/* Return to Reader Current Page button if navigated away */}
                        {readingPage !== (readerCurrentPage || 1) && (
                          <button
                            onClick={() => handlePageChange(readerCurrentPage || 1)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-arabic font-bold transition-all border active:scale-95 shadow-xs cursor-pointer"
                            style={{
                              background: 'var(--app-brand-grad)',
                              color: 'white',
                              borderColor: 'transparent',
                            }}
                            title="العودة فوراً إلى الصفحة المفتوحة حالياً في شاشة القراءة"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>العودة لصفحة القراءة (ص {readerCurrentPage})</span>
                          </button>
                        )}
                      </div>

                      {/* Stepper & Direct Page Jump */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => handlePageChange(readingPage - 1)}
                          disabled={readingPage <= 1}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-arabic font-bold transition-all border disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                          style={{
                            background: 'var(--app-surface)',
                            borderColor: 'var(--app-surface-border)',
                            color: 'var(--app-text)',
                          }}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>السابقة</span>
                        </button>

                        {/* Fast Chapter Selection Dropdown */}
                        <div className="flex-1 min-w-36">
                          <select
                            value={readingPage}
                            onChange={(e) => handlePageChange(Number(e.target.value))}
                            className="w-full text-xs font-arabic font-bold py-1.5 px-2.5 rounded-xl border bg-transparent text-center truncate cursor-pointer focus:outline-none"
                            style={{
                              background: 'var(--app-surface)',
                              borderColor: 'var(--app-surface-border)',
                              color: 'var(--app-text)',
                            }}
                          >
                            {chaptersList.map((ch) => (
                              <option key={ch.page} value={ch.page} className="text-black bg-white dark:bg-zinc-900 dark:text-white">
                                ص {ch.page} • {ch.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Direct Jump Input */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={jumpPageInput}
                            onChange={(e) => setJumpPageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = parseInt(jumpPageInput, 10);
                                if (!isNaN(val)) handlePageChange(val);
                              }
                            }}
                            className="w-14 py-1.5 px-1.5 text-center text-xs font-mono font-bold rounded-xl border focus:outline-none"
                            style={{
                              background: 'var(--app-surface)',
                              borderColor: 'var(--app-surface-border)',
                              color: 'var(--app-text)',
                            }}
                            placeholder="رقم"
                          />
                          <button
                            onClick={() => {
                              const val = parseInt(jumpPageInput, 10);
                              if (!isNaN(val)) handlePageChange(val);
                            }}
                            className="px-2 py-1.5 rounded-xl text-xs font-arabic font-bold border active:scale-95 cursor-pointer"
                            style={{
                              background: 'var(--app-surface)',
                              borderColor: 'var(--app-surface-border)',
                              color: 'var(--app-brand)',
                            }}
                          >
                            انتقال
                          </button>
                        </div>

                        <button
                          onClick={() => handlePageChange(readingPage + 1)}
                          disabled={readingPage >= totalPages}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-arabic font-bold transition-all border disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                          style={{
                            background: 'var(--app-surface)',
                            borderColor: 'var(--app-surface-border)',
                            color: 'var(--app-text)',
                          }}
                        >
                          <span>التالية</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Extraction Mode Segmented Control */}
                    <div className="flex items-center justify-between gap-1 p-1 rounded-2xl border" style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-divider)' }}>
                      <button
                        onClick={() => setPageExtractionMode('paragraphs')}
                        className="flex-1 py-1.5 rounded-xl text-xs font-arabic font-bold transition-all flex items-center justify-center gap-1"
                        style={
                          pageExtractionMode === 'paragraphs'
                            ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }
                            : { opacity: 0.7, color: 'var(--app-text-muted)' }
                        }
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>فقرات الصفحة ({activePageData?.blocks?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => setPageExtractionMode('sentences')}
                        className="flex-1 py-1.5 rounded-xl text-xs font-arabic font-bold transition-all flex items-center justify-center gap-1"
                        style={
                          pageExtractionMode === 'sentences'
                            ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }
                            : { opacity: 0.7, color: 'var(--app-text-muted)' }
                        }
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>استخراج الحِكَم ({pageSentences.length})</span>
                      </button>

                      <button
                        onClick={() => setPageExtractionMode('full')}
                        className="flex-1 py-1.5 rounded-xl text-xs font-arabic font-bold transition-all flex items-center justify-center gap-1"
                        style={
                          pageExtractionMode === 'full'
                            ? { background: 'var(--app-surface)', color: 'var(--app-brand)', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }
                            : { opacity: 0.7, color: 'var(--app-text-muted)' }
                        }
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>كامل النص</span>
                      </button>
                    </div>

                    {/* In-page Search Filter */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="text"
                        value={pageSearchQuery}
                        onChange={(e) => setPageSearchQuery(e.target.value)}
                        placeholder="ابحث عن كلمة أو عبارة داخل الصفحة..."
                        className="w-full pr-8 pl-3 py-1.5 rounded-xl text-xs font-arabic border focus:outline-none"
                        style={{
                          background: 'var(--app-bg-2)',
                          borderColor: 'var(--app-divider)',
                          color: 'var(--app-text)',
                        }}
                      />
                      {pageSearchQuery && (
                        <button
                          onClick={() => setPageSearchQuery('')}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Excerpts List from Current Reading Page */}
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      
                      {/* MODE 1: PARAGRAPHS */}
                      {pageExtractionMode === 'paragraphs' && (
                        activePageData?.blocks
                          ?.filter((b) => !pageSearchQuery || b.text.toLowerCase().includes(pageSearchQuery.toLowerCase()))
                          .map((block, index) => {
                            const isCurrentQuote = editableQuote.trim() === block.text.trim();
                            const badgeLabel =
                              block.type === 'heading' ? 'عنوان' :
                              block.type === 'quote' ? 'حكمة / قول' :
                              block.type === 'bullet' ? 'نقطة' : `الفقرة ${index + 1}`;

                            return (
                              <button
                                key={block.id || index}
                                onClick={() => handleSelectParagraph(block.text, activePageData.title)}
                                className="w-full text-right p-3 rounded-2xl border transition-all text-xs font-arabic active:scale-[0.99] flex flex-col gap-1 cursor-pointer hover:border-amber-400/50"
                                style={{
                                  background: isCurrentQuote ? 'var(--app-brand-dim)' : 'var(--app-bg-2)',
                                  borderColor: isCurrentQuote ? 'var(--app-brand)' : 'var(--app-surface-border)',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: isCurrentQuote ? 'var(--app-brand)' : 'rgba(0,0,0,0.06)',
                                      color: isCurrentQuote ? 'white' : 'inherit',
                                    }}
                                  >
                                    {badgeLabel}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] opacity-60 font-mono">
                                      {block.text.length} حرف
                                    </span>
                                    {isCurrentQuote && (
                                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> مقتبس حالياً
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="line-clamp-2 leading-relaxed opacity-90 font-medium">
                                  {block.text}
                                </p>
                              </button>
                            );
                          })
                      )}

                      {/* MODE 2: SMART SENTENCES & WISDOM */}
                      {pageExtractionMode === 'sentences' && (
                        pageSentences
                          .filter((s) => !pageSearchQuery || s.toLowerCase().includes(pageSearchQuery.toLowerCase()))
                          .map((sentence, sIdx) => {
                            const isCurrentQuote = editableQuote.trim() === sentence.trim();
                            return (
                              <button
                                key={sIdx}
                                onClick={() => handleSelectParagraph(sentence, activePageData?.title)}
                                className="w-full text-right p-3 rounded-2xl border transition-all text-xs font-arabic active:scale-[0.99] flex flex-col gap-1 cursor-pointer hover:border-amber-400/50"
                                style={{
                                  background: isCurrentQuote ? 'var(--app-brand-dim)' : 'var(--app-bg-2)',
                                  borderColor: isCurrentQuote ? 'var(--app-brand)' : 'var(--app-surface-border)',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    حكمة {sIdx + 1}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] opacity-60 font-mono">
                                      {sentence.length} حرف
                                    </span>
                                    {isCurrentQuote && (
                                      <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> مقتبس حالياً
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="leading-relaxed opacity-90 font-medium">
                                  «{sentence}»
                                </p>
                              </button>
                            );
                          })
                      )}

                      {/* MODE 3: FULL PAGE TEXT */}
                      {pageExtractionMode === 'full' && activePageData?.display_text && (
                        <button
                          onClick={() => handleSelectParagraph(activePageData.display_text.slice(0, 360), activePageData.title)}
                          className="w-full text-right p-3 rounded-2xl border transition-all text-xs font-arabic active:scale-[0.99] flex flex-col gap-1 cursor-pointer hover:border-amber-400/50"
                          style={{
                            background: 'var(--app-bg-2)',
                            borderColor: 'var(--app-surface-border)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              مطلع الصفحة كاملاً
                            </span>
                            <span className="text-[10px] opacity-60 font-mono">
                              {Math.min(activePageData.display_text.length, 360)} حرف
                            </span>
                          </div>
                          <p className="line-clamp-4 leading-relaxed opacity-90 font-medium">
                            {activePageData.display_text}
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 1: THEMES & STYLES */}
                {activeTab === 'style' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="text-xs font-arabic font-bold uppercase tracking-wider block mb-2.5 opacity-80">
                        طابع التصميم (8 قوالب فاخرة)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {TEMPLATES.map((t) => {
                          const isActive = template === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setTemplate(t.id)}
                              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all active:scale-95 border"
                              style={{
                                background: isActive ? 'var(--app-brand-dim)' : 'transparent',
                                borderColor: isActive ? t.accentColor : 'transparent',
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-xl relative flex items-center justify-center shadow-md transition-transform"
                                style={{
                                  background: `linear-gradient(135deg, ${t.bgGrad[0]}, ${t.bgGrad[1]})`,
                                  border: `1.5px solid ${t.accentColor}`,
                                }}
                              >
                                {isActive ? (
                                  <Check className="w-4 h-4 text-white drop-shadow" />
                                ) : (
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: t.accentColor }}
                                  />
                                )}
                              </div>
                              <span className="text-[11px] font-arabic font-medium truncate max-w-full text-center">
                                {t.name.split(' ')[0]} {t.name.split(' ')[1] || ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Frame Styles */}
                    <div>
                      <label className="text-xs font-arabic font-bold block mb-2 opacity-80">
                        نمط الإطار
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'royal', name: 'ملكي مزخرف' },
                          { id: 'vintage', name: 'مخطوطة ثلاثية' },
                          { id: 'minimal', name: 'بسيط ناعم' },
                          { id: 'none', name: 'بدون إطار' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFrameStyle(f.id as FrameStyle)}
                            className="py-2 px-1 rounded-xl text-xs font-arabic text-center transition-all border"
                            style={
                              frameStyle === f.id
                                ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                                : { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand-border)', color: 'var(--app-text)' }
                            }
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TEXT & TYPOGRAPHY */}
                {activeTab === 'text' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Quick paragraph selector from active reading page */}
                    {activePageData?.blocks && activePageData.blocks.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-arabic font-bold opacity-75 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            مقتطفات سريعة من الصفحة {readingPage}:
                          </label>
                          <button
                            onClick={() => setActiveTab('page')}
                            className="text-[10px] font-arabic font-bold text-amber-500 hover:underline"
                          >
                            استعراض كل الفقرات ←
                          </button>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                          {activePageData.blocks.slice(0, 5).map((b, idx) => (
                            <button
                              key={b.id || idx}
                              onClick={() => handleSelectParagraph(b.text, activePageData.title)}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-arabic whitespace-nowrap border shrink-0 transition-all active:scale-95"
                              style={{
                                background: editableQuote === b.text ? 'var(--app-brand-grad)' : 'var(--app-bg-2)',
                                color: editableQuote === b.text ? 'white' : 'var(--app-text)',
                                borderColor: 'var(--app-surface-border)',
                              }}
                            >
                              الفقرة {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Quote Editor Box */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-arabic font-bold opacity-80 flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          تعديل نص الاقتباس يدوياً
                        </label>
                        <span className="text-[10px] font-arabic opacity-60">
                          {editableQuote.length} حرف
                        </span>
                      </div>
                      <textarea
                        value={editableQuote}
                        onChange={(e) => setEditableQuote(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-2xl text-sm font-arabic border focus:outline-none focus:ring-2 resize-none custom-scrollbar"
                        style={{
                          background: 'var(--app-bg-2)',
                          borderColor: 'var(--app-brand-border)',
                          color: 'var(--app-text)',
                        }}
                        placeholder="اكتب أو عدّل نص الاقتباس هنا..."
                      />
                    </div>

                    {/* Font Choice */}
                    <div>
                      <label className="text-xs font-arabic font-bold block mb-1.5 opacity-80">
                        نوع الخط العربي
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                        {FONTS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFontFamily(f.id)}
                            className="py-2 rounded-xl text-xs font-arabic text-center transition-all border"
                            style={
                              fontFamily === f.id
                                ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                                : { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand-border)', color: 'var(--app-text)' }
                            }
                          >
                            {f.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sliders: Size & Spacing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-arabic font-bold opacity-80">
                          <span>حجم الخط</span>
                          <span className="font-mono text-[11px]">{fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={58}
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{ accentColor: 'var(--app-brand)' }}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-arabic font-bold opacity-80">
                          <span>تباعد الأسطر</span>
                          <span className="font-mono text-[11px]">{lineHeightMult}x</span>
                        </div>
                        <input
                          type="range"
                          min={1.3}
                          max={2.4}
                          step={0.1}
                          value={lineHeightMult}
                          onChange={(e) => setLineHeightMult(parseFloat(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{ accentColor: 'var(--app-brand)' }}
                        />
                      </div>
                    </div>

                    {/* Alignment & Quotes Toggle */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-arabic opacity-80">المحاذاة:</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setTextAlign('center')}
                            className="px-3 py-1 rounded-xl text-xs font-arabic transition-all border"
                            style={
                              textAlign === 'center'
                                ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                                : { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand-border)' }
                            }
                          >
                            توسيط
                          </button>
                          <button
                            onClick={() => setTextAlign('right')}
                            className="px-3 py-1 rounded-xl text-xs font-arabic transition-all border"
                            style={
                              textAlign === 'right'
                                ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                                : { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand-border)' }
                            }
                          >
                            يمين
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setQuoteMarks(!quoteMarks)}
                        className="px-3 py-1 rounded-xl text-xs font-arabic border flex items-center gap-1.5 transition-all"
                        style={
                          quoteMarks
                            ? { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand)', color: 'var(--app-brand)', fontWeight: 'bold' }
                            : { opacity: 0.6 }
                        }
                      >
                        {quoteMarks ? <Check className="w-3.5 h-3.5" /> : null}
                        أقواس الاقتباس « »
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: ORNAMENTS & METADATA */}
                {activeTab === 'decor' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Header Ornament Select */}
                    <div>
                      <label className="text-xs font-arabic font-bold block mb-2 opacity-80">
                        الزخرفة العلوية (الرأسية)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ORNAMENTS.map((o) => (
                          <button
                            key={o.id}
                            onClick={() => setHeaderOrnament(o.id)}
                            className="py-2 px-2 rounded-xl text-xs font-arabic text-center transition-all border flex flex-col items-center gap-0.5"
                            style={
                              headerOrnament === o.id
                                ? { background: 'var(--app-brand-grad)', color: 'white', fontWeight: 'bold' }
                                : { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand-border)', color: 'var(--app-text)' }
                            }
                          >
                            <span className="text-base leading-none">{o.symbol}</span>
                            <span className="text-[10px]">{o.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Metadata Customization */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-arabic font-bold block opacity-80">
                        بيانات التوثيق والهامش
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] font-arabic opacity-70 block mb-1">اسم الكتاب / الباب</span>
                          <input
                            type="text"
                            value={customSource}
                            onChange={(e) => setCustomSource(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs font-arabic border focus:outline-none"
                            style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-brand-border)' }}
                          />
                        </div>

                        <div>
                          <span className="text-[11px] font-arabic opacity-70 block mb-1">المؤلف / القائل</span>
                          <input
                            type="text"
                            value={customAuthor}
                            onChange={(e) => setCustomAuthor(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs font-arabic border focus:outline-none"
                            style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-brand-border)' }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[11px] font-arabic opacity-70 block mb-1">رقم الصفحة</span>
                          <input
                            type="text"
                            value={customPage}
                            onChange={(e) => setCustomPage(e.target.value)}
                            placeholder="مثال: 45"
                            className="w-full px-3 py-1.5 rounded-xl text-xs font-arabic border focus:outline-none"
                            style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-brand-border)' }}
                          />
                        </div>

                        <div className="flex flex-col justify-end gap-1">
                          <button
                            onClick={() => setShowAuthorBadge(!showAuthorBadge)}
                            className="w-full py-2 rounded-xl text-xs font-arabic border flex items-center justify-center gap-1.5 transition-all"
                            style={
                              showAuthorBadge
                                ? { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand)', color: 'var(--app-brand)', fontWeight: 'bold' }
                                : { opacity: 0.6 }
                            }
                          >
                            {showAuthorBadge && <Check className="w-3.5 h-3.5" />}
                            إظهار معلومات التوثيق
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setShowWatermark(!showWatermark)}
                          className="w-full py-2 rounded-xl text-xs font-arabic border flex items-center justify-center gap-1.5 transition-all"
                          style={
                            showWatermark
                              ? { background: 'var(--app-brand-dim)', borderColor: 'var(--app-brand)', color: 'var(--app-brand)', fontWeight: 'bold' }
                              : { opacity: 0.6 }
                          }
                        >
                          {showWatermark && <Check className="w-3.5 h-3.5" />}
                          إظهار ختم التطبيق في الأسفل
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div
                className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-2.5 shrink-0"
                style={{ borderColor: 'var(--app-divider)' }}
              >
                {/* Direct Share */}
                <button
                  onClick={shareImage}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-arabic text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95"
                  style={{ background: 'var(--app-brand-grad)', color: 'white' }}
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة فورية
                </button>

                {/* Copy Image */}
                <button
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-arabic text-xs sm:text-sm font-bold border transition-all active:scale-95"
                  style={{
                    background: 'var(--app-brand-dim)',
                    borderColor: 'var(--app-brand-border)',
                    color: 'var(--app-brand)',
                  }}
                >
                  <Copy className="w-4 h-4" />
                  نسخ كصورة
                </button>

                {/* Download PNG */}
                <button
                  onClick={downloadImage}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-arabic text-xs sm:text-sm font-bold border transition-all active:scale-95 hover:bg-black/5"
                  style={{
                    borderColor: 'var(--app-brand-border)',
                    color: 'var(--app-text)',
                  }}
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'جاري التحميل...' : 'حفظ PNG عالية الدقة'}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
