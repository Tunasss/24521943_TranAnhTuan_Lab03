/**
 * Asynchronous Abortable FIFO Sequence Replay Engine
 * Dispatches recorded notes sequentially scaled by playback speed.
 * Completely cancels all in-flight timers and stops active audio upon AbortSignal.
 */

function cancellableDelay(ms, signal) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'))
  }
  return new Promise((resolve, reject) => {
    let timer = null

    const onAbort = () => {
      if (timer !== null) clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, Math.max(0, ms))

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Replay an array of FIFO events with speed control and abort support
 * @param {Array<{ midi: number, freqHz: number, durationMs: number, deltaMs: number }>} events
 * @param {number} speed Speed multiplier (0.5, 1, 2)
 * @param {import('./PolyphonicSynth.js').PolyphonicSynth} synth
 * @param {{ signal?: AbortSignal }} options
 * @param {(midi: number, isPressed: boolean) => void} [onKeyVisualUpdate]
 */
export async function replaySequence(
  events,
  speed,
  synth,
  { signal } = {},
  onKeyVisualUpdate,
) {
  if (!events || events.length === 0) return
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const activeReleaseTimers = new Set()

  const clearAllReleaseTimers = () => {
    for (const timer of activeReleaseTimers) {
      clearTimeout(timer)
    }
    activeReleaseTimers.clear()
  }

  try {
    for (const ev of events) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      // Wait deltaMs before note attack
      const waitMs = ev.deltaMs / speed
      if (waitMs > 0) {
        await cancellableDelay(waitMs, signal)
      }

      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      // Trigger sound and visual keypress
      synth.noteOn(ev.midi, ev.freqHz)
      onKeyVisualUpdate?.(ev.midi, true)

      // Schedule note release after durationMs
      const releaseMs = ev.durationMs / speed
      await new Promise((resolve, reject) => {
        let releaseTimer = null

        const onAbortDuringNote = () => {
          if (releaseTimer !== null) {
            clearTimeout(releaseTimer)
            activeReleaseTimers.delete(releaseTimer)
          }
          synth.stopAll()
          onKeyVisualUpdate?.(ev.midi, false)
          reject(new DOMException('Aborted', 'AbortError'))
        }

        releaseTimer = setTimeout(() => {
          activeReleaseTimers.delete(releaseTimer)
          signal?.removeEventListener('abort', onAbortDuringNote)
          synth.noteOff(ev.midi)
          onKeyVisualUpdate?.(ev.midi, false)
          resolve()
        }, Math.max(20, releaseMs))

        activeReleaseTimers.add(releaseTimer)
        signal?.addEventListener('abort', onAbortDuringNote, { once: true })
      })
    }
  } catch (err) {
    clearAllReleaseTimers()
    synth.stopAll()
    throw err
  } finally {
    clearAllReleaseTimers()
  }
}
