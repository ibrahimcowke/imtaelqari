// Pure Web Audio API Sound Generator (100% Offline, Zero external assets required)

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: string | null = null;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx?.currentTime || 0);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  public isPlaying(): boolean {
    return this.currentTrack !== null;
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else {
        try {
          (node as any).stop?.();
          node.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.activeNodes = [];
    this.currentTrack = null;
  }

  // 🌧️ Rain Soundscape
  public playRain() {
    this.stop();
    const ctx = this.getContext();
    this.currentTrack = 'rain';

    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume, ctx.currentTime);
    master.connect(ctx.destination);
    this.gainNode = master;

    // Pink noise buffer for rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(850, ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(master);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, lowpass);
  }

  // 🌿 Forest Wind Calm
  public playForest() {
    this.stop();
    const ctx = this.getContext();
    this.currentTrack = 'forest';

    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume, ctx.currentTime);
    master.connect(ctx.destination);
    this.gainNode = master;

    // Brown noise for wind
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 1.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // LFO for slow wind modulation
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(master);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, lfo, lfoGain);
  }

  // ☕ Fireplace & Library Warmth
  public playFireplace() {
    this.stop();
    const ctx = this.getContext();
    this.currentTrack = 'fireplace';

    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume, ctx.currentTime);
    master.connect(ctx.destination);
    this.gainNode = master;

    // Low rumble
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start();

    // Crackle generator
    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) {
        const crackle = ctx.createOscillator();
        crackle.type = 'sine';
        crackle.frequency.setValueAtTime(Math.random() * 1200 + 400, ctx.currentTime);

        const crackleGain = ctx.createGain();
        crackleGain.gain.setValueAtTime(Math.random() * 0.08 + 0.02, ctx.currentTime);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        crackle.connect(crackleGain);
        crackleGain.connect(master);

        crackle.start();
        crackle.stop(ctx.currentTime + 0.09);
      }
    }, 90);

    this.activeNodes.push(osc, oscGain, interval);
  }

  // 🌙 Deep Night Calm
  public playNight() {
    this.stop();
    const ctx = this.getContext();
    this.currentTrack = 'night';

    const master = ctx.createGain();
    master.gain.setValueAtTime(this.volume, ctx.currentTime);
    master.connect(ctx.destination);
    this.gainNode = master;

    // Warm chord pad (F minor meditative drone)
    const freqs = [87.31, 130.81, 174.61, 261.63];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.05, ctx.currentTime);

      osc.connect(g);
      g.connect(master);
      osc.start();
      this.activeNodes.push(osc, g);
    });
  }
}

export const ambientAudio = new AmbientAudioEngine();
