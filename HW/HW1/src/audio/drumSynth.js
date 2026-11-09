/**
 * Production Studio Drum Kit - Click-Free Web Audio Synthesis Engine
 * Lazily creates a single shared AudioContext upon user gesture.
 * Shapes sound via exponential envelope to eliminate DC offset clicks.
 */

let sharedAudioContext = null

/**
 * Trigger low-latency synthesized drum sound and return peak level (0.0 to 1.0)
 * @param {{ id: string, label: string, code: string, freqHz: number }} pad
 * @returns {number} Peak decibel level normalized between 0.0 and 1.0
 */
export function playPad(pad) {
  if (typeof window === 'undefined') return 0

  if (!sharedAudioContext) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext
    if (!AudioCtxClass) return 0
    sharedAudioContext = new AudioCtxClass()
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume()
  }

  const now = sharedAudioContext.currentTime
  const osc = sharedAudioContext.createOscillator()
  const gain = sharedAudioContext.createGain()

  // Dynamic frequency shaping for authentic percussion timbre
  osc.frequency.setValueAtTime(pad.freqHz, now)
  if (pad.freqHz < 150) {
    // Pitch envelope drop for Kick / Tom punch
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.14)
  }

  // Peak amplitude calculation (varied slightly by drum instrument)
  const peakLevel = pad.id === 'pad-w' ? 0.95 : pad.id === 'pad-k' ? 0.9 : 0.82

  // Click-free exponential decay envelope
  gain.gain.setValueAtTime(peakLevel, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)

  // Connect Web Audio graph
  osc.connect(gain)
  gain.connect(sharedAudioContext.destination)

  // Trigger oscillator lifecycle
  osc.start(now)
  osc.stop(now + 0.16)

  // Disconnect nodes upon completion to prevent audio thread memory leaks
  osc.onended = () => {
    osc.disconnect()
    gain.disconnect()
  }

  return peakLevel
}
