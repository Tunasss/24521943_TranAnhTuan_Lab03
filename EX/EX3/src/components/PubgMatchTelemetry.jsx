import { useState, useEffect } from 'react';
import { fetchKraftonPubgTelemetry } from '../api/fetchKraftonPubgTelemetry';
import styles from './PubgMatchTelemetry.module.css';

/**
 * PubgMatchTelemetry component rendering real-time esports match statistics
 * with an explicit 4-state machine, AbortController lifecycle cleanup, and skeleton loading.
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
        // Silently ignore AbortError on rapid squad switching or component unmount
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
    <div className={styles.container}>
      {/* 1. LOADING: Skeleton placeholder with min-height: 220px and visually hidden text */}
      {view.status === 'LOADING' && (
        <section aria-busy="true" className={styles.skeleton}>
          <span className={styles.visuallyHidden}>Syncing KRAFTON Radar...</span>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} />
          </div>
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </section>
      )}

      {/* 2. ERROR: Alert section with min-height: 220px and Reconnect Satellite button */}
      {view.status === 'ERROR' && (
        <section role="alert" className={styles.alert}>
          <h2 className={styles.alertTitle}>Telemetry Uplink Failure</h2>
          <p className={styles.alertMessage}>
            Blue-Zone Link Lost: {view.error}
          </p>
          <button
            type="button"
            onClick={() => setRetryTick((t) => t + 1)}
            className={styles.retryButton}
          >
            Reconnect Satellite
          </button>
        </section>
      )}

      {/* 3. SUCCESS: Match statistics card with min-height: 220px to prevent layout shift */}
      {view.status === 'SUCCESS' && view.data && (
        <article
          aria-labelledby="telemetry-squad-title"
          className={styles.card}
        >
          <header>
            <h2 id="telemetry-squad-title" className={styles.squadTitle}>
              {view.data.name} Telemetry
            </h2>
          </header>

          <dl className={styles.statsGrid}>
            <dt className={styles.statTerm}>Map</dt>
            <dd className={styles.statDetail}>{view.data.map}</dd>

            <dt className={styles.statTerm}>Phase</dt>
            <dd className={styles.statDetail}>{view.data.phase}</dd>

            <dt className={styles.statTerm}>Alive</dt>
            <dd className={styles.statDetail}>{view.data.alive} players</dd>

            <dt className={styles.statTerm}>Kills</dt>
            <dd className={styles.statDetail}>{view.data.kills}</dd>

            <dt className={styles.statTerm}>WWCD Probability</dt>
            <dd className={`${styles.statDetail} ${styles.statProb}`}>
              {view.data.wwcdProb}
            </dd>

            <dt className={styles.statTerm}>Status</dt>
            <dd className={`${styles.statDetail} ${styles.statStatus}`}>
              {view.data.status}
            </dd>
          </dl>
        </article>
      )}
    </div>
  );
}

export default PubgMatchTelemetry;
