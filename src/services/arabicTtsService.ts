/**
 * ═══════════════════════════════════════════════════════════════
 * Advanced Arabic Text-to-Speech (TTS) Engine
 * Free, Ultra-Natural, High-Performance Speech Synthesis
 * Supports Natural Neural Streaming & Native Web Speech API
 * ═══════════════════════════════════════════════════════════════
 */

export type TtsEngineMode = 'neural' | 'system';

export interface TtsState {
  isPlaying: boolean;
  isPaused: boolean;
  currentBlockId: string | null;
  currentSentence: string;
  progress: number; // 0 to 100
  rate: number;
  engineMode: TtsEngineMode;
  selectedVoiceName: string;
}

type TtsListener = (state: TtsState) => void;

class ArabicTtsService {
  private listeners: Set<TtsListener> = new Set();
  private state: TtsState = {
    isPlaying: false,
    isPaused: false,
    currentBlockId: null,
    currentSentence: '',
    progress: 0,
    rate: 1,
    engineMode: 'neural',
    selectedVoiceName: 'طبيعي فصيح (Google Neural)',
  };

  private currentAudio: HTMLAudioElement | null = null;
  private queue: { text: string; blockId?: string }[] = [];
  private currentQueueIndex = 0;
  private onCompleteCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved user TTS preferences
      const savedRate = localStorage.getItem('imta_tts_rate');
      if (savedRate) {
        this.state.rate = parseFloat(savedRate) || 1;
      }
      const savedEngine = localStorage.getItem('imta_tts_engine') as TtsEngineMode;
      if (savedEngine) {
        this.state.engineMode = savedEngine;
      }

      // Pre-warm voices
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.getBestSystemArabicVoice();
        };
      }
    }
  }

  public subscribe(listener: TtsListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  /**
   * Split Arabic text into coherent phonetic segments (< 180 chars)
   */
  private segmentArabicText(text: string): string[] {
    if (!text) return [];

    // Clean text from unwanted punctuation / symbols for natural acoustic flow
    const clean = text
      .replace(/[\r\n]+/g, ' ')
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return [];

    // Split by Arabic sentence delimiters (، . ؛ : ؟ ! \n)
    const rawSegments = clean.split(/([.،؛؟!:?\n]+)/);
    const result: string[] = [];
    let current = '';

    for (let i = 0; i < rawSegments.length; i++) {
      const part = rawSegments[i];
      if (current.length + part.length < 160) {
        current += part;
      } else {
        if (current.trim()) result.push(current.trim());
        current = part;
      }
    }

    if (current.trim()) {
      result.push(current.trim());
    }

    return result.filter((s) => s.length > 1 && !/^[.،؛؟!\s]+$/.test(s));
  }

  /**
   * Start reading structured blocks or single text
   */
  public readBlocks(
    blocks: { id: string; text: string }[],
    onFinished?: () => void
  ) {
    this.stop();
    this.onCompleteCallback = onFinished || null;

    this.queue = [];
    blocks.forEach((b) => {
      const segments = this.segmentArabicText(b.text);
      segments.forEach((seg) => {
        this.queue.push({ text: seg, blockId: b.id });
      });
    });

    if (this.queue.length === 0) return;

    this.currentQueueIndex = 0;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.notify();

    this.playNextSegment();
  }

  public readText(text: string, onFinished?: () => void) {
    this.readBlocks([{ id: 'generic', text }], onFinished);
  }

  private playNextSegment() {
    if (this.currentQueueIndex >= this.queue.length) {
      this.stop();
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
      return;
    }

    const item = this.queue[this.currentQueueIndex];
    this.state.currentBlockId = item.blockId || null;
    this.state.currentSentence = item.text;
    this.state.progress = Math.round(((this.currentQueueIndex + 1) / this.queue.length) * 100);
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.notify();

    if (this.state.engineMode === 'neural') {
      this.playViaNeuralStream(item.text);
    } else {
      this.playViaSpeechSynthesis(item.text);
    }
  }

  /**
   * Engine 1: Neural Natural Arabic Voice Stream
   */
  private playViaNeuralStream(text: string) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    // High quality Arabic Google Neural TTS endpoint
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.playbackRate = this.state.rate;

    audio.onended = () => {
      this.currentQueueIndex++;
      this.playNextSegment();
    };

    audio.onerror = () => {
      // Fallback to Web Speech API if offline or blocked
      this.playViaSpeechSynthesis(text);
    };

    audio.play().catch(() => {
      // Fallback
      this.playViaSpeechSynthesis(text);
    });
  }

  /**
   * Engine 2: Native Web Speech API with Arabic Voice Selection
   */
  private playViaSpeechSynthesis(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = this.state.rate;
    utterance.pitch = 1.0;

    const arabicVoice = this.getBestSystemArabicVoice();
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => {
      this.currentQueueIndex++;
      this.playNextSegment();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        this.currentQueueIndex++;
        this.playNextSegment();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public getBestSystemArabicVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritize natural neural Arabic voices
    const preferredVoices = [
      'Microsoft Shakir Online (Natural) - Arabic (Saudi Arabia)',
      'Microsoft Hamed Online (Natural) - Arabic (Saudi Arabia)',
      'Microsoft Fatima Online (Natural) - Arabic (Saudi Arabia)',
      'Google العربية',
      'Google Arabic',
      'Tarik',
      'Maged',
      'Laila',
      'Zayd',
    ];

    for (const pref of preferredVoices) {
      const match = voices.find((v) => v.name.includes(pref));
      if (match) return match;
    }

    // Secondary match: any Arabic voice (ar-SA, ar-EG, ar)
    const arVoice = voices.find((v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic'));
    return arVoice || null;
  }

  public getAvailableVoicesList(): string[] {
    const list = ['طبيعي فصيح (Google Neural)'];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const sysVoices = window.speechSynthesis.getVoices();
      sysVoices
        .filter((v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic'))
        .forEach((v) => list.push(v.name));
    }
    return list;
  }

  public pause() {
    this.state.isPaused = true;
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.notify();
  }

  public resume() {
    this.state.isPaused = false;
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    } else {
      this.playNextSegment();
    }
    this.notify();
  }

  public togglePlayPause() {
    if (!this.state.isPlaying) return;
    if (this.state.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public stop() {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentBlockId = null;
    this.state.currentSentence = '';
    this.state.progress = 0;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.notify();
  }

  public setRate(rate: number) {
    this.state.rate = rate;
    localStorage.setItem('imta_tts_rate', String(rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
    this.notify();
  }

  public setEngineMode(mode: TtsEngineMode) {
    this.state.engineMode = mode;
    localStorage.setItem('imta_tts_engine', mode);
    this.notify();
  }

  public nextSentence() {
    if (this.currentQueueIndex < this.queue.length - 1) {
      if (this.currentAudio) this.currentAudio.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      this.currentQueueIndex++;
      this.playNextSegment();
    }
  }

  public prevSentence() {
    if (this.currentQueueIndex > 0) {
      if (this.currentAudio) this.currentAudio.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      this.currentQueueIndex--;
      this.playNextSegment();
    }
  }

  public getState(): TtsState {
    return { ...this.state };
  }
}

export const arabicTtsService = new ArabicTtsService();
