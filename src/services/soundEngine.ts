// Web Audio API Procedural Sound Engine for Spider-Verse & Symbiote Nexus
import { SpiderHeroId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastThwipTime: number = 0;
  private lastVenomTime: number = 0;
  private lastRoarTime: number = 0;
  private lastGlitchTime: number = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.initContext();
      this.playSpiderSense();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- PETER PARKER: CLASSIC WEB-SHOOTER ("THWIP!") ---
  public playWebShoot() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastThwipTime < 180) return;
    this.lastThwipTime = now;

    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // High snappy zip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    // Noise burst for pneumatic piston hiss
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
    noise.start(t);
  }

  // --- SPIDER-SENSE TINGLE / WARNING ---
  public playSpiderSense() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const freqs = [880, 1174, 1396, 1760];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + idx * 0.06);
      osc.frequency.exponentialRampToValueAtTime(f * 1.05, t + idx * 0.06 + 0.3);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.setValueAtTime(0.12, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.5);
    });
  }

  // --- MILES MORALES: VENOM BLAST BIO-ELECTRICITY ---
  public playVenomBlast(intensity: number = 1.0) {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastVenomTime < 150) return;
    this.lastVenomTime = now;

    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Electric zap / saw oscillators with FM modulation
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(180, t);
    carrier.frequency.exponentialRampToValueAtTime(80, t + 0.28);

    modulator.type = 'square';
    modulator.frequency.setValueAtTime(45, t);
    modulator.frequency.linearRampToValueAtTime(15, t + 0.28);

    modGain.gain.setValueAtTime(140 * intensity, t);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.28);
    filter.Q.setValueAtTime(6, t);

    mainGain.gain.setValueAtTime(0.35 * intensity, t);
    mainGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    carrier.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + 0.32);
    modulator.stop(t + 0.32);

    // Sub rumble impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    subGain.gain.setValueAtTime(0.4 * intensity, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.36);
  }

  // --- MILES MORALES: CAMOUFLAGE SHIMMER ---
  public playCamouflage() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.45);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // --- SPIDER-GWEN: RHYTHM BEATS & SYNTH PAD ---
  public playGwenBeat(type: 'kick' | 'snare' | 'hihat' | 'synth') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.22);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    } else if (type === 'snare') {
      const noise = this.ctx.createBufferSource();
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } else if (type === 'hihat') {
      const noise = this.ctx.createBufferSource();
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } else {
      // Ethereal neon synth chord
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major neon chord
      chords.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.4);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.48);
      });
    }
  }

  // --- SPIDER-MAN 2099: TEMPORAL GLITCH & LASER WEBS ---
  public play2099Glitch() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastGlitchTime < 180) return;
    this.lastGlitchTime = now;

    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.setValueAtTime(450, t + 0.04);
    osc.frequency.setValueAtTime(3200, t + 0.08);
    osc.frequency.setValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // --- SPIDER-MAN NOIR: TYPEWRITER & MATCH STRIKE ---
  public playNoirTypewriter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + Math.random() * 400, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playNoirMatchStrike() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  // --- VENOM & CARNAGE: VISCERAL SYMBIOTE TENDRIL & ROAR ---
  public playSymbioteTendril() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Organic squelch whip
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.linearRampToValueAtTime(300, t + 0.2);
    filter.Q.setValueAtTime(7, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playSymbioteRoar() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastRoarTime < 600) return;
    this.lastRoarTime = now;

    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Deep sub-bass growl
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(65, t);
    sub.frequency.linearRampToValueAtTime(45, t + 0.4);
    sub.frequency.linearRampToValueAtTime(30, t + 0.7);

    subGain.gain.setValueAtTime(0.45, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    // Raspy distortion noise
    const noise = this.ctx.createBufferSource();
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(450, t);
    noiseFilter.Q.setValueAtTime(4, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    sub.connect(subGain);
    subGain.connect(this.ctx.destination);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    sub.start(t);
    noise.start(t);
    sub.stop(t + 0.8);
  }

  // --- SONIC FREQUENCY (SYMBIOTE WEAKNESS) ---
  public playSonicScreech(freq: number = 880) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  // --- SPIDER-PUNK: OVERDRIVEN GUITAR DISTORTION ---
  public playPunkDistortion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Power chord (E, B, E)
    const chord = [82.41, 123.47, 164.81];
    chord.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const dist = this.ctx.createWaveShaper();

      // Simple soft distortion curve
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
      }
      dist.curve = curve;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(dist);
      dist.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // --- MULTIVERSE DIMENSIONAL WARP ---
  public playDimensionalWarp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.55);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // --- HERO SWITCH SIGNATURE CUES ---
  public playHeroSwitchDetailed(heroId: SpiderHeroId, isSymbiote: boolean = false) {
    if (this.isMuted) return;
    this.playDimensionalWarp();

    setTimeout(() => {
      if (isSymbiote || heroId === 'venom' || heroId === 'carnage') {
        this.playSymbioteRoar();
      } else {
        switch (heroId) {
          case 'spiderman':
            this.playWebShoot();
            setTimeout(() => this.playSpiderSense(), 100);
            break;
          case 'miles':
            this.playVenomBlast(0.9);
            break;
          case 'gwen':
            this.playGwenBeat('synth');
            break;
          case 'spider2099':
            this.play2099Glitch();
            break;
          case 'spidernoir':
            this.playNoirMatchStrike();
            break;
          case 'spiderpunk':
            this.playPunkDistortion();
            break;
        }
      }
    }, 280);
  }

  public playWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.35);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playHudClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }
}

export const soundEngine = new SoundEngine();
