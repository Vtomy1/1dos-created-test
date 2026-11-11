/**
 * Web Audio API Retro Sound Synthesizer
 * Simulates:
 * 1. 1-bit PC Speaker (Intel 8253/8254 PIT timer channel 2 + 8255 PPI port 61h)
 * 2. QBASIC PLAY / SOUND MML interpreter
 * 3. SoundBlaster / AdLib Yamaha OPL2 2-Operator FM Synthesizer
 * 4. Mechanical 3.5" Floppy Drive Stepper Motor seek chatter
 * 5. CRT Degauss coil discharge
 */

class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Classic 1-bit PC Speaker square wave tone
   * @param frequency Hz (e.g. 440 or 800)
   * @param durationMs Milliseconds
   */
  public beep(frequency = 750, durationMs = 120): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // True 1-bit PC Speaker is a pure harsh square wave
      osc.type = 'square';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      const durSec = durationMs / 1000;

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      // Hard cutoff like real TTL logic gate
      gain.gain.setValueAtTime(this.volume * 0.35, now + durSec - 0.005);
      gain.gain.linearRampToValueAtTime(0, now + durSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durSec);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * SoundBlaster / AdLib FM Synth Chord / Bell
   * Implements 2-operator FM: Modulator modulates Carrier frequency
   */
  public playFmChime(baseFreq = 440, durationMs = 600): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const durSec = durationMs / 1000;

      // Carrier
      const carrier = this.ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(baseFreq, now);

      // Modulator (OPL2 Operator)
      const modulator = this.ctx.createOscillator();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(baseFreq * 2, now); // Harmonic ratio 2:1

      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(baseFreq * 1.5, now);
      modGain.gain.exponentialRampToValueAtTime(1, now + durSec);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.4, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      carrier.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + durSec);
      modulator.stop(now + durSec);
    } catch {
      // ignore
    }
  }

  /**
   * Mechanical 3.5" / 5.25" Floppy Disk Drive Stepper Seek Crunch
   * Simulates the iconic "chrr-chrr-click" head movement!
   */
  public playFloppySeek(steps = 4): void {
    this.playFloppyDriveRead(steps);
  }

  /**
   * Comprehensive Floppy Drive Read Sound
   * Simulates drive motor spin-up, head stepper track stepping, and sector read chatter
   */
  public playFloppyDriveRead(tracks = 6): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Spindle motor spin hum (300 RPM = 5 Hz rotation, with 150 Hz harmonic)
      const motorOsc = this.ctx.createOscillator();
      const motorGain = this.ctx.createGain();
      motorOsc.type = 'triangle';
      motorOsc.frequency.setValueAtTime(145, now);
      
      const totalDur = (tracks * 0.055) + 0.15;
      motorGain.gain.setValueAtTime(this.volume * 0.08, now);
      motorGain.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.05);
      motorGain.gain.setValueAtTime(this.volume * 0.1, now + totalDur - 0.05);
      motorGain.gain.linearRampToValueAtTime(0, now + totalDur);

      motorOsc.connect(motorGain);
      motorGain.connect(this.ctx.destination);
      motorOsc.start(now);
      motorOsc.stop(now + totalDur);

      // 2. Stepper motor head bursts ("chrr-chk... chk-chk")
      for (let i = 0; i < tracks; i++) {
        const stepTime = now + 0.04 + (i * 0.055);
        const stepOsc = this.ctx.createOscillator();
        const stepGain = this.ctx.createGain();

        // Mechanical stepper impulse
        stepOsc.type = 'sawtooth';
        // Alternating pitch between inner/outer tracks
        stepOsc.frequency.setValueAtTime(i % 2 === 0 ? 135 : 98, stepTime);
        stepOsc.frequency.exponentialRampToValueAtTime(45, stepTime + 0.028);

        stepGain.gain.setValueAtTime(this.volume * 0.35, stepTime);
        stepGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.025);

        stepOsc.connect(stepGain);
        stepGain.connect(this.ctx.destination);

        stepOsc.start(stepTime);
        stepOsc.stop(stepTime + 0.03);

        // Sub-micro chatter: head read verify tick
        if (i % 2 === 1) {
          const tickOsc = this.ctx.createOscillator();
          const tickGain = this.ctx.createGain();
          tickOsc.type = 'square';
          tickOsc.frequency.setValueAtTime(850, stepTime + 0.012);

          tickGain.gain.setValueAtTime(this.volume * 0.1, stepTime + 0.012);
          tickGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.02);

          tickOsc.connect(tickGain);
          tickGain.connect(this.ctx.destination);

          tickOsc.start(stepTime + 0.012);
          tickOsc.stop(stepTime + 0.022);
        }
      }
    } catch {
      // ignore
    }
  }

  /**
   * Vintage IDE / MFM Hard Drive Spin-Up & Head Recalibrate
   * Simulates spindle acceleration whine (0 -> 3600 RPM) followed by
   * solenoid head unpark and track 00 seek recalibration ("thwack-click")
   */
  public playHardDriveSpinUp(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const spinDuration = 1.6;

      // 1. Spindle motor spin-up whine (rising frequency from 120Hz to 2400Hz)
      const spindleOsc = this.ctx.createOscillator();
      const spindleGain = this.ctx.createGain();

      spindleOsc.type = 'sawtooth';
      spindleOsc.frequency.setValueAtTime(90, now);
      // Exponential curve matching physical inertia acceleration
      spindleOsc.frequency.exponentialRampToValueAtTime(2200, now + spinDuration);

      spindleGain.gain.setValueAtTime(0.001, now);
      spindleGain.gain.linearRampToValueAtTime(this.volume * 0.22, now + 0.4);
      spindleGain.gain.setValueAtTime(this.volume * 0.18, now + spinDuration);
      spindleGain.gain.exponentialRampToValueAtTime(0.001, now + spinDuration + 0.6);

      // Lowpass filter to muffle raw sawtooth into metal casing whine
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + spinDuration);

      spindleOsc.connect(filter);
      filter.connect(spindleGain);
      spindleGain.connect(this.ctx.destination);

      spindleOsc.start(now);
      spindleOsc.stop(now + spinDuration + 0.7);

      // 2. Actuator Head Unpark & Recalibrate Clack ("clack-thump... tick")
      const unparkTime = now + spinDuration + 0.05;
      
      // Hit 1: Heads unpark from landing zone
      const clack1Osc = this.ctx.createOscillator();
      const clack1Gain = this.ctx.createGain();
      clack1Osc.type = 'square';
      clack1Osc.frequency.setValueAtTime(160, unparkTime);
      clack1Osc.frequency.exponentialRampToValueAtTime(40, unparkTime + 0.04);
      clack1Gain.gain.setValueAtTime(this.volume * 0.45, unparkTime);
      clack1Gain.gain.exponentialRampToValueAtTime(0.001, unparkTime + 0.045);
      clack1Osc.connect(clack1Gain);
      clack1Gain.connect(this.ctx.destination);
      clack1Osc.start(unparkTime);
      clack1Osc.stop(unparkTime + 0.05);

      // Hit 2: Track 00 stop bump (80ms later)
      const clack2Time = unparkTime + 0.085;
      const clack2Osc = this.ctx.createOscillator();
      const clack2Gain = this.ctx.createGain();
      clack2Osc.type = 'triangle';
      clack2Osc.frequency.setValueAtTime(220, clack2Time);
      clack2Osc.frequency.exponentialRampToValueAtTime(50, clack2Time + 0.035);
      clack2Gain.gain.setValueAtTime(this.volume * 0.35, clack2Time);
      clack2Gain.gain.exponentialRampToValueAtTime(0.001, clack2Time + 0.04);
      clack2Osc.connect(clack2Gain);
      clack2Gain.connect(this.ctx.destination);
      clack2Osc.start(clack2Time);
      clack2Osc.stop(clack2Time + 0.045);
    } catch {
      // ignore
    }
  }

  /**
   * IBM PC / AMI / Award BIOS POST Diagnostic Beep Error Codes
   * Authentic square wave hardware tone sequences.
   */
  public playPostBeep(code: 'success' | 'ram_error' | 'video_error' | 'keyboard_error' | 'gate_a20' | 'continuous' = 'success'): void {
    if (this.isMuted) return;

    switch (code) {
      case 'success':
        // Standard single short beep: 880Hz, 120ms (All tests passed, base 64K OK)
        this.beep(880, 130);
        break;

      case 'video_error':
        // 1 long, 2 short beeps (Video adapter failure / Display memory)
        this.beep(800, 380);
        setTimeout(() => this.beep(800, 110), 480);
        setTimeout(() => this.beep(800, 110), 660);
        break;

      case 'ram_error':
        // 3 short beeps (First 64KB RAM parity error)
        this.beep(850, 100);
        setTimeout(() => this.beep(850, 100), 180);
        setTimeout(() => this.beep(850, 100), 360);
        break;

      case 'keyboard_error':
        // 1 long, 3 short beeps (8042 Keyboard controller error)
        this.beep(800, 380);
        setTimeout(() => this.beep(800, 110), 480);
        setTimeout(() => this.beep(800, 110), 650);
        setTimeout(() => this.beep(800, 110), 820);
        break;

      case 'gate_a20':
        // 1 long, 1 short beep (A20 Gate / High Memory HIMEM failure)
        this.beep(800, 360);
        setTimeout(() => this.beep(800, 120), 460);
        break;

      case 'continuous':
        // Continuous alert beeps (Power supply / Motherboard failure)
        for (let i = 0; i < 4; i++) {
          setTimeout(() => this.beep(920, 80), i * 140);
        }
        break;
    }
  }

  /**
   * IBM Model M / Buckling Spring Keyboard Click
   * Plays a crisp mechanical transient click upon keystroke in terminal
   */
  public playKeyClick(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      gain.gain.setValueAtTime(this.volume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // ignore
    }
  }

  /**
   * Vintage Teletype / Ticker Tape Mechanical Paper Feed Ratchet
   * Simulates dot-matrix / ticker printer tractor feed sprocket click
   */
  public playPaperFeed(pulses = 3): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < pulses; i++) {
        const t = now + i * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.02);

        gain.gain.setValueAtTime(this.volume * 0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.03);
      }
    } catch {
      // ignore
    }
  }

  /**
   * High-Voltage Electrostatic Static Noise / White Noise Crackle
   * Simulates the electrostatic discharge and shadow mask static crackle of CRT monitors
   */
  public playStaticNoise(durationMs = 850): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const durSec = durationMs / 1000;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * durSec);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Warm CRT static-noise algorithm (combination of white and pink noise)
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // 3-pole pinking filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        const pink = b0 + b1 + b2 + white * 0.5362;
        data[i] = pink * 0.25;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter to model the acoustic resonance of a CRT glass tube housing
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + durSec);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + durSec);
    } catch {
      // ignore
    }
  }

  /**
   * High-Pitched Static Sound Effect
   * Simulates the piercing electrostatic discharge, flyback transformer whine,
   * and high-frequency shadow mask static sizzle of a CRT monitor degaussing.
   */
  public playHighPitchedStatic(durationMs = 850): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const durSec = durationMs / 1000;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * durSec);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate sharp high-frequency white noise with electrostatic crackle pulses
      for (let i = 0; i < bufferSize; i++) {
        // High frequency white noise
        let sample = (Math.random() * 2 - 1) * 0.45;
        // Intermittent electrostatic micro-sparks/crackles
        if (Math.random() < 0.02) {
          sample += (Math.random() * 2 - 1) * 0.85;
        }
        data[i] = sample;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Highpass filter for piercing high-frequency static hiss (5.5kHz cutoff)
      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(5800, now);
      highpass.frequency.exponentialRampToValueAtTime(3600, now + durSec);

      // Peaking filter focused on 7.8kHz for high electrostatic presence
      const presenceFilter = this.ctx.createBiquadFilter();
      presenceFilter.type = 'peaking';
      presenceFilter.frequency.setValueAtTime(7800, now);
      presenceFilter.gain.setValueAtTime(9, now);
      presenceFilter.Q.setValueAtTime(2.2, now);

      const staticGain = this.ctx.createGain();
      staticGain.gain.setValueAtTime(this.volume * 0.48, now);
      staticGain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      noiseSource.connect(highpass);
      highpass.connect(presenceFilter);
      presenceFilter.connect(staticGain);
      staticGain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + durSec);

      // Piercing flyback line whistle (starts at 9.4kHz, sweeping down to 4.2kHz)
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(9400, now);
      whistleOsc.frequency.exponentialRampToValueAtTime(4200, now + durSec * 0.75);

      whistleGain.gain.setValueAtTime(this.volume * 0.25, now);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + durSec * 0.8);

      whistleOsc.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);

      whistleOsc.start(now);
      whistleOsc.stop(now + durSec);
    } catch {
      // ignore
    }
  }

  /**
   * CRT Degauss Coil discharge sound with high-pitched static sound effect
   * Simulates the complete magnetic correction process of vintage monitors:
   * 1. Solenoid/relay mechanical thump
   * 2. Heavy 60Hz alternating electromagnetic coil rumble & decay
   * 3. High-pitched electrostatic static sizzle & flyback whistle as shadow mask demagnetizes
   */
  public playDegauss(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Initial mechanical relay thump ("THUNK")
      const thunkOsc = this.ctx.createOscillator();
      const thunkGain = this.ctx.createGain();
      thunkOsc.type = 'square';
      thunkOsc.frequency.setValueAtTime(120, now);
      thunkOsc.frequency.exponentialRampToValueAtTime(25, now + 0.07);
      thunkGain.gain.setValueAtTime(this.volume * 0.65, now);
      thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      thunkOsc.connect(thunkGain);
      thunkGain.connect(this.ctx.destination);
      thunkOsc.start(now);
      thunkOsc.stop(now + 0.09);

      // 2. Heavy 60Hz electromagnetic mains coil hum decaying into silence
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, now); // 60Hz mains magnetic field
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.75);

      gain.gain.setValueAtTime(this.volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);

      // 3. High-pitched static sound effect (electrostatic discharge + flyback transformer whine)
      this.playHighPitchedStatic(850);
    } catch {
      // ignore
    }
  }

  /**
   * QBASIC MML (Music Macro Language) PLAY command interpreter
   * e.g., PLAY "T140 O3 L4 C D E F G A B O4 C"
   */
  public async playMML(mmlString: string): Promise<void> {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    let tempo = 120; // BPM
    let octave = 4;
    let defaultLength = 4; // quarter note

    const noteToSemitone: Record<string, number> = {
      C: 0, 'C#': 1, 'C+': 1, 'D-': 1,
      D: 2, 'D#': 3, 'D+': 3, 'E-': 3,
      E: 4,
      F: 5, 'F#': 6, 'F+': 6, 'G-': 6,
      G: 7, 'G#': 8, 'G+': 8, 'A-': 8,
      A: 9, 'A#': 10, 'A+': 10, 'B-': 10,
      B: 11
    };

    const tokens = mmlString.toUpperCase().replace(/\s+/g, '');
    let i = 0;

    const notesToPlay: Array<{ freq: number; durationMs: number }> = [];

    while (i < tokens.length) {
      const ch = tokens[i];
      if (ch === 'T') {
        // Tempo: T120
        i++;
        let numStr = '';
        while (i < tokens.length && /[0-9]/.test(tokens[i])) {
          numStr += tokens[i++];
        }
        if (numStr) tempo = parseInt(numStr, 10);
      } else if (ch === 'O') {
        // Octave: O3
        i++;
        if (i < tokens.length && /[0-8]/.test(tokens[i])) {
          octave = parseInt(tokens[i++], 10);
        }
      } else if (ch === '>') {
        octave = Math.min(8, octave + 1);
        i++;
      } else if (ch === '<') {
        octave = Math.max(0, octave - 1);
        i++;
      } else if (ch === 'L') {
        // Length: L4, L8, L16
        i++;
        let numStr = '';
        while (i < tokens.length && /[0-9]/.test(tokens[i])) {
          numStr += tokens[i++];
        }
        if (numStr) defaultLength = parseInt(numStr, 10);
      } else if (ch === 'P') {
        // Pause/Rest: P4
        i++;
        let numStr = '';
        while (i < tokens.length && /[0-9]/.test(tokens[i])) {
          numStr += tokens[i++];
        }
        const len = numStr ? parseInt(numStr, 10) : defaultLength;
        const durMs = (240000 / tempo) / len;
        notesToPlay.push({ freq: 0, durationMs: durMs });
      } else if (/[A-G]/.test(ch)) {
        let note = ch;
        i++;
        if (i < tokens.length && (tokens[i] === '#' || tokens[i] === '+' || tokens[i] === '-')) {
          note += tokens[i++];
        }
        let len = defaultLength;
        let numStr = '';
        while (i < tokens.length && /[0-9]/.test(tokens[i])) {
          numStr += tokens[i++];
        }
        if (numStr) len = parseInt(numStr, 10);

        let durMs = (240000 / tempo) / len;
        if (i < tokens.length && tokens[i] === '.') {
          durMs *= 1.5;
          i++;
        }

        const semitone = noteToSemitone[note] ?? 0;
        // MIDI note = (octave + 1) * 12 + semitone
        const midi = (octave + 1) * 12 + semitone;
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        notesToPlay.push({ freq, durationMs: durMs });
      } else {
        i++;
      }
    }

    // Sequentially play notes
    for (const item of notesToPlay) {
      if (item.freq > 0) {
        this.beep(item.freq, item.durationMs * 0.9);
      }
      await new Promise(res => setTimeout(res, item.durationMs));
    }
  }
}

export const audioSynth = new RetroAudioSynth();
