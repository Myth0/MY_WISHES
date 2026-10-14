/**
 * Web Audio Procedural Cinematic Sound Engine
 * Zero external audio assets required - 100% reliable, zero CORS/network delay.
 * Designed specifically for POOKIE PROTOCOL.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isEnabled = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.droneOscillators = [];
    this.isDronePlaying = false;
    this.heartbeatTimer = null;
    this.reverbNode = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Algorithmic warm room reverb buffer
    this.reverbNode = this.createReverbNode(2.5, 2.0);
    this.reverbNode.connect(this.masterGain);

    this.isEnabled = true;
  }

  createReverbNode(duration = 2.5, decay = 2.0) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  enable() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isEnabled = true;
    this.startAmbientDrone();
  }

  toggleMute() {
    if (!this.isEnabled) {
      this.enable();
      this.isMuted = false;
      return false;
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.7;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  startAmbientDrone() {
    if (!this.ctx || this.isDronePlaying || this.isMuted) return;
    this.isDronePlaying = true;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);

    // Slow ambient breathing filter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // D minor / F major cosmic frequencies (D2, A2, F3, C4)
    const freqs = [73.42, 110.0, 174.61, 261.63];
    this.droneOscillators = [];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const oscGain = this.ctx.createGain();
      
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.4, this.ctx.currentTime);
      
      oscGain.gain.setValueAtTime(0.12 / (idx + 1), this.ctx.currentTime);

      if (panner) {
        panner.pan.setValueAtTime((idx / (freqs.length - 1)) * 1.4 - 0.7, this.ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(panner);
        panner.connect(filter);
      } else {
        osc.connect(oscGain);
        oscGain.connect(filter);
      }

      osc.start();
      this.droneOscillators.push(osc);
    });

    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);
    if (this.reverbNode) {
      this.ambientGain.connect(this.reverbNode);
    }
  }

  /**
   * Organic rhythmic heartbeat ("lub-dub")
   */
  playHeartbeat(intensity = 1.0) {
    if (!this.ctx || !this.isEnabled || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Sub-bass thump 1: Ventricular contraction (Lub)
    this._playThump(now, 58, 30, 0.16, 0.45 * intensity);

    // Sub-bass thump 2: Atrial/ventricular release (Dub) ~ 180ms later
    this._playThump(now + 0.18, 48, 26, 0.14, 0.35 * intensity);
  }

  _playThump(time, startFreq, endFreq, duration, volume) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  /**
   * Ethereal crystal chime on orb hover or click
   */
  playChime(noteIndex = 0) {
    if (!this.ctx || !this.isEnabled || this.isMuted) return;

    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // Pentatonic high harmonics
    const freq = scale[noteIndex % scale.length];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.8);

    // Harmonic shimmer
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(freq * 2.01, now);
    shimmerGain.gain.setValueAtTime(0.04, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(gain);
    shimmer.start(now);
    shimmer.stop(now + 1.3);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(this.masterGain);
    if (this.reverbNode) gain.connect(this.reverbNode);

    osc.start(now);
    osc.stop(now + 1.9);
  }

  /**
   * Resonant warm hug sound
   */
  playVirtualHug() {
    if (!this.ctx || !this.isEnabled || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Warm harmonic chord (F major 9: F3, A3, C4, E4, G4)
    const chord = [174.61, 220.0, 261.63, 329.63, 392.0];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14 / (idx * 0.5 + 1), now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      if (this.reverbNode) gain.connect(this.reverbNode);

      osc.start(now);
      osc.stop(now + 3.4);
    });

    // Also trigger deep soothing heartbeat
    this.playHeartbeat(1.4);
  }

  /**
   * Secret Easter egg discovery chime
   */
  playSecretChime() {
    if (!this.ctx || !this.isEnabled || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    
    notes.forEach((freq, i) => {
      const t = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      if (this.reverbNode) gain.connect(this.reverbNode);

      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  /**
   * Heart opening finale celestial crescendo
   */
  playFinaleCrescendo() {
    if (!this.ctx || !this.isEnabled || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chords = [
      [220.0, 261.63, 329.63, 392.0], // Am7
      [261.63, 329.63, 392.0, 523.25], // Cmaj7
      [349.23, 440.0, 523.25, 659.25]  // Fmaj7
    ];

    chords.forEach((chord, cIdx) => {
      const cTime = now + cIdx * 1.2;
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, cTime);

        gain.gain.setValueAtTime(0.001, cTime);
        gain.gain.linearRampToValueAtTime(0.09, cTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, cTime + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        if (this.reverbNode) gain.connect(this.reverbNode);

        osc.start(cTime);
        osc.stop(cTime + 2.6);
      });
    });
  }
}

export const soundEngine = new SoundEngine();
