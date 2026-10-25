/**
 * Mock KRAFTON PUBG VN Telemetry API.
 * Simulates real-world mobile esports uplink with latency, 35% error rate, and AbortSignal support.
 * @param {string} squadId - The target squad identifier.
 * @param {Object} [options] - Options containing optional AbortSignal.
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel in-flight request.
 * @returns {Promise<Object>} Match telemetry record.
 */
export async function fetchKraftonPubgTelemetry(squadId, { signal } = {}) {
  // If signal is already aborted before starting
  if (signal?.aborted) {
    throw new DOMException('Request was aborted prior to execution', 'AbortError');
  }

  // Artificial latency between 600ms and 1100ms
  const latency = Math.floor(Math.random() * 500) + 600;

  return new Promise((resolve, reject) => {
    let timeoutId;

    const onAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
      reject(new DOMException('Request was aborted during transmission', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    timeoutId = setTimeout(() => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }

      // Check if aborted just before completing
      if (signal?.aborted) {
        reject(new DOMException('Request was aborted during transmission', 'AbortError'));
        return;
      }

      // Simulated 35% network failure rate
      if (Math.random() < 0.35) {
        reject(new Error('KRAFTON Telemetry Server 503: Uplink Timeout / Packet Loss'));
        return;
      }

      // Return telemetry mock record
      const telemetryDatabase = {
        'squad-ces': {
          squadName: 'Cerberus Esports',
          tag: 'CES',
          matchRank: '#1 Winner Winner Chicken Dinner',
          placement: 1,
          totalKills: 14,
          damageDealt: 2840,
          survivalDuration: '28m 42s',
          aliveCount: 4,
          primaryWeapon: 'Beryl M762 & SLR',
          mvpPlayer: 'Himass (6 Kills)',
        },
        'squad-te': {
          squadName: 'The Expendables',
          tag: 'TE',
          matchRank: '#2 Final Circle Elimination',
          placement: 2,
          totalKills: 11,
          damageDealt: 2310,
          survivalDuration: '27m 15s',
          aliveCount: 0,
          primaryWeapon: 'M416 & Mini14',
          mvpPlayer: 'Clories (5 Kills)',
        },
        'squad-ge': {
          squadName: 'Genius Esports',
          tag: 'GE',
          matchRank: '#4 Phase 6 Combat Elimination',
          placement: 4,
          totalKills: 8,
          damageDealt: 1750,
          survivalDuration: '23m 50s',
          aliveCount: 0,
          primaryWeapon: 'AUG & Mk12',
          mvpPlayer: 'Zest (4 Kills)',
        },
        'squad-ag': {
          squadName: 'All Gamers Global',
          tag: 'AG',
          matchRank: '#6 Mid-Game Bridge Ambush',
          placement: 6,
          totalKills: 5,
          damageDealt: 1290,
          survivalDuration: '19m 10s',
          aliveCount: 0,
          primaryWeapon: 'M416 & Kar98k',
          mvpPlayer: 'DucT (3 Kills)',
        },
      };

      const record = telemetryDatabase[squadId] || {
        squadName: 'Unknown Squad',
        tag: 'UNK',
        matchRank: '#12 Erangel Elimination',
        placement: 12,
        totalKills: 2,
        damageDealt: 540,
        survivalDuration: '11m 05s',
        aliveCount: 0,
        primaryWeapon: 'M416',
        mvpPlayer: 'Player1 (1 Kill)',
      };

      resolve(record);
    }, latency);
  });
}

export default fetchKraftonPubgTelemetry;
