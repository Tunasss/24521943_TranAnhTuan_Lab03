import { useState, useId, useRef } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople';
import styles from './ScientistDirectory.module.css';

/**
 * ScientistDirectory component providing search, min-IQ filtering,
 * sorting, immutable deletion, and reset with accessible focus management.
 * @param {Object} props
 * @param {ReadonlyArray<{id: string, name: string, age: number, iq: number}>} [props.initialData=SMART_PEOPLE]
 * @returns {JSX.Element}
 */
export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const [people, setPeople] = useState(initialData);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState('iq-desc');

  const searchId = useId();
  const minIqId = useId();
  const sortId = useId();
  const resultsHeadingRef = useRef(null);

  // Pure derived state computed synchronously during render - zero effect hooks
  const normalizedQuery = query.trim().toLowerCase();
  const visible = people
    .filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(normalizedQuery);
      const matchesIq = Number.isNaN(minIq) || p.iq >= minIq;
      return matchesQuery && matchesIq;
    })
    .toSorted((a, b) => {
      if (sortBy === 'iq-desc') {
        return b.iq - a.iq;
      }
      if (sortBy === 'age-asc') {
        return a.age - b.age;
      }
      return 0;
    });

  const handleDelete = (id) => {
    setPeople((prev) => prev.filter((x) => x.id !== id));
    // Programmatically move keyboard focus to results heading without effect hooks
    resultsHeadingRef.current?.focus();
  };

  const handleReset = () => {
    setPeople(initialData);
  };

  return (
    <section className={styles.directory} aria-label="Pioneer Directory">
      <header className={styles.header}>
        <h1 className={styles.title}>Interactive Pioneer Directory</h1>
        <p className={styles.subtitle}>
          Explore, filter, and sort history&apos;s greatest intellectual pioneers.
        </p>
      </header>

      <form
        role="search"
        className={styles.searchForm}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.field}>
          <label htmlFor={searchId} className={styles.label}>
            Search
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={minIqId} className={styles.label}>
            Minimum IQ
          </label>
          <input
            id={minIqId}
            type="number"
            value={minIq === 0 ? '' : minIq}
            onChange={(e) => {
              const val = e.target.valueAsNumber;
              setMinIq(Number.isNaN(val) ? 0 : val);
            }}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={sortId} className={styles.label}>
            Sort by
          </label>
          <select
            id={sortId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="iq-desc">IQ (High to Low)</option>
            <option value="age-asc">Age (Young to Old)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className={styles.resetButton}
        >
          Reset
        </button>
      </form>

      <output role="status" aria-live="polite" className={styles.status}>
        Found {visible.length} {visible.length === 1 ? 'pioneer' : 'pioneers'}
      </output>

      <h2
        ref={resultsHeadingRef}
        tabIndex={-1}
        className={styles.heading}
      >
        Pioneer Roster
      </h2>

      {visible.length === 0 ? (
        <p className={styles.emptyState}>
          No pioneers match your search criteria.
        </p>
      ) : (
        <ul className={styles.list}>
          {visible.map((p) => (
            <li key={p.id} className={styles.item}>
              <span className={styles.itemInfo}>
                {p.name} (Age: {p.age}) - IQ {p.iq}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                aria-label={`Delete ${p.name}`}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ScientistDirectory;
