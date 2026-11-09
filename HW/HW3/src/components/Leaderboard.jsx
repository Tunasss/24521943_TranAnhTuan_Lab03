import { useState, useId } from 'react'
import styles from './Leaderboard.module.css'

/**
 * Esports Squad Standings Leaderboard.
 * Derives filtered and sorted standings purely during render via ES2023 toSorted().
 * Absolutely zero useEffect hooks used.
 *
 * @param {{
 *   squads: Array<{
 *     squadId: string,
 *     squadName: string,
 *     wwcdCount: number,
 *     placementPts: number,
 *     killPts: number
 *   }>
 * }} props
 */
export function Leaderboard({ squads }) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('wwcd') // 'wwcd' | 'placement' | 'kills'

  const searchInputId = useId()
  const sortSelectId = useId()

  // Pure derivation during render scope
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSquads = squads
    .filter((s) => s.squadName.toLowerCase().includes(normalizedQuery))
    .toSorted((a, b) => {
      if (sortBy === 'wwcd') {
        return b.wwcdCount !== a.wwcdCount
          ? b.wwcdCount - a.wwcdCount
          : b.placementPts + b.killPts - (a.placementPts + a.killPts)
      }
      if (sortBy === 'placement') {
        return b.placementPts !== a.placementPts
          ? b.placementPts - a.placementPts
          : b.killPts - a.killPts
      }
      return b.killPts - a.killPts
    })

  return (
    <div className={styles.container}>
      <form
        role="search"
        className={styles.searchBar}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.controlGroup}>
          <label htmlFor={searchInputId} className={styles.label}>
            Filter Squad:
          </label>
          <input
            id={searchInputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search squad name (e.g. Cerberus)..."
            className={styles.input}
          />
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor={sortSelectId} className={styles.label}>
            Sort By:
          </label>
          <select
            id={sortSelectId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="wwcd">Winner Winner Chicken Dinner (WWCD)</option>
            <option value="placement">Placement Points</option>
            <option value="kills">Kill Points</option>
          </select>
        </div>

        <output role="status" aria-live="polite" className={styles.statusOutput}>
          Showing {visibleSquads.length} of {squads.length} squads
        </output>
      </form>

      <div
        className={styles.tableWrapper}
        tabIndex={0}
        role="region"
        aria-label="Championship Standings Data Table"
      >
        <table className={styles.table}>
          <caption className={styles.caption}>
            PUBG Vietnam Championship Official Standings
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.th}>
                Rank
              </th>
              <th scope="col" className={styles.th}>
                Squad Name
              </th>
              <th scope="col" className={styles.th}>
                WWCD
              </th>
              <th scope="col" className={styles.th}>
                Placement Pts
              </th>
              <th scope="col" className={styles.th}>
                Kill Pts
              </th>
              <th scope="col" className={styles.th}>
                Total Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleSquads.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No esports squads matched your query &ldquo;{query}&rdquo;.
                </td>
              </tr>
            ) : (
              visibleSquads.map((squad, index) => {
                const rank = index + 1
                const totalPts = squad.placementPts + squad.killPts
                const rankClass =
                  rank === 1
                    ? styles.rank1
                    : rank === 2
                      ? styles.rank2
                      : rank === 3
                        ? styles.rank3
                        : ''

                return (
                  <tr key={squad.squadId} className={styles.row}>
                    <td className={styles.td}>
                      <span className={`${styles.rankBadge} ${rankClass}`}>
                        {rank}
                      </span>
                    </td>
                    <th scope="row" className={styles.rowHeader}>
                      {squad.squadName}
                    </th>
                    <td className={styles.td}>{squad.wwcdCount}</td>
                    <td className={styles.td}>{squad.placementPts}</td>
                    <td className={styles.td}>{squad.killPts}</td>
                    <td className={styles.td}>
                      <span className={styles.totalPts}>{totalPts}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
