// src/meta/achievements.test.js
import {
  ACHIEVEMENTS,
  BONUS_TYPES,
  getAchievementById,
  getAchievementsForSourceGame,
  evaluateGlobalAchievements,
} from './achievements.js';

// ── BONUS_TYPES ───────────────────────────────────────────────────────────────

describe('BONUS_TYPES', () => {
  test('exports all expected bonus type strings', () => {
    expect(BONUS_TYPES.PRODUCTION_MULTIPLIER).toBe('PRODUCTION_MULTIPLIER');
    expect(BONUS_TYPES.COST_REDUCTION).toBe('COST_REDUCTION');
    expect(BONUS_TYPES.STARTING_RESOURCE).toBe('STARTING_RESOURCE');
    expect(BONUS_TYPES.OFFLINE_MULTIPLIER).toBe('OFFLINE_MULTIPLIER');
    expect(BONUS_TYPES.UNLOCK_UPGRADE).toBe('UNLOCK_UPGRADE');
    expect(BONUS_TYPES.EXTRA_PRESTIGE_CURRENCY).toBe('EXTRA_PRESTIGE_CURRENCY');
    expect(BONUS_TYPES.TICK_RATE_BONUS).toBe('TICK_RATE_BONUS');
  });
});

// ── ACHIEVEMENTS list integrity ───────────────────────────────────────────────

describe('ACHIEVEMENTS list', () => {
  test('all achievements have required fields', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(typeof a.id).toBe('string');
      expect(a.id.length).toBeGreaterThan(0);
      expect(typeof a.sourceGame).toBe('string');
      expect(typeof a.title).toBe('string');
      expect(typeof a.description).toBe('string');
      expect(typeof a.bonusTarget).toBe('string');
      expect(a.bonus).toBeDefined();
      expect(Object.values(BONUS_TYPES)).toContain(a.bonus.type);
    });
  });

  test('all ids are unique', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('all sourceGame values are valid game ids or "any"', () => {
    const validGames = new Set([
      'clockwork', 'forge', 'heroville', 'kingdom',
      'alchemist', 'exchange', 'hive', 'loop', 'any',
    ]);
    ACHIEVEMENTS.forEach((a) => {
      expect(validGames.has(a.sourceGame)).toBe(true);
    });
  });

  test('all bonusTarget values are valid game ids or "all"', () => {
    const validGames = new Set([
      'clockwork', 'forge', 'heroville', 'kingdom',
      'alchemist', 'exchange', 'hive', 'loop', 'all',
    ]);
    ACHIEVEMENTS.forEach((a) => {
      expect(validGames.has(a.bonusTarget)).toBe(true);
    });
  });

  test('achievements with sourceGame "any" have a condition function', () => {
    ACHIEVEMENTS.filter((a) => a.sourceGame === 'any').forEach((a) => {
      expect(typeof a.condition).toBe('function');
    });
  });
});

// ── getAchievementById ────────────────────────────────────────────────────────

describe('getAchievementById', () => {
  test('returns the achievement for a known id', () => {
    const a = getAchievementById('cw-infinity');
    expect(a).not.toBeNull();
    expect(a.id).toBe('cw-infinity');
  });

  test('returns null for an unknown id', () => {
    expect(getAchievementById('does-not-exist')).toBeNull();
  });
});

// ── getAchievementsForSourceGame ──────────────────────────────────────────────

describe('getAchievementsForSourceGame', () => {
  test('returns clockwork achievements', () => {
    const result = getAchievementsForSourceGame('clockwork');
    expect(result.length).toBeGreaterThan(0);
    result.forEach((a) => {
      expect(a.sourceGame === 'clockwork' || a.sourceGame === 'any').toBe(true);
    });
  });

  test('always includes "any"-source achievements', () => {
    const anyAchievements = ACHIEVEMENTS.filter((a) => a.sourceGame === 'any');
    const result = getAchievementsForSourceGame('clockwork');
    anyAchievements.forEach((a) => {
      expect(result.find((r) => r.id === a.id)).toBeDefined();
    });
  });

  test('returns empty array for unknown game (no "any" achievements match)', () => {
    // 'any' achievements are still included
    const result = getAchievementsForSourceGame('unknown-game-id');
    const anyCount = ACHIEVEMENTS.filter((a) => a.sourceGame === 'any').length;
    expect(result.length).toBe(anyCount);
  });
});

// ── evaluateGlobalAchievements ────────────────────────────────────────────────

describe('evaluateGlobalAchievements', () => {
  test('returns polymath id when 4+ games have been prestiged', () => {
    const globalState = {
      prestigeCounts: { clockwork: 1, forge: 1, heroville: 1, kingdom: 1 },
    };
    const result = evaluateGlobalAchievements(globalState, []);
    expect(result).toContain('polymath');
  });

  test('does not return polymath when fewer than 4 games prestiged', () => {
    const globalState = {
      prestigeCounts: { clockwork: 2, forge: 1 },
    };
    const result = evaluateGlobalAchievements(globalState, []);
    expect(result).not.toContain('polymath');
  });

  test('skips achievements already earned', () => {
    const globalState = {
      prestigeCounts: { clockwork: 1, forge: 1, heroville: 1, kingdom: 1 },
    };
    const result = evaluateGlobalAchievements(globalState, ['polymath']);
    expect(result).not.toContain('polymath');
  });

  test('grand-tour triggers when all 8 games have been prestiged', () => {
    const globalState = {
      prestigeCounts: {
        clockwork: 1, forge: 1, heroville: 1, kingdom: 1,
        alchemist: 1, exchange: 1, hive: 1, loop: 1,
      },
    };
    const result = evaluateGlobalAchievements(globalState, []);
    expect(result).toContain('grand-tour');
  });

  test('grand-tour does not trigger if any game is missing', () => {
    const globalState = {
      prestigeCounts: {
        clockwork: 1, forge: 1, heroville: 1, kingdom: 1,
        alchemist: 1, exchange: 1, hive: 1,
        // loop missing
      },
    };
    const result = evaluateGlobalAchievements(globalState, []);
    expect(result).not.toContain('grand-tour');
  });
});
