/**
 * Tiny WebAudio synth for UI and game sounds — no audio assets needed.
 * The AudioContext is created lazily on first use (must follow a user gesture).
 */

let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOptions {
  freq: number;
  /** Seconds. */
  duration: number;
  type?: OscillatorType;
  volume?: number;
  /** Linear glide target frequency. */
  glideTo?: number;
  delay?: number;
}

function tone({ freq, duration, type = "sine", volume = 0.12, glideTo, delay = 0 }: ToneOptions) {
  const ac = audio();
  if (!ac || muted) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.linearRampToValueAtTime(glideTo, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  setMuted(value: boolean) {
    muted = value;
  },
  isMuted: () => muted,

  /** Generic UI tap. */
  click() {
    tone({ freq: 660, duration: 0.06, type: "triangle", volume: 0.08 });
  },
  /** Window / menu open. */
  open() {
    tone({ freq: 420, duration: 0.1, type: "sine", glideTo: 620, volume: 0.09 });
  },
  /** Window close. */
  close() {
    tone({ freq: 520, duration: 0.12, type: "sine", glideTo: 280, volume: 0.09 });
  },
  /** Trash / delete. */
  trash() {
    tone({ freq: 300, duration: 0.16, type: "sawtooth", glideTo: 90, volume: 0.07 });
  },

  /** Snake: food eaten. */
  eat() {
    tone({ freq: 880, duration: 0.07, type: "square", volume: 0.06 });
    tone({ freq: 1320, duration: 0.07, type: "square", volume: 0.05, delay: 0.06 });
  },
  /** Game over. */
  gameOver() {
    tone({ freq: 330, duration: 0.18, type: "sawtooth", volume: 0.08 });
    tone({ freq: 247, duration: 0.18, type: "sawtooth", volume: 0.08, delay: 0.16 });
    tone({ freq: 165, duration: 0.3, type: "sawtooth", volume: 0.08, delay: 0.32 });
  },
  /** Game won. */
  win() {
    tone({ freq: 523, duration: 0.12, type: "triangle", volume: 0.1 });
    tone({ freq: 659, duration: 0.12, type: "triangle", volume: 0.1, delay: 0.11 });
    tone({ freq: 784, duration: 0.12, type: "triangle", volume: 0.1, delay: 0.22 });
    tone({ freq: 1047, duration: 0.24, type: "triangle", volume: 0.1, delay: 0.33 });
  },
  /** Board piece placed. */
  place() {
    tone({ freq: 500, duration: 0.05, type: "triangle", volume: 0.09 });
  },
  /** Memory card flip. */
  flip() {
    tone({ freq: 740, duration: 0.05, type: "sine", volume: 0.07 });
  },
  /** Memory pair matched. */
  match() {
    tone({ freq: 660, duration: 0.09, type: "triangle", volume: 0.09 });
    tone({ freq: 990, duration: 0.12, type: "triangle", volume: 0.09, delay: 0.08 });
  },
  /** Memory pair missed. */
  miss() {
    tone({ freq: 260, duration: 0.14, type: "sine", glideTo: 180, volume: 0.07 });
  },
  /** Simon pads — one distinct note per pad. */
  pad(index: number) {
    const freqs = [330, 392, 494, 587];
    tone({ freq: freqs[index % 4]!, duration: 0.28, type: "triangle", volume: 0.12 });
  },
  /** Pong: ball bounced off a paddle. */
  pong() {
    tone({ freq: 460, duration: 0.05, type: "square", volume: 0.07 });
  },
  /** Pong: point scored. */
  point() {
    tone({ freq: 700, duration: 0.1, type: "triangle", glideTo: 880, volume: 0.09 });
  },
};
