// Web Audio API Procedural Sound Engine for Marvel Heroes
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastWhooshTime: number = 0;
  private lastThwipTime: number = 0;
  private lastRepulsorTime: number = 0;

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

  // "THWIP!" - Snappy web-shooter acoustic release
  public playWebShoot() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastThwipTime < 250) return; // debounce
    this.lastThwipTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // High snappy zip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    // Noise burst for the pneumatic piston hiss
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
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

  // Iron Man Repulsor Blast (High pitch charge + shockwave burst)
  public playRepulsor() {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastRepulsorTime < 350) return;
    this.lastRepulsorTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // High frequency charge tone
    const chargeOsc = this.ctx.createOscillator();
    const chargeGain = this.ctx.createGain();
    chargeOsc.type = 'sine';
    chargeOsc.frequency.setValueAtTime(400, t);
    chargeOsc.frequency.exponentialRampToValueAtTime(2800, t + 0.12);

    chargeGain.gain.setValueAtTime(0.05, t);
    chargeGain.gain.linearRampToValueAtTime(0.25, t + 0.1);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.ctx.destination);

    chargeOsc.start(t);
    chargeOsc.stop(t + 0.15);

    // Deep plasma punch explosion
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(240, t + 0.1);
    boomOsc.frequency.exponentialRampToValueAtTime(30, t + 0.45);

    boomGain.gain.setValueAtTime(0, t);
    boomGain.gain.setValueAtTime(0.45, t + 0.1);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    boomOsc.connect(boomGain);
    boomGain.connect(this.ctx.destination);

    boomOsc.start(t + 0.1);
    boomOsc.stop(t + 0.52);
  }

  // Tactical HUD Chirp / Click
  public playHudClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.setValueAtTime(3300, t + 0.03);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Hero Switch Power Surge
  public playHeroSwitch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [440, 660, 880, 1320].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      gain.gain.setValueAtTime(0.08, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.22);
    });
  }

  // Spider-Sense Tingle (Eerie harmonic chime)
  public playSpiderSense() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [880, 1174.66, 1760, 2349.32];

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      osc.frequency.linearRampToValueAtTime(freq * 1.05, t + idx * 0.04 + 0.3);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.08, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.45);
    });
  }

  // Wind / Swing Whoosh
  public playWhoosh(speedMultiplier = 1) {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastWhooshTime < 300) return;
    this.lastWhooshTime = now;

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.35 / Math.max(0.5, speedMultiplier);

    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(200, t + dur);
    filter.Q.setValueAtTime(2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + dur + 0.05);
  }

  // Wall Impact / Hero Landing
  public playImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Arc Reactor High-Voltage Charge
  public playArcReactorCharge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(4500, t + 1.2);
    filter.Q.setValueAtTime(8, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.4);

    // Resonant pulse chime at peak
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const peakT = this.ctx.currentTime;
      const peakOsc = this.ctx.createOscillator();
      const peakGain = this.ctx.createGain();
      peakOsc.type = 'sine';
      peakOsc.frequency.setValueAtTime(1200, peakT);
      peakGain.gain.setValueAtTime(0.3, peakT);
      peakGain.gain.exponentialRampToValueAtTime(0.001, peakT + 0.6);
      peakOsc.connect(peakGain);
      peakGain.connect(this.ctx.destination);
      peakOsc.start(peakT);
      peakOsc.stop(peakT + 0.65);
    }, 1100);
  }

  // Tactical JARVIS Audio / Voice Telemetry
  public playJarvisVoice(phrase: string) {
    if (this.isMuted) return;
    this.playHudClick();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.08;
      utterance.pitch = 0.95;
      utterance.volume = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const ukVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('Oliver') || v.name.includes('George'));
      if (ukVoice) utterance.voice = ukVoice;

      window.speechSynthesis.speak(utterance);
    }
  }

  // Enhanced Hero Switch Audio
  public playHeroSwitchDetailed(hero: 'ironman' | 'spiderman' | 'captainamerica') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (hero === 'ironman') {
      // Iron Man: Heavy mechanical clamp + repulsor flare
      this.playImpact();
      setTimeout(() => this.playRepulsor(), 140);
    } else if (hero === 'captainamerica') {
      // Captain America: Kinetic shield whoosh + resonant vibranium clang
      this.playShieldThrow();
      setTimeout(() => this.playShieldClang(), 180);
    } else {
      // Spider-Man: Rapid double web thwip + spider-sense chime
      this.playWebShoot();
      setTimeout(() => this.playWebShoot(), 160);
      setTimeout(() => this.playSpiderSense(), 260);
    }
  }

  // Captain America: Whistling kinetic shield throw whoosh
  public playShieldThrow() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Air displacement white noise / flutter
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + 0.18);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.42);
    filter.Q.setValueAtTime(3.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.linearRampToValueAtTime(0.35, t + 0.12);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.44);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.45);

    // Whistling spinning harmonic pitch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.4);

    oscGain.gain.setValueAtTime(0.01, t);
    oscGain.gain.linearRampToValueAtTime(0.18, t + 0.12);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.43);
  }

  // Captain America: Resonant Vibranium Alloy Metallic Clang
  public playShieldClang() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Primary metallic impact strike
    const frequencies = [820, 1640, 2460, 4200];
    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      // Subtle pitch bend downward on impact
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + 0.04);

      const decayTime = 0.5 + idx * 0.2;
      const volume = 0.3 / (idx + 1);

      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + decayTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + decayTime + 0.05);
    });

    // Sub-bass kinetic thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(t);
    subOsc.stop(t + 0.23);
  }

  // Web-Shooter Ballistic Firing Modes
  public playWebBallistic(mode: 'strand' | 'grenade' | 'ricochet') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (mode === 'strand') {
      this.playWebShoot();
    } else if (mode === 'grenade') {
      // Heavy pneumatic pop + dense splatter
      this.playWebShoot();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.3);
      gain.gain.setValueAtTime(0.4, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + 0.05);
      osc.stop(t + 0.36);
    } else if (mode === 'ricochet') {
      // Triple bounce deflection
      [0, 0.09, 0.18].forEach((delay, idx) => {
        if (!this.ctx) return;
        const pingT = t + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800 + idx * 400, pingT);
        gain.gain.setValueAtTime(0.2, pingT);
        gain.gain.exponentialRampToValueAtTime(0.001, pingT + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(pingT);
        osc.stop(pingT + 0.09);
      });
    }
  }
}

export const soundEngine = new SoundEngine();
