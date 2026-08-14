import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ambientAudio } from './ambientAudio';
import {
  CloudRain, Trees, Flame, Moon, Volume2,
  Square, X, Music,
} from 'lucide-react';

const SOUNDSCAPES = [
  { id: 'rain', label: 'مطر هادئ', icon: <CloudRain className="w-5 h-5" />, desc: 'صوت زخات المطر المهدئة لتصفية الذهن', play: () => ambientAudio.playRain() },
  { id: 'forest', label: 'نسيم الغابة', icon: <Trees className="w-5 h-5" />, desc: 'حفيف الأشجار والرياح اللطيفة في الطبيعة', play: () => ambientAudio.playForest() },
  { id: 'fireplace', label: 'مدفأة ومكتبة', icon: <Flame className="w-5 h-5" />, desc: 'دفء الخشب والهدوء الشتوي للقراءة العميقة', play: () => ambientAudio.playFireplace() },
  { id: 'night', label: 'هدوء الليل', icon: <Moon className="w-5 h-5" />, desc: 'ترددات تأملية استرخائية للنوم والقراءة الليلية', play: () => ambientAudio.playNight() },
];

export const AmbientSoundModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [activeTrack, setActiveTrack] = useState<string | null>(ambientAudio.getCurrentTrack());
  const [volume, setVolume] = useState<number>(ambientAudio.getVolume());

  useEffect(() => {
    setActiveTrack(ambientAudio.getCurrentTrack());
  }, [open]);

  const handleSelectTrack = (trackId: string, playFn: () => void) => {
    if (activeTrack === trackId) {
      ambientAudio.stop();
      setActiveTrack(null);
    } else {
      playFn();
      setActiveTrack(trackId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientAudio.setVolume(newVol);
  };

  const stopAll = () => {
    ambientAudio.stop();
    setActiveTrack(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content
          className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl z-50 p-6 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto custom-scrollbar"
          style={{
            background: 'var(--app-surface)',
            border: '1px solid var(--app-surface-border)',
            color: 'var(--app-text)',
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}>
                <Music className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold font-arabic">
                  أصوات التركيز القرائي
                </Dialog.Title>
                <p className="text-xs font-arabic opacity-70">
                  خلفيات صوتية استرخائية لتجربة قراءة غامرة
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-black/5 active:scale-90 transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Soundscapes Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {SOUNDSCAPES.map((s) => {
              const isPlaying = activeTrack === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectTrack(s.id, s.play)}
                  className="p-4 rounded-2xl text-right transition-all flex flex-col justify-between group active:scale-95 relative overflow-hidden"
                  style={{
                    background: isPlaying ? 'var(--app-brand-dim)' : 'rgba(0,0,0,0.02)',
                    border: isPlaying ? '2px solid var(--app-brand)' : '1px solid var(--app-surface-border)',
                    boxShadow: isPlaying ? '0 4px 16px var(--app-brand-glow)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        background: isPlaying ? 'var(--app-brand)' : 'var(--app-brand-dim)',
                        color: isPlaying ? 'white' : 'var(--app-brand)',
                      }}
                    >
                      {s.icon}
                    </div>
                    {isPlaying && (
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--app-brand)' }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'var(--app-brand)' }} />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-arabic font-bold text-sm mb-1">{s.label}</h4>
                    <p className="text-[11px] font-arabic leading-snug opacity-70 line-clamp-2">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--app-brand-dim)', border: '1px solid var(--app-brand-border)' }}>
            <div className="flex items-center justify-between mb-2 text-xs font-arabic font-semibold">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-brand-600" />
                مستوى الصوت
              </span>
              <span className="font-mono">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--app-brand)' }}
            />
          </div>

          {/* Stop / Footer Buttons */}
          <div className="flex gap-2">
            {activeTrack && (
              <button
                onClick={stopAll}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-arabic text-sm font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                إيقاف الصوت
              </button>
            )}
            <Dialog.Close asChild>
              <button
                className="flex-1 py-3 rounded-2xl font-arabic text-sm font-bold shadow-md transition-all active:scale-95"
                style={{ background: 'var(--app-brand-grad)', color: 'white' }}
              >
                تم ومتابعة القراءة
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
