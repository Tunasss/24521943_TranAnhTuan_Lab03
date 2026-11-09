import { INITIAL_CRATES } from '../data/arena.js'

/**
 * Module-level server inventory stock map
 */
const serverStockMap = new Map(INITIAL_CRATES.map((crate) => [crate.id, crate.remainingStock]))

let randomFailureEnabled = true

/**
 * Configure random 25% 409 failure simulation
 * @param {boolean} enabled
 */
export function setRandomFailureEnabled(enabled) {
  randomFailureEnabled = enabled
}

/**
 * Reset server stock to initial baseline
 */
export function resetServerStock() {
  for (const crate of INITIAL_CRATES) {
    serverStockMap.set(crate.id, crate.remainingStock)
  }
}

/**
 * Simulated server clock synchronization offset in milliseconds
 * @returns {number}
 */
export function getServerOffsetMs() {
  return 85
}

/**
 * Claim an airdrop crate with simulated latency and 409 Conflict detection
 * @param {string} crateId
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ crateId: string, remainingStock: number }>}
 */
export function claimCrate(crateId, { signal } = {}) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'))
  }

  // Latency between 400ms and 900ms
  const latency = Math.floor(Math.random() * 500) + 400

  return new Promise((resolve, reject) => {
    let timer = null

    const onAbort = () => {
      if (timer !== null) clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)

      const currentStock = serverStockMap.get(crateId) ?? 0

      // Case 1: Out of stock -> 409 Conflict
      if (currentStock <= 0) {
        const error = new Error('409 Conflict: Crate has been completely looted by other players')
        error.status = 409
        return reject(error)
      }

      // Case 2: Concurrent collision race condition (25% random failure)
      if (randomFailureEnabled && Math.random() < 0.25) {
        const error = new Error('409 Conflict: Concurrent claim detected; lock reservation collision')
        error.status = 409
        return reject(error)
      }

      // Successful reservation
      const nextStock = currentStock - 1
      serverStockMap.set(crateId, nextStock)

      resolve({
        crateId,
        remainingStock: nextStock,
      })
    }, latency)

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
