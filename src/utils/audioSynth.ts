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
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < steps; i++) {
        const stepTime = now + i * 0.045;
        // High click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'sawtooth';
        clickOsc.frequency.setValueAtTime(i % 2 === 0 ? 120 : 95, stepTime);

        clickGain.gain.setValueAtTime(this.volume * 0.25, stepTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.025);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickOsc.start(stepTime);
        clickOsc.stop(stepTime + 0.03);
      }
    } catch {
      // ignore
    }
  }

  /**
   * CRT Degauss Coil discharge sound
   * Low hum followed by decaying magnetic resonance
   */
  public playDegauss(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, now); // 60Hz mains magnetic field
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.7);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
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
