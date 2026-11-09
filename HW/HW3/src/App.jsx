import { useState } from 'react'
import { INITIAL_CRATES, SQUADS } from './data/arena.js'
import { getServerOffsetMs } from './api/claimApi.js'
import { usePubgAirdropTimer } from './hooks/usePubgAirdropTimer.js'
import { AirdropCountdown } from './components/AirdropCountdown.jsx'
import { CrateClaimPanel } from './components/CrateClaimPanel.jsx'
import { Leaderboard } from './components/Leaderboard.jsx'
import styles from './App.module.css'

export default function App() {
  const [crates, setCrates] = useState(INITIAL_CRATES)

  // Target epoch timestamp for the earliest airdrop
  const targetEpochMs = INITIAL_CRATES[0]?.dropEpochMs || 0
  const serverOffsetMs = getServerOffsetMs()

  // Drift-free countdown timer hook
  const { remainingMs } = usePubgAirdropTimer(targetEpochMs, serverOffsetMs)

  // Total stock of remaining crates
  const totalStock = crates.reduce((sum, c) => sum + c.remainingStock, 0)

  // Derive active drop phase purely during render
  let phase = 'WARMUP'
  if (remainingMs > 0) {
    phase = 'WARMUP'
  } else if (totalStock <= 0) {
    phase = 'LOOTED_OUT'
  } else {
    phase = 'AIRDROP_LIVE'
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>KRAFTON x PUBG Vietnam Championship & Airdrop Arena</h1>
        <p className={styles.subtitle}>
          Synchronized flash airdrop claiming with optimistic inventory management and live esports
          leaderboard.
        </p>
      </header>

      {/* Section 1: Airdrop Countdown */}
      <section aria-labelledby="countdown-heading" className={styles.section}>
        <h2 id="countdown-heading" className={styles.sectionHeading}>
          Airdrop Radar Telemetry & Countdown
        </h2>
        <AirdropCountdown
          remainingMs={remainingMs}
          totalStock={totalStock}
          isExpired={false}
        />
      </section>

      {/* Section 2: Exclusive Crates Claim Panel */}
      <section aria-labelledby="crates-heading" className={styles.section}>
        <h2 id="crates-heading" className={styles.sectionHeading}>
          Exclusive Airdrop Crates & VIP Passes
        </h2>
        <CrateClaimPanel
          crates={crates}
          onCratesChange={setCrates}
          phase={phase}
        />
      </section>

      {/* Section 3: Live Championship Leaderboard */}
      <section aria-labelledby="leaderboard-heading" className={styles.section}>
        <h2 id="leaderboard-heading" className={styles.sectionHeading}>
          PVS Live Squad Standings & Performance
        </h2>
        <Leaderboard squads={SQUADS} />
      </section>
    </main>
  )
}
