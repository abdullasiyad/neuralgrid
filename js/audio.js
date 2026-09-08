/* ==========================================================================
   NEURAL-GRID // OVERWATCH — ADAPTIVE PROCEDURAL AUDIO & VOICE SYNTHESIZER
   ========================================================================== */

class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isVoiceEnabled = true;
    this.isInitialized = false;

    // Procedural Audio Layers
    this.layers = {
      ambient: null,
      lowThreat: null,
      elevated: null,
      warning: null,
      critical: null,
      lockdown: null
    };
    this.layerGains = {};

    this.alarmOsc = null;
    this.alarmGain = null;
    this.analyser = null;
    this.dataArray = null;

    this.initOnUserGesture();
  }

  initOnUserGesture() {
    const initFn = () => {
      if (!this.isInitialized) {
        this.init();
        window.removeEventListener('click', initFn);
        window.removeEventListener('keydown', initFn);
      }
    };
    window.addEventListener('click', initFn);
    window.addEventListener('keydown', initFn);
  }

  init() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Analyser Node
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 32;
      this.analyser.connect(this.ctx.destination);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.isInitialized = true;

      // Initialize Layered Procedural Drone Hum
      this.initAudioLayers();
    } catch (e) {
      console.warn("Web Audio initialization skipped:", e);
    }
  }

  ensureContextState() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initAudioLayers() {
    if (!this.ctx) return;
    try {
      const frequencies = {
        ambient: 55,       // Deep 55Hz sub hum
        lowThreat: 110,    // 110Hz subtle pulse
        elevated: 220,     // 220Hz harmonic tension
        warning: 330,      // 330Hz warning drone
        critical: 440,     // 440Hz alarm layer
        lockdown: 660      // 660Hz high lockdown tension
      };

      Object.keys(frequencies).forEach(key => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = key === 'ambient' ? 'sine' : key === 'critical' ? 'sawtooth' : 'triangle';
        osc.frequency.value = frequencies[key];

        gain.gain.value = key === 'ambient' ? 0.01 : 0.0;

        osc.connect(gain);
        gain.connect(this.analyser);
        osc.start();

        this.layers[key] = osc;
        this.layerGains[key] = gain;
      });
    } catch (e) {}
  }

  updateThreatAudioLayers(threatLevel) {
    if (!this.ctx || this.isMuted) return;
    this.ensureContextState();

    const now = this.ctx.currentTime;
    const norm = Math.min(100, Math.max(0, threatLevel));

    // Adaptive Gain Layering based on Threat Level
    if (this.layerGains.ambient) this.layerGains.ambient.gain.setTargetAtTime(0.015, now, 0.5);
    if (this.layerGains.lowThreat) this.layerGains.lowThreat.gain.setTargetAtTime(norm >= 25 ? 0.01 : 0, now, 0.5);
    if (this.layerGains.elevated) this.layerGains.elevated.gain.setTargetAtTime(norm >= 50 ? 0.015 : 0, now, 0.5);
    if (this.layerGains.warning) this.layerGains.warning.gain.setTargetAtTime(norm >= 75 ? 0.02 : 0, now, 0.5);
    if (this.layerGains.critical) this.layerGains.critical.gain.setTargetAtTime(norm >= 90 ? 0.03 : 0, now, 0.5);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ctx) {
      this.stopAlarm();
      Object.keys(this.layerGains).forEach(k => {
        if (this.layerGains[k]) this.layerGains[k].gain.value = 0;
      });
    } else {
      this.updateThreatAudioLayers(0);
    }
    return this.isMuted;
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    return this.isVoiceEnabled;
  }

  playScaryDrone() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContextState();
    try {
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      subOsc.type = 'sine';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.5);

      subOsc.frequency.setValueAtTime(45, now);
      subOsc.frequency.exponentialRampToValueAtTime(22, now + 1.5);

      filter.type = 'lowpass';
      filter.frequency.value = 260;

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 1.5);
      subOsc.stop(now + 1.5);
    } catch (e) {}
  }

  speakVoice(text, onEndCallback = null) {
    if (this.isMuted || !this.isVoiceEnabled || !('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }
    try {
      window.speechSynthesis.cancel(); // Clear previous speech queue
      
      // Trigger scary sub-bass growl drone behind speech
      this.playScaryDrone();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;   // Slow, menacing pace
      utterance.pitch = 0.22;  // Ultra-deep demonic/cyber-overlord tone
      utterance.volume = 0.95;

      let hasFired = false;
      const fireCallback = () => {
        if (!hasFired) {
          hasFired = true;
          if (onEndCallback) onEndCallback();
        }
      };

      utterance.onend = fireCallback;
      utterance.onerror = fireCallback;

      const voices = window.speechSynthesis.getVoices();
      // Select dark/male voice if available on system
      const scaryVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('Male') || v.name.includes('Google UK English Male'))
      ) || voices.find(v => v.lang.startsWith('en'));

      if (scaryVoice) utterance.voice = scaryVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onEndCallback) onEndCallback();
    }
  }

  playThreatDetected() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playTargetLock() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playSentinelDeployment() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }

  playBlackout() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch (e) {}
  }

  playSystemRestored() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.03, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.analyser);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {}
  }

  playHover() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playClick() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playScan() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1600, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.analyser);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playAlarm() {
    if (this.isMuted || !this.isInitialized || this.alarmOsc) return;
    this.ensureContextState();
    try {
      this.alarmOsc = this.ctx.createOscillator();
      this.alarmGain = this.ctx.createGain();

      this.alarmOsc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      this.alarmGain.gain.setValueAtTime(0.04, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 3;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 250;

      lfo.connect(lfoGain);
      lfoGain.connect(this.alarmOsc.frequency);
      this.alarmOsc.frequency.setValueAtTime(650, now);

      this.alarmOsc.connect(this.alarmGain);
      this.alarmGain.connect(this.analyser);

      lfo.start(now);
      this.alarmOsc.start(now);
    } catch (e) {}
  }

  stopAlarm() {
    if (this.alarmOsc) {
      try {
        this.alarmOsc.stop();
        this.alarmOsc.disconnect();
      } catch (e) {}
      this.alarmOsc = null;
      this.alarmGain = null;
    }
  }

  playHealing() {
    if (this.isMuted || !this.isInitialized) return;
    this.ensureContextState();
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = this.ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.03, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.analyser);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }

  getFrequencyData() {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return new Uint8Array(16);
  }
}

export const audioEngine = new CyberAudioEngine();
