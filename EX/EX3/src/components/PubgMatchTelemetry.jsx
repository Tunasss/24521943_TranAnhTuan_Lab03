import { useState, useEffect } from 'react';
import { SQUADS } from '../data/pubgSquads';
import { fetchKraftonPubgTelemetry } from '../api/telemetryApi';

/**
 * PubgMatchTelemetry component rendering real-time esports match statistics
 * governed by an explicit 4-state machine and lifecycle AbortController cleanup.
 */
export function PubgMatchTelemetry() {
  const [selectedSquadId, setSelectedSquadId] = useState(SQUADS[0].id);
  const [retryTick, setRetryTick] = useState(0);

  // Four-state machine: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR' - NO boolean soup
  const [telemetryState, setTelemetryState] = useState({
    status: 'IDLE',
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadTelemetry() {
      setTelemetryState({ status: 'LOADING', data: null, error: null });

      try {
        const result = await fetchKraftonPubgTelemetry(selectedSquadId, {
          signal: controller.signal,
        });
        setTelemetryState({ status: 'SUCCESS', data: result, error: null });
      } catch (err) {
        // Silently ignore aborted requests from rapid squad switching or unmount
        if (err.name === 'AbortError') {
          return;
        }
        setTelemetryState({
          status: 'ERROR',
          data: null,
          error: err.message || 'Telemetry connection failure.',
        });
      }
    }

    loadTelemetry();

    return () => {
      controller.abort();
    };
  }, [selectedSquadId, retryTick]);

  return (
    <article aria-labelledby="telemetry-title">
      <header>
        <h1 id="telemetry-title">PUBG VN Live Match Telemetry</h1>
        <p>Real-time telemetry uplink from Erangel Grand Finals.</p>
      </header>

      <fieldset>
        <legend>Select PUBG Vietnam Squad</legend>
        <div>
          {SQUADS.map((squad) => (
            <button
              key={squad.id}
              type="button"
              aria-pressed={selectedSquadId === squad.id}
              onClick={() => setSelectedSquadId(squad.id)}
            >
              {squad.name} ({squad.tag})
            </button>
          ))}
        </div>
      </fieldset>

      {/* State Machine Rendering */}
      {telemetryState.status === 'LOADING' && (
        <section
          aria-busy="true"
          aria-label="Loading squad match telemetry"
          style={{ minHeight: '220px' }}
        >
          <p>Connecting to KRAFTON telemetry uplink...</p>
        </section>
      )}

      {telemetryState.status === 'ERROR' && (
        <section role="alert" aria-live="assertive">
          <h2>Telemetry Uplink Error</h2>
          <p>{telemetryState.error}</p>
          <button
            type="button"
            onClick={() => setRetryTick((t) => t + 1)}
          >
            Retry Telemetry Fetch
          </button>
        </section>
      )}

      {telemetryState.status === 'SUCCESS' && telemetryState.data && (
        <section aria-labelledby="squad-result-title">
          <h2 id="squad-result-title">
            {telemetryState.data.squadName} [{telemetryState.data.tag}] - Match Status
          </h2>
          <dl>
            <dt>Match Placement</dt>
            <dd>{telemetryState.data.matchRank}</dd>
            <dt>Total Team Kills</dt>
            <dd>{telemetryState.data.totalKills}</dd>
            <dt>Total Damage Dealt</dt>
            <dd>{telemetryState.data.damageDealt} HP</dd>
            <dt>Survival Duration</dt>
            <dd>{telemetryState.data.survivalDuration}</dd>
            <dt>Squad MVP</dt>
            <dd>{telemetryState.data.mvpPlayer}</dd>
          </dl>
        </section>
      )}
    </article>
  );
}

export default PubgMatchTelemetry;
