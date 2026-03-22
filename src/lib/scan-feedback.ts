let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playBeep(frequency = 800, duration = 150) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Audio not supported — silent fail
  }
}

export function vibrate(pattern: number | number[] = 50) {
  try {
    navigator?.vibrate?.(pattern);
  } catch {
    // Vibration not supported — silent fail
  }
}

export function scanSuccess() {
  playBeep(800, 150);
  vibrate(50);
}

export function scanError() {
  playBeep(300, 300);
  vibrate([50, 50, 50]);
}
