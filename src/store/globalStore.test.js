// src/store/globalStore.test.js
import useGlobalStore, { INITIAL_GLOBAL_STATE, deriveAscensionRank } from './globalStore.js';

// Reset store state before every test; avoids bleed between tests
beforeEach(() => {
  useGlobalStore.getState()._resetForTesting();
  // Also clear localStorage so loadFromSave tests start clean
  window.localStorage.clear();
});

// ── deriveAscensionRank ───────────────────────────────────────────────────────

describe('deriveAscensionRank', () => {
  test('returns 0 when no prestiges', () => {
    expect(deriveAscensionRank({ prestigeCounts: {} })).toBe(0);
  });

  test('sums all prestige counts', () => {
    expect(deriveAscensionRank({ prestigeCounts: { clockwork: 3, forge: 2 } })).toBe(5);
  });

  test('single game prestige counts correctly', () => {
    expect(deriveAscensionRank({ prestigeCounts: { clockwork: 7 } })).toBe(7);
  });
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  test('starts with 0 echoes', () => {
    expect(useGlobalStore.getState().echoes).toBe(0);
  });

  test('starts with empty achievements', () => {
    expect(useGlobalStore.getState().achievements).toEqual([]);
  });

  test('starts with empty prestigeCounts', () => {
    expect(useGlobalStore.getState().prestigeCounts).toEqual({});
  });

  test('starts with clockwork in unlockedGames', () => {
    expect(useGlobalStore.getState().unlockedGames).toContain('clockwork');
  });
});

// ── awardAchievement ─────────────────────────────────────────────────────────

describe('awardAchievement', () => {
  test('adds an achievement id', () => {
    useGlobalStore.getState().awardAchievement('cw-infinity');
    expect(useGlobalStore.getState().achievements).toContain('cw-infinity');
  });

  test('is idempotent — duplicate awards are ignored', () => {
    useGlobalStore.getState().awardAchievement('cw-infinity');
    useGlobalStore.getState().awardAchievement('cw-infinity');
    expect(useGlobalStore.getState().achievements.filter((a) => a === 'cw-infinity')).toHaveLength(1);
  });

  test('can award multiple different achievements', () => {
    useGlobalStore.getState().awardAchievement('cw-dim4');
    useGlobalStore.getState().awardAchievement('cw-infinity');
    const { achievements } = useGlobalStore.getState();
    expect(achievements).toContain('cw-dim4');
    expect(achievements).toContain('cw-infinity');
  });
});

// ── prestige ─────────────────────────────────────────────────────────────────

describe('prestige', () => {
  test('increments prestigeCounts for the game', () => {
    useGlobalStore.getState().prestige('clockwork', 10);
    expect(useGlobalStore.getState().prestigeCounts.clockwork).toBe(1);
  });

  test('accumulates prestige counts across multiple calls', () => {
    useGlobalStore.getState().prestige('clockwork', 10);
    useGlobalStore.getState().prestige('clockwork', 10);
    expect(useGlobalStore.getState().prestigeCounts.clockwork).toBe(2);
  });

  test('awards echoes on prestige', () => {
    useGlobalStore.getState().prestige('clockwork', 10);
    expect(useGlobalStore.getState().echoes).toBe(10);
  });

  test('accumulates echoes across multiple prestiges', () => {
    useGlobalStore.getState().prestige('clockwork', 10);
    useGlobalStore.getState().prestige('clockwork', 5);
    expect(useGlobalStore.getState().echoes).toBe(15);
  });

  test('tracks totalEchoesEarned separately from current echoes', () => {
    useGlobalStore.getState().prestige('clockwork', 20);
    useGlobalStore.getState().purchaseEchoShopItem('head-start', 5);
    const { echoes, totalEchoesEarned } = useGlobalStore.getState();
    expect(totalEchoesEarned).toBe(20);
    expect(echoes).toBe(15);
  });

  test('applies echoing-legacy multiplier when purchased', () => {
    // Manually inject the shop purchase to simulate owning 'echoing-legacy'
    useGlobalStore.setState({ echoes: 100, echoShopPurchases: ['echoing-legacy'] });
    useGlobalStore.getState().prestige('clockwork', 10);
    // 10 * 1.25 = 12.5 → floor = 12
    expect(useGlobalStore.getState().echoes).toBe(112);
  });

  test('tracks prestige counts for multiple games independently', () => {
    useGlobalStore.getState().prestige('clockwork', 10);
    useGlobalStore.getState().prestige('forge', 5);
    const { prestigeCounts } = useGlobalStore.getState();
    expect(prestigeCounts.clockwork).toBe(1);
    expect(prestigeCounts.forge).toBe(1);
  });
});

// ── purchaseEchoShopItem ─────────────────────────────────────────────────────

describe('purchaseEchoShopItem', () => {
  test('deducts echo cost', () => {
    useGlobalStore.setState({ echoes: 50 });
    useGlobalStore.getState().purchaseEchoShopItem('head-start', 5);
    expect(useGlobalStore.getState().echoes).toBe(45);
  });

  test('adds item to echoShopPurchases', () => {
    useGlobalStore.setState({ echoes: 50 });
    useGlobalStore.getState().purchaseEchoShopItem('head-start', 5);
    expect(useGlobalStore.getState().echoShopPurchases).toContain('head-start');
  });

  test('returns false and does nothing if cannot afford', () => {
    useGlobalStore.setState({ echoes: 2 });
    const result = useGlobalStore.getState().purchaseEchoShopItem('head-start', 5);
    expect(result).toBe(false);
    expect(useGlobalStore.getState().echoes).toBe(2);
  });

  test('returns false if item already purchased', () => {
    useGlobalStore.setState({ echoes: 50, echoShopPurchases: ['head-start'] });
    const result = useGlobalStore.getState().purchaseEchoShopItem('head-start', 5);
    expect(result).toBe(false);
    expect(useGlobalStore.getState().echoes).toBe(50); // no change
  });

  test('returns true on successful purchase', () => {
    useGlobalStore.setState({ echoes: 50 });
    const result = useGlobalStore.getState().purchaseEchoShopItem('head-start', 5);
    expect(result).toBe(true);
  });
});

// ── unlockGame ───────────────────────────────────────────────────────────────

describe('unlockGame', () => {
  test('adds a game to unlockedGames', () => {
    useGlobalStore.getState().unlockGame('forge');
    expect(useGlobalStore.getState().unlockedGames).toContain('forge');
  });

  test('is idempotent', () => {
    useGlobalStore.getState().unlockGame('forge');
    useGlobalStore.getState().unlockGame('forge');
    expect(
      useGlobalStore.getState().unlockedGames.filter((g) => g === 'forge'),
    ).toHaveLength(1);
  });
});

// ── loadFromSave ──────────────────────────────────────────────────────────────

describe('loadFromSave', () => {
  test('loads saved state from localStorage', () => {
    const saved = { ...INITIAL_GLOBAL_STATE, echoes: 42, achievements: ['cw-infinity'] };
    window.localStorage.setItem('mincremental:global', JSON.stringify(saved));
    useGlobalStore.getState().loadFromSave();
    expect(useGlobalStore.getState().echoes).toBe(42);
    expect(useGlobalStore.getState().achievements).toContain('cw-infinity');
  });

  test('ignores saves with a different version', () => {
    const saved = { ...INITIAL_GLOBAL_STATE, version: 99, echoes: 999 };
    window.localStorage.setItem('mincremental:global', JSON.stringify(saved));
    useGlobalStore.getState().loadFromSave();
    expect(useGlobalStore.getState().echoes).toBe(0); // unchanged
  });

  test('does nothing when localStorage is empty', () => {
    useGlobalStore.getState().loadFromSave();
    expect(useGlobalStore.getState().echoes).toBe(0);
  });
});
