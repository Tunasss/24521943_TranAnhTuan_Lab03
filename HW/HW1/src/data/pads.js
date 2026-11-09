/**
 * Production Studio Drum Kit - Pad Data Specifications
 * Mapped to physical keyboard codes (e.code) to ensure IME/UniKey resilience.
 */

export const DRUM_PADS = Object.freeze([
  Object.freeze({ id: 'pad-w', label: 'Kick', code: 'KeyW', freqHz: 60, keyHint: 'W' }),
  Object.freeze({ id: 'pad-a', label: 'Snare', code: 'KeyA', freqHz: 200, keyHint: 'A' }),
  Object.freeze({ id: 'pad-s', label: 'Hi-Hat', code: 'KeyS', freqHz: 800, keyHint: 'S' }),
  Object.freeze({ id: 'pad-d', label: 'Tom', code: 'KeyD', freqHz: 130, keyHint: 'D' }),
  Object.freeze({ id: 'pad-j', label: 'Clap', code: 'KeyJ', freqHz: 350, keyHint: 'J' }),
  Object.freeze({ id: 'pad-k', label: 'Crash', code: 'KeyK', freqHz: 650, keyHint: 'K' }),
  Object.freeze({ id: 'pad-l', label: 'Ride', code: 'KeyL', freqHz: 450, keyHint: 'L' }),
])

export const PAD_MAP = new Map(DRUM_PADS.map((pad) => [pad.code, pad]))
