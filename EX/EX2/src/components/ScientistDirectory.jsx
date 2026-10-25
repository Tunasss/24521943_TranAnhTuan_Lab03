import { useState, useId, useRef } from 'react';
import { INITIAL_PEOPLE } from '../data/pioneers';

/**
 * ScientistDirectory component managing interactive search, filter, sort, and deletion
 * of historical scientific pioneers using pure derived state and accessible focus management.
 */
export function ScientistDirectory() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(100);
  const [sortBy, setSortBy] = useState('name-asc');

  const searchId = useId();
  const minIqId = useId();
  const sortById = useId();
  const resultsHeadingRef = useRef(null);

  // Pure derived state during render - zero useEffect
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePeople = people
    .filter((person) => {
      const matchesName = person.name.toLowerCase().includes(normalizedQuery);
      const matchesIq = Number.isNaN(minIq) || person.iq >= minIq;
      return matchesName && matchesIq;
    })
    .toSorted((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'iq-asc':
          return a.iq - b.iq;
        case 'iq-desc':
          return b.iq - a.iq;
        default:
          return 0;
      }
    });

  const handleDelete = (id) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    resultsHeadingRef.current?.focus();
  };

  const handleReset = () => {
    setPeople(INITIAL_PEOPLE);
    setQuery('');
    setMinIq(100);
    setSortBy('name-asc');
    resultsHeadingRef.current?.focus();
  };

  return (
    <section aria-labelledby="directory-title">
      <header>
        <h1 id="directory-title">Interactive Pioneer Directory</h1>
        <p>Explore, filter, and discover history’s most influential scientific pioneers.</p>
      </header>

      <form
        role="search"
        aria-label="Pioneer search and filter controls"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor={searchId}>Search Pioneers by Name</label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Marie Curie, Turing..."
          />
        </div>

        <div>
          <label htmlFor={minIqId}>Minimum Estimated IQ ({minIq})</label>
          <input
            id={minIqId}
            type="number"
            min={0}
            max={250}
            value={minIq}
            onChange={(e) => {
              const val = e.target.valueAsNumber;
              setMinIq(Number.isNaN(val) ? 0 : val);
            }}
          />
        </div>

        <div>
          <label htmlFor={sortById}>Sort Records By</label>
          <select
            id={sortById}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Name (A &rarr; Z)</option>
            <option value="name-desc">Name (Z &rarr; A)</option>
            <option value="iq-desc">IQ (Highest First)</option>
            <option value="iq-asc">IQ (Lowest First)</option>
          </select>
        </div>

        <button type="button" onClick={handleReset}>
          Reset Filters
        </button>
      </form>

      <output role="status" aria-live="polite">
        Showing {visiblePeople.length} of {people.length} pioneers
      </output>

      <h2 ref={resultsHeadingRef} tabIndex={-1} id="results-heading">
        Pioneer Roster
      </h2>

      {visiblePeople.length === 0 ? (
        <p>No pioneers match your search criteria. Try adjusting the query or IQ threshold.</p>
      ) : (
        <ul aria-labelledby="results-heading">
          {visiblePeople.map((person) => (
            <li key={person.id}>
              <article aria-labelledby={`pioneer-name-${person.id}`}>
                <h3 id={`pioneer-name-${person.id}`}>{person.name}</h3>
                <p><strong>Field:</strong> {person.field}</p>
                <p><strong>Estimated IQ:</strong> {person.iq}</p>
                <p>{person.bio}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(person.id)}
                  aria-label={`Remove ${person.name} from directory`}
                >
                  Delete
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ScientistDirectory;
