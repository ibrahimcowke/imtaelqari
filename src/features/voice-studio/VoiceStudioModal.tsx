import React, { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Mic, Square, Play, Pause, Trash2,
  Volume2, X, BookOpen
} from 'lucide-react';
import { db } from '../../lib/db';
import { bookDataService } from '../../data/service';
import { useReaderStore } from '../../store/readerStore';
import type { VoiceRecordingItem } from '../../types/book';

export const VoiceStudioModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageNumber?: number;
}> = ({ open, onOpenChange, pageNumber }) => {
  const storeCurrentPage = useReaderStore((state) => state.currentPage);
  const activePage = pageNumber || storeCurrentPage || 1;
  const pageData = bookDataService.getPage(activePage);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const recordings = useLiveQuery(
    () => db.recordings.orderBy('createdAt').reverse().toArray(),
    []
  ) ?? [];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Convert to Base64 for persistent IndexedDB storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const newRecording: VoiceRecordingItem = {
            id: crypto.randomUUID(),
            page: activePage,
            title: `تسجيل ص ${activePage} - ${pageData?.title || 'إمتاع القارئ'}`,
            passageText: pageData?.blocks?.[0]?.text || pageData?.display_text?.slice(0, 160) || '',
            audioBase64: base64Audio,
            durationSeconds: recordSeconds,
            createdAt: new Date().toISOString(),
          };
          await db.recordings.add(newRecording);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      alert('يرجى السماح للتطبيق بالوصول إلى الميكروفون لتسجيل قراءتك.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const playRecording = (rec: VoiceRecordingItem) => {
    if (playingId === rec.id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audioSrc = rec.audioBase64 || rec.audioBlobUrl;
    if (!audioSrc) return;

    const audio = new Audio(audioSrc);
    audioPlayerRef.current = audio;
    audio.play();
    setPlayingId(rec.id);

    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const deleteRecording = async (id: string) => {
    if (playingId === id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
    }
    await db.recordings.delete(id);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl z-50 p-0 shadow-2xl focus:outline-none max-h-[92vh] flex flex-col overflow-hidden border"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b shrink-0"
            style={{ borderColor: 'var(--app-divider)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}
              >
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base sm:text-lg font-bold font-arabic flex items-center gap-2">
                  استوديو التسجيل الصوتي التراثي
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-arabic"
                    style={{ background: 'var(--app-brand-dim)', color: 'var(--app-brand)' }}
                  >
                    ص {activePage}
                  </span>
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  سجّل قراءتك العذبة للأبيات والحكم وشاركها
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all opacity-80 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {/* Suggested Reading Excerpt */}
            <div
              className="p-4 rounded-2xl border flex flex-col gap-2"
              style={{
                background: 'var(--app-brand-dim)',
                borderColor: 'var(--app-brand-border)',
              }}
            >
              <span className="text-[11px] font-arabic font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                مقتطف مقترح للتسجيل من الصفحة الحالية ({pageData?.title}):
              </span>
              <p className="text-xs sm:text-sm font-arabic leading-relaxed font-semibold opacity-95">
                « {pageData?.blocks?.[0]?.text || pageData?.display_text?.slice(0, 200) || 'إمتاع القارئ'} »
              </p>
            </div>

            {/* Live Recording Controller */}
            <div
              className="p-6 rounded-3xl border flex flex-col items-center justify-center gap-4 text-center shadow-sm"
              style={{
                background: 'var(--app-bg-2)',
                borderColor: 'var(--app-surface-border)',
              }}
            >
              {/* Pulsing visualizer circle */}
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <span className="absolute w-24 h-24 rounded-full bg-rose-500/20 animate-ping" />
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 z-10"
                  style={{
                    background: isRecording
                      ? '#ef4444'
                      : 'var(--app-brand-grad)',
                  }}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div>
                <span className="font-mono text-xl font-bold text-amber-500 block">
                  {formatTime(recordSeconds)}
                </span>
                <span className="text-xs font-arabic opacity-70 mt-1 block">
                  {isRecording ? 'جاري التسجيل... انقر للإيقاف والحفظ' : 'اضغط على الميكروفون لبدء التسجيل'}
                </span>
              </div>
            </div>

            {/* Saved Recordings List */}
            {recordings.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-arabic font-bold opacity-80 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  تسجيلاتك المحفوظة ({recordings.length})
                </h4>

                <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                  {recordings.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-arabic"
                      style={{
                        background: 'var(--app-bg-2)',
                        borderColor: 'var(--app-surface-border)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => playRecording(rec)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md active:scale-90 transition-all"
                          style={{ background: 'var(--app-brand-grad)' }}
                        >
                          {playingId === rec.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <h5 className="font-bold truncate" style={{ color: 'var(--app-text)' }}>
                            {rec.title}
                          </h5>
                          <span className="text-[10px] opacity-60">
                            {new Date(rec.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteRecording(rec.id)}
                        className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:text-rose-500 transition-all shrink-0"
                        title="حذف التسجيل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
