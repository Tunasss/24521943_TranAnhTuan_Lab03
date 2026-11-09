import { useState, useEffect, useCallback } from 'react'

/**
 * Drift-Free PUBG Airdrop Countdown Timer Hook
 * Computes remaining time strictly from the absolute target epoch timestamp,
 * immune to event-loop lag, thread blocking, and background tab throttling.
 *
 * @param {number} targetEpochMs Target epoch timestamp when drop goes live
 * @param {number} [serverOffsetMs=0] Authoritative server clock delta
 * @returns {{ remainingMs: number, isLive: boolean }}
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const calcRemaining = useCallback(() => {
    return Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))
  }, [targetEpochMs, serverOffsetMs])

  // Initialize state with lazy initializer to compute initial delta without extra render
  const [remainingMs, setRemainingMs] = useState(calcRemaining)

  useEffect(() => {
    const sync = () => {
      setRemainingMs(calcRemaining())
    }

    // Immediate sync on mount / target update
    sync()

    // 200ms periodic tick
    const intervalId = setInterval(sync, 200)

    // Resynchronize immediately when tab regains focus from background throttling
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sync()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [targetEpochMs, serverOffsetMs, calcRemaining])

  return {
    remainingMs,
    isLive: remainingMs === 0,
  }
}
