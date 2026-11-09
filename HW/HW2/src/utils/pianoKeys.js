/**
 * 88-Key Acoustic Piano Generation Utility
 * Computes frequency and note nomenclature algorithmically from MIDI numbers.
 * Prohibits hardcoded 88-element data structures.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Generate 88 piano key definitions from MIDI 21 (A0) to MIDI 108 (C8)
 * Formula: f = 440 * 2^((midi - 69) / 12)
 *
 * @returns {Array<{ midi: number, noteName: string, isBlack: boolean, freqHz: number }>}
 */
export function generatePianoKeys() {
  const keys = []

  for (let midi = 21; midi <= 108; midi++) {
    const noteIndex = midi % 12
    const octave = Math.floor(midi / 12) - 1
    const baseName = NOTE_NAMES[noteIndex]
    const noteName = `${baseName}${octave}`
    const isBlack = baseName.includes('#')
    const freqHz = 440 * 2 ** ((midi - 69) / 12)

    keys.push(
      Object.freeze({
        midi,
        noteName,
        isBlack,
        freqHz: Number(freqHz.toFixed(2)),
      }),
    )
  }

  return Object.freeze(keys)
}

/**
 * Count total, white, and black keys for mathematical verification
 * @param {Array<{ isBlack: boolean }>} [keys]
 * @returns {{ total: number, whiteCount: number, blackCount: number }}
 */
export function getKeyCounts(keys = generatePianoKeys()) {
  const total = keys.length
  const blackCount = keys.filter((k) => k.isBlack).length
  const whiteCount = total - blackCount

  return { total, whiteCount, blackCount }
}
