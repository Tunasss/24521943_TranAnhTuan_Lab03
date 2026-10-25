import { PUBG_VN_SQUADS } from '../data/squads';

/**
 * Simulates remote KRAFTON PUBG telemetry uplink with artificial latency,
 * 35% packet loss failure rate, and explicit AbortSignal lifecycle support.
 * @param {string} squadId - Target squad ID ('ces', 'te', 'ge').
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel pending request.
 * @returns {Promise<Object>} Match telemetry object.
 */
export function fetchKraftonPubgTelemetry(squadId, { signal } = {}) {
  // If signal is already aborted before starting, reject immediately
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return new Promise((resolve, reject) => {
    // Random latency between 600ms and 1500ms
    const delay = Math.floor(Math.random() * 900) + 600;
    let timeoutId;

    const handleAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', handleAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    timeoutId = setTimeout(() => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }

      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      // 35% simulated satellite packet loss
      if (Math.random() < 0.35) {
        reject(new Error('Satellite packet lost'));
        return;
      }

      const squad = PUBG_VN_SQUADS.find((s) => s.id === squadId);
      if (!squad) {
        reject(new Error(`Squad with ID "${squadId}" not found in telemetry registry`));
        return;
      }

      resolve(squad);
    }, delay);
  });
}

export default fetchKraftonPubgTelemetry;
