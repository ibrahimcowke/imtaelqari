import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Download, Upload, Check, AlertCircle,
  Database, X, Printer
} from 'lucide-react';
import { db } from '../../lib/db';

export const BackupExportModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Export JSON Data Backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const [
        bookmarks,
        highlights,
        notes,
        quotes,
        khatmas,
        flashcards,
        recordings,
      ] = await Promise.all([
        db.bookmarks.toArray(),
        db.highlights.toArray(),
        db.notes.toArray(),
        db.quotes.toArray(),
        db.khatmas.toArray(),
        db.flashcards.toArray(),
        db.recordings.toArray(),
      ]);

      const backupData = {
        app: 'ImtaaAlQari',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          bookmarks,
          highlights,
          notes,
          quotes,
          khatmas,
          flashcards,
          recordings,
          localStorageKeys: {
            theme: localStorage.getItem('imta_theme'),
            streak: localStorage.getItem('imta_streak'),
          },
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imta-al-qari-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('تم تصدير النسخة الاحتياطية بنجاح وحفظ الملف!');
    } catch (err: any) {
      setErrorMessage('تعذر تصدير النسخة الاحتياطية: ' + (err?.message || 'خطأ غير معروف'));
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Import JSON Data Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.app || backup.app !== 'ImtaaAlQari' || !backup.data) {
        throw new Error('ملف النسخة الاحتياطية غير صالح أو غير متوافق.');
      }

      await db.transaction('rw', [db.bookmarks, db.highlights, db.notes, db.quotes, db.khatmas, db.flashcards], async () => {
        if (backup.data.bookmarks?.length) await db.bookmarks.bulkPut(backup.data.bookmarks);
        if (backup.data.highlights?.length) await db.highlights.bulkPut(backup.data.highlights);
        if (backup.data.notes?.length) await db.notes.bulkPut(backup.data.notes);
        if (backup.data.quotes?.length) await db.quotes.bulkPut(backup.data.quotes);
        if (backup.data.khatmas?.length) await db.khatmas.bulkPut(backup.data.khatmas);
        if (backup.data.flashcards?.length) await db.flashcards.bulkPut(backup.data.flashcards);
      });

      setSuccessMessage('تم استرجاع جميع الفوائد والبيانات بنجاح!');
    } catch (err: any) {
      setErrorMessage('فشل في قراءة ملف النسخة الاحتياطية: ' + (err?.message || 'تأكد من صيغة الملف'));
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  // 3. Print / Export Formatted Benefits Booklet (كراسة الفوائد)
  const handlePrintBenefitsBooklet = async () => {
    try {
      const [bookmarks, highlights, notes] = await Promise.all([
        db.bookmarks.toArray(),
        db.highlights.toArray(),
        db.notes.toArray(),
      ]);

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>كراسة فوائد وفرائد إمتاع القارئ</title>
          <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Amiri', 'Noto Naskh Arabic', serif;
              padding: 40px;
              color: #1a1008;
              background: #fff;
              line-height: 1.9;
            }
            .header {
              text-align: center;
              border-bottom: 2px double #8f5c3d;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 26px;
              color: #683e25;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 14px;
              color: #8c5f4b;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #8f5c3d;
              border-bottom: 1px solid #ddd;
              padding-bottom: 6px;
              margin-top: 25px;
            }
            .card {
              border: 1px solid #e8dccf;
              background: #fdfaf6;
              padding: 14px 18px;
              border-radius: 12px;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .card-meta {
              font-size: 12px;
              font-weight: bold;
              color: #8f5c3d;
              margin-bottom: 6px;
            }
            .card-text {
              font-size: 16px;
              color: #111;
            }
            @media print {
              body { padding: 15mm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>كراسة الفوائد والفرائد الأدبية</h1>
            <p>مستخلصة من قراءات كتاب «إمتاع القارئ بجمال الكلم وروائع الحكم»</p>
            <p style="font-size: 12px; opacity: 0.8;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>

          <div class="section-title">النصوص المظللة (${highlights.length})</div>
          ${highlights.length > 0 ? highlights.map(h => `
            <div class="card">
              <div class="card-meta">صفحة ${h.page}</div>
              <div class="card-text">${h.selectedText || ''}</div>
            </div>
          `).join('') : '<p>لا توجد نصوص مظللة محفوظة.</p>'}

          <div class="section-title">العلامات المرجعية والوقفات (${bookmarks.length})</div>
          ${bookmarks.length > 0 ? bookmarks.map(b => `
            <div class="card">
              <div class="card-meta">صفحة ${b.page} • ${b.heading || 'فائدة محفوظة'}</div>
              <div class="card-text">${b.preview || ''}</div>
            </div>
          `).join('') : '<p>لا توجد علامات مرجعية محفوظة.</p>'}

          <div class="section-title">الملاحظات والتدوينات الشخصية (${notes.length})</div>
          ${notes.length > 0 ? notes.map(n => `
            <div class="card">
              <div class="card-meta">صفحة ${n.page}</div>
              <div class="card-text">${n.text}</div>
            </div>
          `).join('') : '<p>لا توجد ملاحظات مدونة.</p>'}

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch {
      // Handle print error
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-lg max-h-[88vh] rounded-3xl z-50 shadow-2xl p-5 sm:p-7 overflow-y-auto focus:outline-none custom-scrollbar border"
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
                <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  <span>النسخ الاحتياطي وتصدير الفوائد</span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-75" style={{ color: 'var(--app-text-muted)' }}>
                  حفظ، استرجاع، وتصدير كراسة الفوائد والملاحظات
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl border flex items-center gap-2 text-xs font-arabic font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl border flex items-center gap-2 text-xs font-arabic font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* 1. Export Booklet Option */}
            <div className="p-4 rounded-2xl border app-surface space-y-2">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-500" />
                <h4 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                  كراسة الفوائد للطباعة و PDF
                </h4>
              </div>
              <p className="text-xs font-arabic opacity-80 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                تنسيق جميع تظليلاتك وعلاماتك المرجعية وملاحظاتك في ملف أنيق قابل للطباعة أو الحفظ كـ PDF.
              </p>
              <button
                onClick={handlePrintBenefitsBooklet}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-arabic font-bold border transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
                style={{
                  background: 'var(--app-brand-dim)',
                  borderColor: 'var(--app-brand-border)',
                  color: 'var(--app-brand)',
                }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>معاينة وطباعة كراسة الفوائد</span>
              </button>
            </div>

            {/* 2. Full JSON Backup Option */}
            <div className="p-4 rounded-2xl border app-surface space-y-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-500" />
                <h4 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                  تصدير نسخة احتياطية كاملة (JSON)
                </h4>
              </div>
              <p className="text-xs font-arabic opacity-80 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                حفظ نسخة آمنة من كافة تظليلاتك، والختمات، وبطاقات المراجعة، والتسجيلات على جهازك.
              </p>
              <button
                disabled={isExporting}
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-arabic font-bold text-white shadow transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 disabled:opacity-50"
                style={{ background: 'var(--app-brand-grad)' }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'جاري التصدير...' : 'تحميل النسخة الاحتياطية'}</span>
              </button>
            </div>

            {/* 3. Restore Backup Option */}
            <div className="p-4 rounded-2xl border app-surface space-y-2">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-500" />
                <h4 className="font-arabic font-bold text-xs" style={{ color: 'var(--app-text)' }}>
                  استرجاع نسخة احتياطية سابقة
                </h4>
              </div>
              <p className="text-xs font-arabic opacity-80 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                استيراد ملف نسخة احتياطية سابقة لدمجها واسترجاع كافة البيانات.
              </p>
              <label
                className="w-full py-2.5 px-4 rounded-xl text-xs font-arabic font-bold border transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
                style={{
                  background: 'var(--app-bg-2)',
                  borderColor: 'var(--app-divider)',
                  color: 'var(--app-text)',
                }}
              >
                <Upload className="w-3.5 h-3.5 inline" />
                <span>{isImporting ? 'جاري الاستيراد...' : 'اختر ملف النسخة الاحتياطية (.json)'}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
