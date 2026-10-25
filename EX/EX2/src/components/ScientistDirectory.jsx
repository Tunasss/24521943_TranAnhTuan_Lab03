import { useState, useId } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople';

/**
 * ScientistDirectory component providing search, min-IQ filtering,
 * and sorting over pioneers using pure derived state and toSorted.
 * @param {Object} props
 * @param {ReadonlyArray<{id: string, name: string, age: number, iq: number}>} [props.initialData=SMART_PEOPLE]
 * @returns {JSX.Element}
 */
export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const [people] = useState(initialData);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState('iq-desc');

  const searchId = useId();
  const minIqId = useId();
  const sortId = useId();

  // Pure derived state computed synchronously during render - zero effect hooks, zero extra state
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

  return (
    <section aria-label="Pioneer Directory">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor={searchId}>Search</label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
          />
        </div>

        <div>
          <label htmlFor={minIqId}>Minimum IQ</label>
          <input
            id={minIqId}
            type="number"
            value={minIq === 0 ? '' : minIq}
            onChange={(e) => {
              const val = e.target.valueAsNumber;
              setMinIq(Number.isNaN(val) ? 0 : val);
            }}
          />
        </div>

        <div>
          <label htmlFor={sortId}>Sort by</label>
          <select
            id={sortId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="iq-desc">IQ (High to Low)</option>
            <option value="age-asc">Age (Young to Old)</option>
          </select>
        </div>
      </form>

      <ul>
        {visible.map((p) => (
          <li key={p.id}>
            {p.name} (Age: {p.age}) - IQ {p.iq}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ScientistDirectory;
