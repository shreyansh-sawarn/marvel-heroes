// Web Audio API Procedural Sound Engine for Marvel Heroes Scrollytelling
import { MarvelHeroId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastWhooshTime: number = 0;
  private lastThwipTime: number = 0;
  private lastRepulsorTime: number = 0;
  private lastClangTime: number = 0;
  private lastThunderTime: number = 0;
  private lastClawTime: number = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      this.playHudClick();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- GENERAL HUD & UI SOUNDS ---
  public playHudClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.setValueAtTime(3600, t + 0.02);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  public playWhoosh(speedMultiplier = 1) {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastWhooshTime < 180) return;
    this.lastWhooshTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.25 / speedMultiplier;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(180, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + dur * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  public playHeroSwitch(heroId?: MarvelHeroId) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Harmonized dimensional chords
    const chord = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + idx * 0.04 + 0.35);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.setValueAtTime(0.12, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.5);
    });

    // Also trigger character-specific cue
    if (heroId === 'ironman') {
      setTimeout(() => this.playRepulsor(), 180);
    } else if (heroId === 'spiderman') {
      setTimeout(() => this.playWebShoot(), 180);
    } else if (heroId === 'captainamerica') {
      setTimeout(() => this.playShieldClang(), 180);
    } else if (heroId === 'thor') {
      setTimeout(() => this.playThunderClap(), 180);
    } else if (heroId === 'wolverine') {
      setTimeout(() => this.playClawSnikt(), 180);
    }
  }

  // --- 1. SPIDER-MAN ACOUSTIC ENGINE ---
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

    // Pneumatic piston hiss
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
      osc.frequency.setValueAtTime(f, t + idx * 0.05);
      osc.frequency.exponentialRampToValueAtTime(f * 1.05, t + idx * 0.05 + 0.28);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.setValueAtTime(0.12, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.45);
    });
  }

  // --- 2. IRON MAN ACOUSTIC ENGINE ---
  public playRepulsor() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastRepulsorTime < 250) return;
    this.lastRepulsorTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // High frequency charge tone
    const chargeOsc = this.ctx.createOscillator();
    const chargeGain = this.ctx.createGain();
    chargeOsc.type = 'sine';
    chargeOsc.frequency.setValueAtTime(450, t);
    chargeOsc.frequency.exponentialRampToValueAtTime(2900, t + 0.12);

    chargeGain.gain.setValueAtTime(0.05, t);
    chargeGain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.ctx.destination);
    chargeOsc.start(t);
    chargeOsc.stop(t + 0.15);

    // Deep plasma punch explosion
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(260, t + 0.1);
    boomOsc.frequency.exponentialRampToValueAtTime(32, t + 0.45);

    boomGain.gain.setValueAtTime(0, t);
    boomGain.gain.setValueAtTime(0.5, t + 0.1);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    boomOsc.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boomOsc.start(t + 0.1);
    boomOsc.stop(t + 0.52);
  }

  public playArcReactorCharge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(4500, t + 0.8);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.86);
  }

  public playUnibeam() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.playArcReactorCharge();
    setTimeout(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy plasma shockwave
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.8);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.9);
    }, 400);
  }

  // --- 3. CAPTAIN AMERICA ACOUSTIC ENGINE ---
  public playShieldThrow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(480, t);
    filter.frequency.exponentialRampToValueAtTime(1700, t + 0.16);
    filter.frequency.exponentialRampToValueAtTime(340, t + 0.38);
    filter.Q.setValueAtTime(3.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.35, t + 0.12);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.42);
  }

  public playShieldClang() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastClangTime < 180) return;
    this.lastClangTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [820, 1640, 2460, 4200];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + 0.04);

      const decayTime = 0.5 + idx * 0.18;
      const vol = 0.35 / (idx + 1);

      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + decayTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + decayTime + 0.05);
    });

    // Sub thud
    const sub = this.ctx.createOscillator();
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(180, t);
    sub.frequency.exponentialRampToValueAtTime(45, t + 0.16);
    subG.gain.setValueAtTime(0.45, t);
    subG.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    sub.connect(subG);
    subG.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.22);
  }

  // --- 4. THOR ACOUSTIC ENGINE ---
  public playThunderClap() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastThunderTime < 300) return;
    this.lastThunderTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Lightning spark crackle
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    // Deep rolling thunder sub-rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(65, t + 0.05);
    subOsc.frequency.exponentialRampToValueAtTime(18, t + 0.7);

    subGain.gain.setValueAtTime(0.5, t + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t + 0.05);
    subOsc.stop(t + 0.8);
  }

  // --- 5. WOLVERINE ACOUSTIC ENGINE ---
  public playClawSnikt() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastClawTime < 220) return;
    this.lastClawTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Triple metallic scrape / razor slide ("SNIKT!")
    [0, 0.03, 0.06].forEach((offset, idx) => {
      if (!this.ctx) return;
      const st = t + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3200 + idx * 350, st);
      osc.frequency.exponentialRampToValueAtTime(1200, st + 0.09);

      gain.gain.setValueAtTime(0.28, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(st);
      osc.stop(st + 0.11);
    });
  }

  public playBerserkerSlash() {
    if (this.isMuted) return;
    this.playClawSnikt();
    setTimeout(() => this.playWhoosh(1.4), 60);
  }
}

export const soundEngine = new SoundEngine();
