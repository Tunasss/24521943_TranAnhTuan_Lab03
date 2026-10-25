import { useState } from 'react';
import { PUBG_VN_SQUADS } from './data/squads';
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry';

export function App() {
  const [selectedSquad, setSelectedSquad] = useState('te');

  return (
    <main style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
          PUBG VN Live Match Telemetry
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          KRAFTON Official Satellite Esports Uplink &bull; Erangel Grand Finals
        </p>
      </header>

      <fieldset
        style={{
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          background: '#0f172a',
        }}
      >
        <legend
          style={{
            padding: '0 0.5rem',
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          Select squad
        </legend>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {PUBG_VN_SQUADS.map((squad) => {
            const isSelected = selectedSquad === squad.id;
            return (
              <button
                key={squad.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedSquad(squad.id)}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid #475569',
                  backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  transition: 'all 0.15s ease',
                }}
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
