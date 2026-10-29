// Game feedback — haptics + procedural sound effects.
//
// All functions are safe no-ops on servers, in private mode without
// audio permission, and on devices without the Vibration API.
// Procedural WebAudio tones avoid any CC0 asset download; the sounds
// are small, fast, and always "in brand" (bells + knocks).

type Fx =
  | "select"      // picking up a piece
  | "move"        // placing a piece
  | "capture"     // taking an opponent piece
  | "promote"     // pawn promotion
  | "check"       // (reserved, Imperial Kings only uses it for king-capture)
  | "win"         // you won
  | "loss"        // you lost
  | "draw";       // drawn game

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

/** Persist mute state across reloads so the user's choice sticks. */
function readMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("sok.muted") === "1";
  } catch {
    return false;
  }
}
muted = readMuted();

export function isMuted(): boolean {
  return muted;
}
export function setMuted(next: boolean): void {
  muted = next;
  if (typeof window !== "undefined") {
    try { localStorage.setItem("sok.muted", next ? "1" : "0"); } catch {}
  }
}

/** Haptic buzz — ignored by desktop browsers + iOS Safari (which has
 *  no Vibration API support outside PWA installed mode). Mobile Chrome
 *  / Firefox / Android browsers all honour it. */
export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    (navigator as Navigator & { vibrate: (p: number | number[]) => void })
      .vibrate(pattern);
  } catch {}
}

/* ------------------------- Procedural tones ------------------------ */

type Note = {
  freq: number;        // Hz
  dur: number;         // seconds
  type?: OscillatorType;
  gain?: number;       // 0–1
  attack?: number;     // seconds — fade-in
  release?: number;    // seconds — fade-out
  delay?: number;      // seconds — relative start
};

function playNote(c: AudioContext, note: Note, baseTime: number): void {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = note.type ?? "sine";
  osc.frequency.value = note.freq;
  const start = baseTime + (note.delay ?? 0);
  const peak = note.gain ?? 0.22;
  const attack = note.attack ?? 0.005;
  const release = note.release ?? 0.08;

  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + note.dur + release);

  osc.connect(g);
  g.connect(c.destination);
  osc.start(start);
  osc.stop(start + attack + note.dur + release + 0.05);
}

/** Short noise burst — used for the "knock" when a piece lands. */
function playNoise(c: AudioContext, dur: number, baseTime: number, gain = 0.18): void {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = gain;
  // Low-pass to mellow it into a knock, not a hiss.
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start(baseTime);
  src.stop(baseTime + dur + 0.02);
}

/* ------------------------------- API ------------------------------- */

/** Fire the appropriate feedback (sound + haptic) for an event. */
export function fx(kind: Fx): void {
  if (muted) {
    // Still buzz the device — haptic doesn't make audio noise.
    if (kind === "move" || kind === "capture") vibrate(10);
    if (kind === "win") vibrate([30, 60, 30]);
    return;
  }
  const c = getCtx();
  if (!c) return;
  // Resume from suspended if the browser auto-paused us before the
  // user's first gesture. If still suspended, bail silently — the next
  // user gesture will unlock it.
  if (c.state === "suspended") {
    c.resume().catch(() => {});
    if (c.state === "suspended") return;
  }
  const now = c.currentTime;

  switch (kind) {
    case "select":
      playNote(c, { freq: 880, dur: 0.03, type: "triangle", gain: 0.08 }, now);
      break;

    case "move":
      // Soft wood-knock: short low noise + tiny tonal thump.
      playNoise(c, 0.04, now, 0.14);
      playNote(c, { freq: 220, dur: 0.04, type: "sine", gain: 0.12 }, now);
      vibrate(10);
      break;

    case "capture":
      // Harder knock — brighter noise + metallic bell overtone.
      playNoise(c, 0.06, now, 0.25);
      playNote(c, { freq: 180, dur: 0.05, type: "sine", gain: 0.14 }, now);
      playNote(c, { freq: 440, dur: 0.08, type: "triangle", gain: 0.08, delay: 0.01 }, now);
      vibrate(18);
      break;

    case "promote":
      // Rising arpeggio C → E → G.
      playNote(c, { freq: 523, dur: 0.08, type: "triangle", gain: 0.12 }, now);
      playNote(c, { freq: 659, dur: 0.08, type: "triangle", gain: 0.12, delay: 0.07 }, now);
      playNote(c, { freq: 784, dur: 0.14, type: "triangle", gain: 0.14, delay: 0.14 }, now);
      vibrate([10, 30, 10]);
      break;

    case "win":
      // Trumpet-ish fanfare: C–G–C octave.
      playNote(c, { freq: 523, dur: 0.1, type: "sawtooth", gain: 0.12 }, now);
      playNote(c, { freq: 784, dur: 0.1, type: "sawtooth", gain: 0.12, delay: 0.09 }, now);
      playNote(c, { freq: 1047, dur: 0.3, type: "sawtooth", gain: 0.15, delay: 0.18 }, now);
      vibrate([30, 60, 30, 60]);
      break;

    case "loss":
      // Falling 2-note minor cadence.
      playNote(c, { freq: 440, dur: 0.14, type: "sine", gain: 0.1 }, now);
      playNote(c, { freq: 349, dur: 0.3, type: "sine", gain: 0.1, delay: 0.14 }, now);
      vibrate(60);
      break;

    case "draw":
      playNote(c, { freq: 523, dur: 0.14, type: "sine", gain: 0.1 }, now);
      playNote(c, { freq: 523, dur: 0.14, type: "sine", gain: 0.1, delay: 0.16 }, now);
      vibrate(40);
      break;

    case "check":
      playNote(c, { freq: 988, dur: 0.08, type: "square", gain: 0.1 }, now);
      playNote(c, { freq: 988, dur: 0.08, type: "square", gain: 0.1, delay: 0.11 }, now);
      vibrate(20);
      break;
  }
}
