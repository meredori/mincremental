// src/components/clockwork/clockworkLogic.js
// Pure game logic for The Clockwork — no React, no side effects.
//
// Cascade model (per the design doc):
//   D3 → produces D2 units/tick
//   D2 → produces D1 units/tick
//   D1 → produces Points/tick
//
// "count" includes both manually purchased and cascade-generated units (float).
// "purchased" tracks only manual purchases and drives cost scaling (int).

export const DIMENSION_CONFIGS = [
  { id: 'd1', name: 'Dimension I',   baseCost: 10,    costMultiplier: 1.15, baseProduction: 1.0 },
  { id: 'd2', name: 'Dimension II',  baseCost: 100,   costMultiplier: 1.15, baseProduction: 0.1 },
  { id: 'd3', name: 'Dimension III', baseCost: 1000,  costMultiplier: 1.15, baseProduction: 0.01 },
];

export const INFINITY_THRESHOLD = 1_000_000;
export const BASE_ECHO_VALUE = 10; // Echoes awarded per Infinity prestige

// ── Helpers ──────────────────────────────────────────────────────────────────

function safe(val, fallback = 0) {
  if (typeof val !== 'number' || !isFinite(val) || isNaN(val)) return fallback;
  return val < 0 ? 0 : val;
}

export function getDimCost(dim) {
  return Math.ceil(dim.baseCost * Math.pow(dim.costMultiplier, dim.purchased));
}

// ── State initialisation ──────────────────────────────────────────────────────

/**
 * Creates the initial (or post-prestige) game state.
 * @param {object|null} metaBonuses  - Output of getMetaBonuses; null means no bonuses.
 * @param {number}      infinityCount - Number of Infinity prestiges completed so far.
 */
export function initGame(metaBonuses = null, infinityCount = 0) {
  // Each Infinity prestige adds +50% to the global production multiplier
  const infinityMultiplier = 1 + infinityCount * 0.5;
  const metaProductionMult = metaBonuses?.productionMultiplier ?? 1;
  const metaStartingResources = safe(metaBonuses?.startingResources ?? 0);

  return {
    points: safe(metaStartingResources),
    infinityCount,
    infinityMultiplier,
    metaProductionMultiplier: metaProductionMult,
    dimensions: DIMENSION_CONFIGS.map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      count: 0,        // total units (float); includes cascade gains
      purchased: 0,    // manually purchased (int); drives cost scaling
      currentCost: cfg.baseCost,
      baseCost: cfg.baseCost,
      costMultiplier: cfg.costMultiplier,
      baseProduction: cfg.baseProduction,
    })),
  };
}

// ── Derived values ────────────────────────────────────────────────────────────

/** Points generated per second by D1 */
export function getPointsPerSecond(state) {
  const d1 = state.dimensions.find((d) => d.id === 'd1');
  const totalMult = state.infinityMultiplier * state.metaProductionMultiplier;
  return safe(d1.count * DIMENSION_CONFIGS[0].baseProduction * totalMult);
}

/** True when the player has enough points to trigger Infinity */
export function canPrestige(state) {
  return state.points >= INFINITY_THRESHOLD;
}

// ── Mutations (return new state, never mutate) ────────────────────────────────

/**
 * Attempt to purchase one unit of a dimension.
 * Returns the same state object reference if the purchase fails.
 */
export function purchaseDimension(state, dimId) {
  const dim = state.dimensions.find((d) => d.id === dimId);
  if (!dim) return state;

  const cost = getDimCost(dim);
  if (state.points < cost) return state;

  const newPurchased = dim.purchased + 1;
  return {
    ...state,
    points: safe(state.points - cost),
    dimensions: state.dimensions.map((d) => {
      if (d.id !== dimId) return d;
      return {
        ...d,
        count: safe(d.count + 1),
        purchased: newPurchased,
        currentCost: getDimCost({ ...d, purchased: newPurchased }),
      };
    }),
  };
}

/**
 * Advance one game tick (1 second).
 * Cascade order: D3 → D2 count, D2 → D1 count, D1 → points.
 * Uses prior-tick counts for all cascade reads to avoid order dependency.
 */
export function gameTick(state) {
  const [d1, d2, d3] = ['d1', 'd2', 'd3'].map((id) =>
    state.dimensions.find((d) => d.id === id),
  );

  const totalMult = state.infinityMultiplier * state.metaProductionMultiplier;

  // Cascade gains — computed from previous tick counts
  const d2gain = safe(d3.count * DIMENSION_CONFIGS[2].baseProduction);
  const d1gain = safe(d2.count * DIMENSION_CONFIGS[1].baseProduction);
  const ptsgain = safe(d1.count * DIMENSION_CONFIGS[0].baseProduction * totalMult);

  const newPoints = safe(state.points + ptsgain);

  return {
    ...state,
    points: newPoints,
    dimensions: state.dimensions.map((d) => {
      if (d.id === 'd2') {
        const newCount = safe(d.count + d2gain);
        return { ...d, count: newCount, currentCost: getDimCost({ ...d, purchased: d.purchased }) };
      }
      if (d.id === 'd1') {
        const newCount = safe(d.count + d1gain);
        return { ...d, count: newCount, currentCost: getDimCost({ ...d, purchased: d.purchased }) };
      }
      return d;
    }),
  };
}

/**
 * Perform an Infinity prestige reset.
 * Returns { newState, echoValue } — the caller dispatches the echo award to global store.
 * @param {object|null} metaBonuses - Fresh meta bonuses to apply to the new run.
 */
export function performPrestige(state, metaBonuses = null) {
  const newInfinityCount = state.infinityCount + 1;
  const echoValue = BASE_ECHO_VALUE; // flat for PoC; can scale with depth later
  const newState = initGame(metaBonuses, newInfinityCount);
  return { newState, echoValue };
}

// ── Number formatting ─────────────────────────────────────────────────────────

/** Human-readable number formatting for the UI */
export function formatNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  if (n < 1000) return Math.floor(n).toLocaleString();
  const tiers = [
    [1e15, 'Qa'],
    [1e12, 'T'],
    [1e9,  'B'],
    [1e6,  'M'],
    [1e3,  'K'],
  ];
  for (const [threshold, suffix] of tiers) {
    if (n >= threshold) return (n / threshold).toFixed(2) + suffix;
  }
  return Math.floor(n).toLocaleString();
}
