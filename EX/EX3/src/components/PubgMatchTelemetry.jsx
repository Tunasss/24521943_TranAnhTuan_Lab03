import { useState, useEffect } from 'react';
import { fetchKraftonPubgTelemetry } from '../api/fetchKraftonPubgTelemetry';

/**
 * PubgMatchTelemetry component rendering live match telemetry
 * with an explicit 4-state machine and AbortController lifecycle cleanup.
 * @param {Object} props
 * @param {string} [props.squadId='te'] - Target squad ID ('ces' | 'te' | 'ge').
 * @returns {JSX.Element}
 */
export function PubgMatchTelemetry({ squadId = 'te' }) {
  const [view, setView] = useState({ status: 'IDLE', data: null, error: null });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setView({ status: 'LOADING', data: null, error: null });

    fetchKraftonPubgTelemetry(squadId, { signal: controller.signal })
      .then((data) => {
        setView({ status: 'SUCCESS', data, error: null });
      })
      .catch((err) => {
        // Silently ignore AbortError on rapid squad switching or unmount
        if (err.name === 'AbortError') {
          return;
        }
        setView({
          status: 'ERROR',
          data: null,
          error: err.message || 'Satellite packet lost',
        });
      });

    return () => {
      controller.abort();
    };
  }, [squadId, retryTick]);

  return (
    <section aria-label="Squad Telemetry Display">
      {view.status === 'LOADING' && (
        <div
          aria-busy="true"
          aria-label="Loading squad match telemetry"
          style={{
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#131b2e',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            color: '#38bdf8',
            fontWeight: 600,
          }}
        >
          Connecting to KRAFTON satellite uplink...
        </div>
      )}

      {view.status === 'ERROR' && (
        <section
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '1.5rem',
            background: '#1c1917',
            border: '1px solid #7f1d1d',
            borderRadius: '0.75rem',
            color: '#f8fafc',
          }}
        >
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>
            Satellite Uplink Interrupted
          </h3>
          <p style={{ margin: '0 0 1rem 0', color: '#fca5a5' }}>
            {view.error}
          </p>
          <button
            type="button"
            onClick={() => setRetryTick((t) => t + 1)}
            style={{
              alignSelf: 'flex-start',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry Telemetry Fetch
          </button>
        </section>
      )}

      {view.status === 'SUCCESS' && view.data && (
        <article
          aria-labelledby="telemetry-squad-title"
          style={{
            minHeight: '220px',
            padding: '1.5rem',
            background: '#131b2e',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            color: '#f8fafc',
          }}
        >
          <h3
            id="telemetry-squad-title"
            style={{
              fontSize: '1.25rem',
              color: '#38bdf8',
              margin: '0 0 1rem 0',
            }}
          >
            {view.data.name} Match Telemetry
          </h3>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              rowGap: '0.5rem',
              columnGap: '1.5rem',
              margin: 0,
            }}
          >
            <dt style={{ fontWeight: 600, color: '#94a3b8' }}>Map</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{view.data.map}</dd>

            <dt style={{ fontWeight: 600, color: '#94a3b8' }}>Phase</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{view.data.phase}</dd>

            <dt style={{ fontWeight: 600, color: '#94a3b8' }}>Alive</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{view.data.alive} players</dd>

            <dt style={{ fontWeight: 600, color: '#94a3b8' }}>Kills</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{view.data.kills}</dd>

            <dt style={{ fontWeight: 600, color: '#94a3b8' }}>WWCD Probability</dt>
            <dd style={{ margin: 0, fontWeight: 600, color: '#4ade80' }}>
              {view.data.wwcdProb}
            </dd>

            <dt style={{ fontWeight: 600, color: '#94a3b8' }}>Status</dt>
            <dd style={{ margin: 0, fontWeight: 500, color: '#fbbf24' }}>
              {view.data.status}
            </dd>
          </dl>
        </article>
      )}
    </section>
  );
}

export default PubgMatchTelemetry;
