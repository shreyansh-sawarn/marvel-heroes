// Web Audio API Procedural Sound Engine for Spider-Verse & Symbiote Nexus
import { SpiderHeroId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private lastThwipTime: number = 0;
  private lastVenomTime: number = 0;
  private lastRoarTime: number = 0;
  private lastGlitchTime: number = 0;

  // Procedural Multiverse OST Engine
  private ostInterval: number | null = null;
  private ostPlaying: boolean = false;
  private currentOstHero: SpiderHeroId = 'spiderman';
  private ostStep: number = 0;
  private nextNoteTime: number = 0;
  private ostVolume: number = 0.28;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioDestination(): AudioNode {
    this.initContext();
    return this.masterGain || this.ctx!.destination;
  }

  public getAudioFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(32);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
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
    gain.connect(this.getAudioDestination());
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // --- LASER WEBS / HARD-LIGHT WEAPONS (2099 / TECH) ---
  public playLaserWeb() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, t);
    filter.Q.setValueAtTime(6.0, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- DIMENSIONAL PORTAL WARP (THE SPOT / COLLIDER) ---
  public playPortalWarp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.45);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(28, t);
    mod.frequency.linearRampToValueAtTime(6, t + 0.45);
    modGain.gain.setValueAtTime(95, t);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.46);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    mod.start(t);
    osc.start(t);
    mod.stop(t + 0.47);
    osc.stop(t + 0.47);
  }

  // --- EXPLOSION (PUMPKIN BOMBS / COLLIDER OVERLOAD) ---
  public playExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Low sub thump
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(130, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.45);
    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    sub.connect(subGain);
    subGain.connect(this.getAudioDestination());

    // Crashing noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.4);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.getAudioDestination());

    sub.start(t);
    sub.stop(t + 0.52);
    noise.start(t);
  }

  // --- COMBO HIT PITCH SCALING ---
  public playComboHit(combo: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const baseFreq = 220 * Math.pow(1.07, Math.min(combo, 18));
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, t + 0.12);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // --- SPIDER-SOCIETY CANON KLAXON ALERT ---
  public playCanonAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    [0, 0.14, 0.28].forEach((offset, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 660, t + offset);
      gain.gain.setValueAtTime(0.18, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.12);
      osc.connect(gain);
      gain.connect(this.getAudioDestination());
      osc.start(t + offset);
      osc.stop(t + offset + 0.13);
    });
  }

  // --- DAILY BUGLE CAMERA SNAP & SHUTTER ---
  public playPhotoShutter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Fast mechanical shutter click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.getAudioDestination());
    osc.start(t);
    osc.stop(t + 0.05);

    // Motorized film advance whirr
    const motor = this.ctx.createOscillator();
    const motorGain = this.ctx.createGain();
    motor.type = 'sawtooth';
    motor.frequency.setValueAtTime(320, t + 0.07);
    motor.frequency.linearRampToValueAtTime(180, t + 0.22);
    motorGain.gain.setValueAtTime(0.12, t + 0.07);
    motorGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    motor.connect(motorGain);
    motorGain.connect(this.getAudioDestination());
    motor.start(t + 0.07);
    motor.stop(t + 0.25);
  }

  // --- PETER'S WEB FORMULA CHEMICAL BUBBLE ---
  public playChemicalBubble() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const startFreq = 250 + Math.random() * 200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // --- WEB STRAND TENSILE SNAP ---
  public playTensileSnap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.getAudioDestination());

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // --- VICTORY FANFARE ---
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.24, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.getAudioDestination());
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.4);
    });
  }

  // =========================================================================
  // --- PROCEDURAL MULTIVERSE OST SYNTHESIZER ---
  // =========================================================================

  public isOSTPlaying(): boolean {
    return this.ostPlaying;
  }

  public getCurrentOSTHero(): SpiderHeroId {
    return this.currentOstHero;
  }

  public setOSTHero(heroId: SpiderHeroId) {
    this.currentOstHero = heroId;
    this.ostStep = 0;
  }

  public setOSTVolume(vol: number) {
    this.ostVolume = Math.max(0, Math.min(1, vol));
  }

  public getOSTVolume(): number {
    return this.ostVolume;
  }

  public toggleMultiverseOST(heroId?: SpiderHeroId): boolean {
    if (this.ostPlaying) {
      this.stopMultiverseOST();
      return false;
    } else {
      this.startMultiverseOST(heroId);
      return true;
    }
  }

  public startMultiverseOST(heroId?: SpiderHeroId) {
    if (heroId) this.currentOstHero = heroId;
    this.initContext();
    if (!this.ctx) return;

    this.stopMultiverseOST();
    this.ostPlaying = true;
    this.ostStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Scheduler tick every 25ms
    this.ostInterval = window.setInterval(() => {
      this.scheduleNextOSTNotes();
    }, 25);
  }

  public stopMultiverseOST() {
    this.ostPlaying = false;
    if (this.ostInterval !== null) {
      clearInterval(this.ostInterval);
      this.ostInterval = null;
    }
  }

  private scheduleNextOSTNotes() {
    if (!this.ctx || !this.ostPlaying) return;

    // 16-step bar duration depends on hero tempo
    let bpm = 124;
    switch (this.currentOstHero) {
      case 'spiderman': bpm = 122; break;
      case 'miles': bpm = 138; break;
      case 'gwen': bpm = 154; break;
      case 'spider2099': bpm = 134; break;
      case 'spidernoir': bpm = 88; break;
      case 'spiderpunk': bpm = 174; break;
      case 'venom':
      case 'carnage': bpm = 72; break;
    }

    const stepDuration = 60 / (bpm * 4); // duration of a 16th note

    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.scheduleHeroStep(this.currentOstHero, this.ostStep, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.ostStep = (this.ostStep + 1) % 16;
    }
  }

  private scheduleHeroStep(heroId: SpiderHeroId, step: number, time: number, stepDuration: number) {
    if (!this.ctx || this.isMuted) return;

    const dest = this.getAudioDestination();
    const vol = this.ostVolume;

    // Helper: synth drum kick
    const triggerKick = (t: number, punch: number = 1.0) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);
      gain.gain.setValueAtTime(0.35 * vol * punch, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);
    };

    // Helper: snare / clap
    const triggerSnare = (t: number) => {
      if (!this.ctx) return;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22 * vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start(t);
    };

    // Helper: hi-hat
    const triggerHiHat = (t: number, isOpen: boolean = false) => {
      if (!this.ctx) return;
      const bufferSize = Math.floor(this.ctx.sampleRate * (isOpen ? 0.08 : 0.03));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isOpen ? 0.08 : 0.03));
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start(t);
    };

    // Helper: melodic note
    const triggerTone = (t: number, freq: number, type: OscillatorType, dur: number, amp: number = 0.2) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(amp * vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };

    // HERO SPECIFIC COMPOSITIONS
    switch (heroId) {
      case 'spiderman': {
        // Orchestral Heroic Drive (BPM 122)
        if (step === 0 || step === 8) triggerKick(time, 1.2);
        if (step === 4 || step === 12) triggerSnare(time);
        if (step % 2 === 0) triggerHiHat(time);

        // Staccato Orchestral Bass (E minor)
        const bassFreq = step < 8 ? 82.41 : 73.42; // E2 or D2
        if (step % 2 === 0) triggerTone(time, bassFreq, 'triangle', stepDuration * 1.5, 0.28);

        // Heroic Brass Motif on steps 0, 3, 6, 10, 14
        const brassMotif: Record<number, number> = {
          0: 329.63, // E4
          3: 392.00, // G4
          6: 440.00, // A4
          10: 493.88, // B4
          14: 587.33, // D5
        };
        if (brassMotif[step]) {
          triggerTone(time, brassMotif[step], 'sawtooth', stepDuration * 2.5, 0.15);
        }
        break;
      }

      case 'miles': {
        // Brooklyn Metro Trap / 808s (BPM 138)
        if (step === 0 || step === 6 || step === 10) {
          // 808 Sub Kick
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, time);
          osc.frequency.exponentialRampToValueAtTime(36, time + 0.28);
          gain.gain.setValueAtTime(0.42 * vol, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(time);
          osc.stop(time + 0.32);
        }
        if (step === 4 || step === 12) triggerSnare(time);
        // Trap hihat rolls
        if (step % 2 === 0 || step === 14 || step === 15) triggerHiHat(time, step === 14);

        // Electric Rhodes chord in D Minor
        if (step === 0 || step === 8) {
          triggerTone(time, 293.66, 'square', stepDuration * 5, 0.1); // D4
          triggerTone(time, 349.23, 'square', stepDuration * 5, 0.08); // F4
        }
        break;
      }

      case 'gwen': {
        // The Mary Janes Drumline & Ethereal Synth (BPM 154)
        if (step === 0 || step === 6 || step === 8 || step === 14) triggerKick(time);
        if (step === 4 || step === 12) triggerSnare(time);
        triggerHiHat(time, step % 4 === 2);

        // Dreamy pad chords (Fmaj7 - Cmaj7)
        if (step === 0) {
          triggerTone(time, 349.23, 'triangle', stepDuration * 8, 0.16); // F4
          triggerTone(time, 440.00, 'triangle', stepDuration * 8, 0.14); // A4
          triggerTone(time, 523.25, 'triangle', stepDuration * 8, 0.12); // C5
        } else if (step === 8) {
          triggerTone(time, 261.63, 'triangle', stepDuration * 8, 0.16); // C4
          triggerTone(time, 329.63, 'triangle', stepDuration * 8, 0.14); // E4
          triggerTone(time, 392.00, 'triangle', stepDuration * 8, 0.12); // G4
        }
        break;
      }

      case 'spider2099': {
        // Nueva York Darksynth / Cyberpunk Pulse (BPM 134)
        if (step % 4 === 0) triggerKick(time, 1.3); // 4-on-the-floor
        if (step === 4 || step === 12) triggerSnare(time);
        if (step % 2 === 1) triggerHiHat(time);

        // 16th note rolling saw bass in C# minor
        const cyberBass = [69.3, 69.3, 82.41, 69.3, 103.83, 69.3, 82.41, 92.5];
        triggerTone(time, cyberBass[step % 8], 'sawtooth', stepDuration * 0.9, 0.22);

        // Cyber Arp on high octave
        if (step % 2 === 0) {
          const arp = [554.37, 659.25, 830.61, 987.77];
          triggerTone(time, arp[(step / 2) % 4], 'sine', stepDuration * 0.8, 0.12);
        }
        break;
      }

      case 'spidernoir': {
        // 1933 Harlem Jazz Noir Walking Bass & Rain (BPM 88)
        if (step === 0 || step === 8) triggerKick(time, 0.7);
        if (step === 4 || step === 12) triggerSnare(time);
        if (step === 2 || step === 6 || step === 10 || step === 14) triggerHiHat(time);

        // Walking double bass (F -> Ab -> Bb -> C)
        const jazzNotes = [87.31, 103.83, 116.54, 130.81];
        if (step % 4 === 0) {
          triggerTone(time, jazzNotes[(step / 4) % 4], 'sine', stepDuration * 3.5, 0.32);
        }
        break;
      }

      case 'spiderpunk': {
        // 15,000 Watt Camden Skate-Punk (BPM 174)
        if (step % 2 === 0) triggerKick(time, 1.1);
        if (step % 4 === 2) triggerSnare(time);
        triggerHiHat(time);

        // Distorted Power Chords (A5 -> G5)
        const punkRoot = step < 8 ? 110.0 : 98.0;
        triggerTone(time, punkRoot, 'sawtooth', stepDuration * 0.85, 0.26);
        triggerTone(time, punkRoot * 1.5, 'sawtooth', stepDuration * 0.85, 0.22);
        break;
      }

      case 'venom':
      case 'carnage': {
        // Klyntar Primordial Hive Rumble (BPM 72)
        if (step === 0 || step === 8) {
          // Low menacing subterranean sub-bass
          triggerTone(time, 38.0, 'sine', stepDuration * 7, 0.45);
        }
        if (step === 4 || step === 12) {
          // Sub heartbeat thump
          triggerKick(time, 0.9);
        }
        // Alien tritone dissonance
        if (step === 2 || step === 10) {
          triggerTone(time, 277.18, 'sawtooth', stepDuration * 2.5, 0.08); // C#4
          triggerTone(time, 392.00, 'sawtooth', stepDuration * 2.5, 0.07); // G4 (tritone)
        }
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
