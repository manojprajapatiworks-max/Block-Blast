// Web Audio API Sound Synthesizer for Block Blast
// 100% Client-side synthetic audio - no asset loads/fails.

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  if (!audioCtx) {
    // Create audio context supporting prefix
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (!enabled && audioCtx) {
    audioCtx.close().then(() => {
      audioCtx = null;
    });
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// Mobile Haptics integration
export function triggerHaptic(durationOrPattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(durationOrPattern);
    } catch {
      // Ignore vibration failures if blocked by iframe sandbox permissions
    }
  }
}

// Soft tap for selecting/moving pieces
export function playTap() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);

  // Soft tactile tick
  triggerHaptic(10);
}

// Placed piece thud
export function playPlace() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.16);

  // Medium haptic double pulse
  triggerHaptic([15, 10, 15]);
}

// Row clearing arpeggio (pitch increases with count of lines cleared)
export function playClear(linesCount: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale notes
  const notesToPlay: number[] = [];

  // Compose rising arpeggio based on cleared lines
  const steps = linesCount * 3;
  for (let i = 0; i < steps; i++) {
    const scaleIndex = (i * 2) % baseNotes.length;
    notesToPlay.push(baseNotes[scaleIndex]);
  }

  const duration = 0.08; // speed of notes
  notesToPlay.forEach((freq, idx) => {
    const playTime = ctx.currentTime + idx * duration;
    
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, playTime);

    // Warm thickener oscillator
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(freq * 0.5, playTime);

    gain.gain.setValueAtTime(0.12, playTime);
    gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.25);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(playTime);
    subOsc.start(playTime);
    osc.stop(playTime + 0.3);
    subOsc.stop(playTime + 0.3);
  });

  // Dynamic tactile burst
  const hapticPattern = Array(linesCount).fill(30).reduce((acc, val, i) => {
    acc.push(val);
    if (i < linesCount - 1) acc.push(20); // space
    return acc;
  }, [] as number[]);

  triggerHaptic(hapticPattern);
}

// Combo multiplier sound effects (energetic hyper-pep pitch modulation!)
export function playCombo(comboCount: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const multiplier = Math.min(comboCount, 8);
  const baseFreq = 440 + multiplier * 80;

  const times = [0, 0.06, 0.12];
  times.forEach((t) => {
    const playTime = ctx.currentTime + t;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth"; // retro laser sound
    osc.frequency.setValueAtTime(baseFreq, playTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, playTime + 0.15);

    // Apply high frequency filter for pleasant tone
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, playTime);

    // Fade out volume
    gain.gain.setValueAtTime(0.06, playTime);
    gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(playTime);
    osc.stop(playTime + 0.2);
  });

  // Haptic kick
  triggerHaptic([20, 15, 30]);
}

// Classic down-ascending Game Over synthesizer theme
export function playGameOver() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const time = ctx.currentTime;
  
  // Retro downward arpeggio
  const pitches = [523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63];
  pitches.forEach((freq, idx) => {
    const playTime = time + idx * 0.15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, playTime);
    
    gain.gain.setValueAtTime(0.1, playTime);
    gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(playTime);
    osc.stop(playTime + 0.4);
  });

  // Follow with a final resolving dramatic minor chord
  const finalTime = time + pitches.length * 0.15;
  const chord = [220.00, 261.63, 329.63, 440.00]; // A Minor chord
  chord.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, finalTime);

    gain.gain.setValueAtTime(0.08, finalTime);
    gain.gain.exponentialRampToValueAtTime(0.001, finalTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(finalTime);
    osc.stop(finalTime + 1.2);
  });

  // Long tactile death buzz
  triggerHaptic([80, 50, 80]);
}

// Quick level upgrade celebration chime
export function playLevelUp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
  const delay = 0.08;

  notes.forEach((freq, i) => {
    const playTime = ctx.currentTime + i * delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, playTime);

    gain.gain.setValueAtTime(0.1, playTime);
    gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(playTime);
    osc.stop(playTime + 0.4);
  });

  triggerHaptic([100, 30, 100]);
}
