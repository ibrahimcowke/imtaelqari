import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bell, Clock, X, Check, Sparkles, Send, Volume2 } from 'lucide-react';
import {
  getReminderConfig,
  saveReminderConfig,
  sendInstantNotification,
  type ReminderConfig,
} from '../../services/notificationService';

export const ReminderModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [config, setConfig] = useState<ReminderConfig>(getReminderConfig());
  const [savedToast, setSavedToast] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (open) {
      setConfig(getReminderConfig());
    }
  }, [open]);

  const handleSave = async () => {
    await saveReminderConfig(config);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onOpenChange(false);
    }, 1200);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    await sendInstantNotification(
      'تذكير إمتاع القارئ 📖',
      '«جمال الكلم يحيي القلوب وروائع الحكم تنير العقول» — حان وقت وردك اليومي ✨'
    );
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-3xl p-6 shadow-2xl z-50 border outline-none font-arabic animate-slide-up"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--app-divider)' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
              >
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold">
                  تذكير الورد القرائي اليومي
                </Dialog.Title>
                <Dialog.Description className="text-xs font-medium" style={{ color: 'var(--app-text-muted)' }}>
                  إشعارات وتنبيهات ذكية لتثبيت عادة القراءة
                </Dialog.Description>
              </div>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="py-5 space-y-5">
            {/* Toggle Reminder */}
            <div
              className="flex items-center justify-between p-4 rounded-2xl border transition-all"
              style={{ background: 'var(--app-bg-2)', borderColor: 'var(--app-divider)' }}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-sm font-bold block">تفعيل التنبيه اليومي</span>
                  <span className="text-xs font-medium block" style={{ color: 'var(--app-text-muted)' }}>
                    إرسال إشعار يومي في الوقت المحدد
                  </span>
                </div>
              </div>

              <button
                onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className="relative w-12 h-6 rounded-full transition-all duration-300 shrink-0"
                style={{ background: config.enabled ? 'var(--app-brand-grad)' : 'var(--app-brand-dim)' }}
              >
                <span
                  className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-md"
                  style={{ left: config.enabled ? '26px' : '2px' }}
                />
              </button>
            </div>

            {/* Time Picker */}
            {config.enabled && (
              <div className="space-y-2">
                <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--app-text)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: 'var(--app-brand)' }} />
                  <span>وقت التذكير اليومي:</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={config.time}
                    onChange={(e) => setConfig((prev) => ({ ...prev, time: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-2xl text-base font-mono font-bold border outline-none text-center shadow-inner"
                    style={{
                      background: 'var(--app-bg-2)',
                      borderColor: 'var(--app-brand-border)',
                      color: 'var(--app-text)',
                    }}
                  />
                  
                  {/* Quick Preset times */}
                  <div className="flex gap-1.5">
                    {['08:00', '16:30', '21:00'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setConfig((prev) => ({ ...prev, time: preset }))}
                        className="px-2.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95"
                        style={
                          config.time === preset
                            ? { background: 'var(--app-brand-grad)', color: 'white', borderColor: 'transparent' }
                            : { background: 'var(--app-bg-2)', color: 'var(--app-text-muted)', borderColor: 'var(--app-divider)' }
                        }
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Test Notification Button */}
            <button
              onClick={handleTestNotification}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95"
              style={{
                background: 'var(--app-brand-dim)',
                color: 'var(--app-brand)',
                borderColor: 'var(--app-brand-border)',
              }}
            >
              {testSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>تم إرسال إشعار تجريبي بنجاح!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال إشعار تجريبي للجهاز الآن</span>
                </>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t flex items-center gap-3" style={{ borderColor: 'var(--app-divider)' }}>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-arabic text-sm font-bold text-white shadow-xl transition-all active:scale-95"
              style={{
                background: 'var(--app-brand-grad)',
                boxShadow: '0 4px 16px var(--app-brand-glow)',
              }}
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم حفظ الإعدادات!</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>حفظ وتفعيل التنبيه</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-3.5 rounded-2xl font-arabic text-xs font-bold border opacity-80 hover:opacity-100"
              style={{ borderColor: 'var(--app-divider)', color: 'var(--app-text-muted)' }}
            >
              إلغاء
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
