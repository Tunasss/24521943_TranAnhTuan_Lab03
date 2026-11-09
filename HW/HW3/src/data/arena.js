/**
 * KRAFTON x PUBG Vietnam Championship & Airdrop Arena - Domain Contracts & Data
 */

/**
 * DropPhase lifecycle state machine:
 * - 'WARMUP': Countdown prior to airdrop opening (remainingMs > 0)
 * - 'AIRDROP_LIVE': Stock available and within drop duration window
 * - 'LOOTED_OUT': Inventory depleted to 0
 * - 'EXPIRED': Drop duration window elapsed
 * @typedef {'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED'} DropPhase
 */

/**
 * @typedef {Object} PubgCrateDrop
 * @property {string} id Unique crate identifier
 * @property {string} title Display name of the limited crate/pass
 * @property {number} priceVnd Price in Vietnamese Dong
 * @property {number} remainingStock Current remaining inventory stock
 * @property {number} dropEpochMs Target epoch timestamp when crate goes live
 */

/**
 * @typedef {Object} PubgVnSquadStanding
 * @property {string} squadId Unique team identifier (e.g. 'te', 'ces')
 * @property {string} squadName Official esports organization name
 * @property {number} wwcdCount Winner Winner Chicken Dinner count
 * @property {number} placementPts Placement tournament points
 * @property {number} killPts Total frag/kill points
 */

const baseTime = Date.now()

/** @type {PubgCrateDrop[]} */
export const INITIAL_CRATES = Object.freeze([
  Object.freeze({
    id: 'crate-pvs-vip',
    title: 'PVS Finals VIP Pass + 5,000 G-Coin',
    priceVnd: 450000,
    remainingStock: 5,
    dropEpochMs: baseTime + 15000, // 15 seconds warmup
  }),
  Object.freeze({
    id: 'crate-contraband',
    title: 'G-Coin Contraband Tactical Crate',
    priceVnd: 120000,
    remainingStock: 8,
    dropEpochMs: baseTime + 25000, // 25 seconds warmup
  }),
  Object.freeze({
    id: 'crate-champion-pan',
    title: 'Vietnam Champion Pan & Level 3 Helmet Skin',
    priceVnd: 280000,
    remainingStock: 2,
    dropEpochMs: baseTime + 35000, // 35 seconds warmup
  }),
])

/** @type {PubgVnSquadStanding[]} */
export const SQUADS = Object.freeze([
  Object.freeze({
    squadId: 'ces',
    squadName: 'Cerberus Esports',
    wwcdCount: 7,
    placementPts: 84,
    killPts: 112,
  }),
  Object.freeze({
    squadId: 'te',
    squadName: 'The Expendables',
    wwcdCount: 6,
    placementPts: 76,
    killPts: 98,
  }),
  Object.freeze({
    squadId: 'agg',
    squadName: 'All Gamers Global (AGG)',
    wwcdCount: 4,
    placementPts: 58,
    killPts: 79,
  }),
  Object.freeze({
    squadId: 'roy',
    squadName: 'Roy Esports',
    wwcdCount: 3,
    placementPts: 46,
    killPts: 64,
  }),
])
