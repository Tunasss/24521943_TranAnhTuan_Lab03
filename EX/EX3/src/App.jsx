import { useState } from 'react';
import { PUBG_VN_SQUADS } from './data/squads';
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry';
import styles from './App.module.css';

export function App() {
  const [selectedSquad, setSelectedSquad] = useState('te');

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          PUBG VN Live Match Telemetry
        </h1>
        <p className={styles.subtitle}>
          KRAFTON Official Satellite Esports Uplink &bull; Erangel Grand Finals
        </p>
      </header>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Select squad</legend>
        <div className={styles.buttonGroup}>
          {PUBG_VN_SQUADS.map((squad) => {
            const isSelected = selectedSquad === squad.id;
            return (
              <button
                key={squad.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedSquad(squad.id)}
                className={isSelected ? styles.squadBtnActive : styles.squadBtn}
              >
                {squad.name} ({squad.id.toUpperCase()})
              </button>
            );
          })}
        </div>
      </fieldset>

      <PubgMatchTelemetry squadId={selectedSquad} />
    </main>
  );
}

export default App;
