// Every sound in the game is a short WebAudio tone: no audio files to ship,
// no network request, and a mute switch that stays off until the player asks.
//
// The context is made lazily on the first user gesture, because browsers only
// let audio start after one. In screenshot mode nothing ever calls play, so
// the context is never made there.

let context = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
}

function ensureContext() {
  if (context !== null) return context;
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContext) return null;
  context = new AudioContext();
  return context;
}

function tone(frequency, startIn, duration, type, volume) {
  const audio = ensureContext();
  if (audio === null || muted) return;
  if (audio.state === 'suspended') void audio.resume();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  const start = audio.currentTime + startIn;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export function playClick() {
  tone(620, 0, 0.06, 'sine', 0.12);
}

export function playFound() {
  tone(523.25, 0, 0.12, 'sine', 0.2);
  tone(783.99, 0.09, 0.18, 'sine', 0.2);
}

export function playWrong() {
  tone(160, 0, 0.22, 'square', 0.12);
}

export function playHint() {
  tone(880, 0, 0.1, 'sine', 0.12);
  tone(1174.66, 0.08, 0.14, 'sine', 0.12);
}

export function playLevelDone() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, index) => tone(frequency, index * 0.11, 0.22, 'sine', 0.2));
}

export function playVictory() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51];
  notes.forEach((frequency, index) => tone(frequency, index * 0.13, 0.26, 'triangle', 0.2));
}

export function playFailed() {
  tone(392, 0, 0.25, 'sawtooth', 0.1);
  tone(311.13, 0.2, 0.35, 'sawtooth', 0.1);
}
