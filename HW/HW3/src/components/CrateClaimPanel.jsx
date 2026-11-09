import { useState, useRef, useEffect } from 'react'
import { claimCrate } from '../api/claimApi.js'
import styles from './CrateClaimPanel.module.css'

const vndCurrencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

/**
 * CrateClaimPanel component.
 * Features an in-flight concurrency lock, optimistic stock reduction,
 * and automatic rollback upon 409 Conflict.
 *
 * @param {{
 *   crates: Array<{ id: string, title: string, priceVnd: number, remainingStock: number }>,
 *   onCratesChange: (updatedCrates: Array<any>) => void,
 *   phase: string
 * }} props
 */
export function CrateClaimPanel({ crates, onCratesChange, phase }) {
  const [claimingId, setClaimingId] = useState(null)
  const [claimError, setClaimError] = useState(null)
  const abortControllerRef = useRef(null)

  // Abort pending claim requests on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleClaim = async (crateId) => {
    // In-flight concurrency lock: reject duplicate submissions
    if (claimingId !== null) return

    const targetCrate = crates.find((c) => c.id === crateId)
    if (!targetCrate || targetCrate.remainingStock <= 0 || phase !== 'AIRDROP_LIVE') {
      return
    }

    // Capture defensive snapshot for potential rollback
    const snapshot = crates

    setClaimingId(crateId)
    setClaimError(null)

    // Optimistic inventory update (immutable functional reduction)
    const optimisticCrates = crates.map((c) =>
      c.id === crateId ? { ...c, remainingStock: Math.max(0, c.remainingStock - 1) } : c,
    )
    onCratesChange(optimisticCrates)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const result = await claimCrate(crateId, { signal: controller.signal })
      // Reconcile with authoritative server stock
      onCratesChange(
        crates.map((c) =>
          c.id === crateId ? { ...c, remainingStock: result.remainingStock } : c,
        ),
      )
    } catch (err) {
      if (err?.name === 'AbortError') return

      // Automatic snapshot rollback upon 409 Conflict
      onCratesChange(snapshot)
      setClaimError(err?.message || '409 Conflict: Airdrop inventory contention occurred')
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className={styles.container}>
      {claimError && (
        <section role="alert" className={styles.alert}>
          <p>{claimError}</p>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => setClaimError(null)}
          >
            Dismiss
          </button>
        </section>
      )}

      <div className={styles.grid}>
        {crates.map((crate) => {
          const isClaimingThis = claimingId === crate.id
          const isButtonDisabled =
            claimingId !== null || crate.remainingStock <= 0 || phase !== 'AIRDROP_LIVE'

          return (
            <article key={crate.id} className={styles.crateCard}>
              <h3 className={styles.crateTitle}>{crate.title}</h3>
              <p className={styles.price}>{vndCurrencyFormatter.format(crate.priceVnd)}</p>
              <p className={styles.stock}>
                Remaining Stock: <strong>{crate.remainingStock}</strong>
              </p>
              <button
                type="button"
                className={styles.claimBtn}
                disabled={isButtonDisabled}
                aria-busy={isClaimingThis}
                onClick={() => handleClaim(crate.id)}
              >
                {isClaimingThis
                  ? 'Claiming...'
                  : crate.remainingStock <= 0
                    ? 'Looted Out'
                    : phase !== 'AIRDROP_LIVE'
                      ? 'Drop Locked'
                      : 'Claim Airdrop'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
