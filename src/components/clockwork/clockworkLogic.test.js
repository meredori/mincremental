// src/components/clockwork/clockworkLogic.test.js
import {
  initGame,
  gameTick,
  purchaseDimension,
  performPrestige,
  canPrestige,
  getPointsPerSecond,
  getDimCost,
  formatNumber,
  DIMENSION_CONFIGS,
  INFINITY_THRESHOLD,
  BASE_ECHO_VALUE,
} from './clockworkLogic.js';

// ── initGame ──────────────────────────────────────────────────────────────────

describe('initGame', () => {
  test('returns 3 dimensions', () => {
    const state = initGame();
    expect(state.dimensions).toHaveLength(3);
  });

  test('all dimensions start with 0 count and 0 purchased', () => {
    const state = initGame();
    state.dimensions.forEach((d) => {
      expect(d.count).toBe(0);
      expect(d.purchased).toBe(0);
    });
  });

  test('points start at 0 with no meta bonuses', () => {
    const state = initGame();
    expect(state.points).toBe(0);
  });

  test('infinityMultiplier is 1 at infinityCount 0', () => {
    const state = initGame(null, 0);
    expect(state.infinityMultiplier).toBe(1);
  });

  test('infinityMultiplier scales correctly with infinityCount', () => {
    const state = initGame(null, 2);
    expect(state.infinityMultiplier).toBeCloseTo(1 + 2 * 0.5); // 2.0
  });

  test('applies metaBonuses productionMultiplier', () => {
    const metaBonuses = { productionMultiplier: 1.05, startingResources: 0 };
    const state = initGame(metaBonuses, 0);
    expect(state.metaProductionMultiplier).toBeCloseTo(1.05);
  });

  test('applies metaBonuses startingResources to initial points', () => {
    const metaBonuses = { productionMultiplier: 1, startingResources: 10 };
    const state = initGame(metaBonuses, 0);
    expect(state.points).toBe(10);
  });

  test('dim ids are d1, d2, d3', () => {
    const state = initGame();
    const ids = state.dimensions.map((d) => d.id);
    expect(ids).toEqual(['d1', 'd2', 'd3']);
  });
});

// ── getDimCost ────────────────────────────────────────────────────────────────

describe('getDimCost', () => {
  test('returns baseCost at 0 purchased', () => {
    const dim = { baseCost: 10, costMultiplier: 1.15, purchased: 0 };
    expect(getDimCost(dim)).toBe(10);
  });

  test('scales with purchased count', () => {
    const dim = { baseCost: 10, costMultiplier: 1.15, purchased: 1 };
    expect(getDimCost(dim)).toBe(Math.ceil(10 * 1.15));
  });

  test('cost grows exponentially', () => {
    const cost0 = getDimCost({ baseCost: 10, costMultiplier: 1.15, purchased: 0 });
    const cost5 = getDimCost({ baseCost: 10, costMultiplier: 1.15, purchased: 5 });
    expect(cost5).toBeGreaterThan(cost0 * 1.5);
  });
});

// ── purchaseDimension ─────────────────────────────────────────────────────────

describe('purchaseDimension', () => {
  test('deducts the correct cost from points', () => {
    let state = initGame(null, 0);
    const cost = state.dimensions[0].currentCost; // d1 cost
    state = { ...state, points: 100 };
    const next = purchaseDimension(state, 'd1');
    expect(next.points).toBe(100 - cost);
  });

  test('increments purchased count by 1', () => {
    let state = { ...initGame(), points: 1000 };
    const next = purchaseDimension(state, 'd1');
    expect(next.dimensions.find((d) => d.id === 'd1').purchased).toBe(1);
  });

  test('increments count by 1', () => {
    let state = { ...initGame(), points: 1000 };
    const next = purchaseDimension(state, 'd1');
    expect(next.dimensions.find((d) => d.id === 'd1').count).toBe(1);
  });

  test('returns same state when cannot afford', () => {
    const state = { ...initGame(), points: 0 };
    const next = purchaseDimension(state, 'd1');
    expect(next).toBe(state); // same reference
  });

  test('does not change other dimensions', () => {
    let state = { ...initGame(), points: 1000 };
    const next = purchaseDimension(state, 'd1');
    expect(next.dimensions.find((d) => d.id === 'd2').count).toBe(0);
    expect(next.dimensions.find((d) => d.id === 'd3').count).toBe(0);
  });

  test('updates currentCost after purchase', () => {
    let state = { ...initGame(), points: 1000 };
    const prevCost = state.dimensions[0].currentCost;
    const next = purchaseDimension(state, 'd1');
    expect(next.dimensions[0].currentCost).toBeGreaterThan(prevCost);
  });

  test('returns same state for unknown dimId', () => {
    const state = { ...initGame(), points: 1000 };
    const next = purchaseDimension(state, 'dx999');
    expect(next).toBe(state);
  });
});

// ── gameTick ──────────────────────────────────────────────────────────────────

describe('gameTick', () => {
  test('generates points from d1 count', () => {
    let state = { ...initGame(), points: 1000 };
    state = purchaseDimension(state, 'd1'); // buy 1 d1
    const next = gameTick(state);
    expect(next.points).toBeGreaterThan(state.points);
  });

  test('d1 with 0 count produces 0 points', () => {
    const state = initGame();
    const next = gameTick(state);
    expect(next.points).toBe(0);
  });

  test('d2 count increases d1 count per tick', () => {
    let state = { ...initGame(), points: 10000 };
    state = purchaseDimension(state, 'd2'); // buy 1 d2
    const d1Before = state.dimensions.find((d) => d.id === 'd1').count;
    const next = gameTick(state);
    const d1After = next.dimensions.find((d) => d.id === 'd1').count;
    expect(d1After).toBeGreaterThan(d1Before);
  });

  test('d3 count increases d2 count per tick', () => {
    let state = { ...initGame(), points: 1_000_000 };
    state = purchaseDimension(state, 'd3');
    const d2Before = state.dimensions.find((d) => d.id === 'd2').count;
    const next = gameTick(state);
    const d2After = next.dimensions.find((d) => d.id === 'd2').count;
    expect(d2After).toBeGreaterThan(d2Before);
  });

  test('infinityMultiplier is applied to point generation', () => {
    let baseState = { ...initGame(null, 0), points: 1000 };
    baseState = purchaseDimension(baseState, 'd1');

    let boostedState = { ...initGame(null, 2), points: 1000 };
    boostedState = purchaseDimension(boostedState, 'd1');
    // Manually set d1 count the same
    boostedState = {
      ...boostedState,
      dimensions: boostedState.dimensions.map((d) =>
        d.id === 'd1' ? { ...d, count: baseState.dimensions[0].count } : d,
      ),
      points: baseState.points,
    };

    const baseNext = gameTick(baseState);
    const boostedNext = gameTick(boostedState);
    expect(boostedNext.points).toBeGreaterThan(baseNext.points);
  });

  test('does not produce negative points', () => {
    const state = initGame();
    const next = gameTick(state);
    expect(next.points).toBeGreaterThanOrEqual(0);
  });
});

// ── canPrestige ───────────────────────────────────────────────────────────────

describe('canPrestige', () => {
  test('returns false when points are below threshold', () => {
    const state = { ...initGame(), points: 100 };
    expect(canPrestige(state)).toBe(false);
  });

  test('returns true when points equal the threshold', () => {
    const state = { ...initGame(), points: INFINITY_THRESHOLD };
    expect(canPrestige(state)).toBe(true);
  });

  test('returns true when points exceed the threshold', () => {
    const state = { ...initGame(), points: INFINITY_THRESHOLD * 2 };
    expect(canPrestige(state)).toBe(true);
  });
});

// ── performPrestige ───────────────────────────────────────────────────────────

describe('performPrestige', () => {
  test('increments infinityCount by 1', () => {
    const state = { ...initGame(null, 0), points: INFINITY_THRESHOLD };
    const { newState } = performPrestige(state);
    expect(newState.infinityCount).toBe(1);
  });

  test('resets points to 0 (or metaStartingResources)', () => {
    const state = { ...initGame(null, 0), points: INFINITY_THRESHOLD };
    const { newState } = performPrestige(state);
    expect(newState.points).toBe(0);
  });

  test('resets all dimension counts and purchased', () => {
    let state = { ...initGame(null, 0), points: 1_000_000_000 };
    state = purchaseDimension(state, 'd1');
    const { newState } = performPrestige(state);
    newState.dimensions.forEach((d) => {
      expect(d.count).toBe(0);
      expect(d.purchased).toBe(0);
    });
  });

  test('returns the correct base echo value', () => {
    const state = { ...initGame(null, 0), points: INFINITY_THRESHOLD };
    const { echoValue } = performPrestige(state);
    expect(echoValue).toBe(BASE_ECHO_VALUE);
  });

  test('applies provided metaBonuses to new state', () => {
    const state = { ...initGame(null, 0), points: INFINITY_THRESHOLD };
    const metaBonuses = { productionMultiplier: 1.05, startingResources: 0 };
    const { newState } = performPrestige(state, metaBonuses);
    expect(newState.metaProductionMultiplier).toBeCloseTo(1.05);
  });
});

// ── getPointsPerSecond ────────────────────────────────────────────────────────

describe('getPointsPerSecond', () => {
  test('returns 0 when d1 count is 0', () => {
    const state = initGame();
    expect(getPointsPerSecond(state)).toBe(0);
  });

  test('reflects d1 count × baseProduction × multipliers', () => {
    let state = { ...initGame(), points: 1000 };
    state = purchaseDimension(state, 'd1');
    const expected = 1 * DIMENSION_CONFIGS[0].baseProduction * state.infinityMultiplier * state.metaProductionMultiplier;
    expect(getPointsPerSecond(state)).toBeCloseTo(expected);
  });
});

// ── formatNumber ──────────────────────────────────────────────────────────────

describe('formatNumber', () => {
  test('formats small numbers as integer strings', () => {
    expect(formatNumber(42)).toBe('42');
  });

  test('formats thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.50K');
  });

  test('formats millions with M suffix', () => {
    expect(formatNumber(2_500_000)).toBe('2.50M');
  });

  test('formats billions with B suffix', () => {
    expect(formatNumber(3_000_000_000)).toBe('3.00B');
  });

  test('handles 0', () => {
    expect(formatNumber(0)).toBe('0');
  });

  test('handles NaN gracefully', () => {
    expect(formatNumber(NaN)).toBe('0');
  });
});

// ── isValidSave (tested via the shape it validates) ──────────────────────────

describe('initGame — save validation contract', () => {
  test('initGame output satisfies all REQUIRED_SAVE_KEYS', () => {
    const REQUIRED_SAVE_KEYS = ['points', 'infinityCount', 'infinityMultiplier', 'dimensions'];
    const state = initGame();
    REQUIRED_SAVE_KEYS.forEach((k) => {
      expect(k in state).toBe(true);
    });
  });

  test('dimensions array length matches DIMENSION_CONFIGS', () => {
    const state = initGame();
    expect(state.dimensions.length).toBe(DIMENSION_CONFIGS.length);
  });
});
