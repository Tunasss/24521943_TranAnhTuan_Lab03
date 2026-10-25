import { SMART_PEOPLE } from '../data/smartPeople';

/**
 * ScientistDirectory component rendering the static roster of smart pioneers.
 * @returns {JSX.Element}
 */
export function ScientistDirectory() {
  return (
    <section aria-label="Pioneer Directory">
      <ul>
        {SMART_PEOPLE.map((p) => (
          <li key={p.id}>
            {p.name} - IQ {p.iq}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ScientistDirectory;
