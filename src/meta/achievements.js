// src/meta/achievements.js
// Achievement definitions and the shared bonus type enum.
// sourceGame: specific game id | 'any' (global condition evaluated against full global state)
// bonusTarget: specific game id | 'all' (bonus applies to every registered game)

export const BONUS_TYPES = {
  PRODUCTION_MULTIPLIER: 'PRODUCTION_MULTIPLIER',   // multiplies all production
  COST_REDUCTION: 'COST_REDUCTION',                 // reduces all costs by flat %
  STARTING_RESOURCE: 'STARTING_RESOURCE',           // extra resources at run start
  OFFLINE_MULTIPLIER: 'OFFLINE_MULTIPLIER',         // boosts offline progress rate
  UNLOCK_UPGRADE: 'UNLOCK_UPGRADE',                 // immediately unlocks an upgrade
  EXTRA_PRESTIGE_CURRENCY: 'EXTRA_PRESTIGE_CURRENCY', // more Echoes on prestige
  TICK_RATE_BONUS: 'TICK_RATE_BONUS',               // faster tick interval
};

// Per the cross-game bonus matrix in the design doc.
// Placeholder entries for not-yet-implemented games are included so the
// achievement infrastructure is complete — games just won't award them yet.
export const ACHIEVEMENTS = [
  // ── The Clockwork ────────────────────────────────────────────────────────────
  {
    id: 'cw-dim4',
    sourceGame: 'clockwork',
    title: 'First Spark',
    description: 'Unlock Dimension 4 in The Clockwork.',
    bonusTarget: 'forge',
    bonus: {
      type: BONUS_TYPES.PRODUCTION_MULTIPLIER,
      value: 1.10,
      description: '+10% Miner output in The Forge',
    },
  },
  {
    id: 'cw-infinity',
    sourceGame: 'clockwork',
    title: 'Infinity Reached',
    description: 'Complete your first Infinity prestige in The Clockwork.',
    bonusTarget: 'heroville',
    bonus: {
      type: BONUS_TYPES.STARTING_RESOURCE,
      value: 1,
      description: 'Heroes start at level 2 in Heroville',
    },
  },
  // ── The Forge ────────────────────────────────────────────────────────────────
  {
    id: 'forge-first-prestige',
    sourceGame: 'forge',
    title: 'Master of Metal',
    description: 'Complete your first Temper in The Forge.',
    bonusTarget: 'clockwork',
    bonus: {
      type: BONUS_TYPES.PRODUCTION_MULTIPLIER,
      value: 1.05,
      description: '+5% to all Dimension output in The Clockwork',
    },
  },
  {
    id: 'forge-supply-chain',
    sourceGame: 'forge',
    title: 'Supply Chain',
    description: 'Automate all 3 resource tiers in The Forge.',
    bonusTarget: 'exchange',
    bonus: {
      type: BONUS_TYPES.STARTING_RESOURCE,
      value: 1,
      description: 'Start with 1 Trade License in The Exchange',
    },
  },
  // ── Heroville ────────────────────────────────────────────────────────────────
  {
    id: 'heroville-first-blood',
    sourceGame: 'heroville',
    title: 'First Blood',
    description: 'Defeat the first dungeon boss in Heroville.',
    bonusTarget: 'hive',
    bonus: {
      type: BONUS_TYPES.PRODUCTION_MULTIPLIER,
      value: 1.15,
      description: 'Soldiers deal +15% damage in The Hive',
    },
  },
  {
    id: 'heroville-veteran',
    sourceGame: 'heroville',
    title: 'Veteran Guild',
    description: 'Prestige 3 times in Heroville.',
    bonusTarget: 'kingdom',
    bonus: {
      type: BONUS_TYPES.TICK_RATE_BONUS,
      value: 0.20,
      description: 'Barracks trains 20% faster in The Kingdom',
    },
  },
  // ── The Kingdom ──────────────────────────────────────────────────────────────
  {
    id: 'kingdom-1k-pop',
    sourceGame: 'kingdom',
    title: 'Growing Empire',
    description: 'Reach 1000 population in The Kingdom.',
    bonusTarget: 'exchange',
    bonus: {
      type: BONUS_TYPES.PRODUCTION_MULTIPLIER,
      value: 1.05,
      description: 'All routes earn +5% Gold in The Exchange',
    },
  },
  {
    id: 'kingdom-scholar',
    sourceGame: 'kingdom',
    title: 'Scholar',
    description: 'Research the full tech tree tier 1 in The Kingdom.',
    bonusTarget: 'alchemist',
    bonus: {
      type: BONUS_TYPES.COST_REDUCTION,
      value: 0.50,
      description: 'Hint costs reduced by 50% in The Alchemist',
    },
  },
  // ── The Alchemist ────────────────────────────────────────────────────────────
  {
    id: 'alchemist-first-brew',
    sourceGame: 'alchemist',
    title: 'First Brew',
    description: 'Discover 10 compounds in The Alchemist.',
    bonusTarget: 'forge',
    bonus: {
      type: BONUS_TYPES.UNLOCK_UPGRADE,
      value: 'alchemical-alloy',
      description: 'Unlock Alchemical Alloy blueprint in The Forge',
    },
  },
  {
    id: 'alchemist-grand-distil',
    sourceGame: 'alchemist',
    title: 'Grand Distil',
    description: 'Complete your first Distil prestige in The Alchemist.',
    bonusTarget: 'loop',
    bonus: {
      type: BONUS_TYPES.UNLOCK_UPGRADE,
      value: 'brew-action',
      description: 'Unlock the Brew action in The Loop',
    },
  },
  // ── The Exchange ─────────────────────────────────────────────────────────────
  {
    id: 'exchange-merchant-prince',
    sourceGame: 'exchange',
    title: 'Merchant Prince',
    description: 'Earn 1M Gold total in The Exchange.',
    bonusTarget: 'kingdom',
    bonus: {
      type: BONUS_TYPES.STARTING_RESOURCE,
      value: 500,
      description: 'Start each Era with 500 Gold in The Kingdom',
    },
  },
  {
    id: 'exchange-market-crash',
    sourceGame: 'exchange',
    title: 'Market Crash',
    description: 'Complete your first Market Reset prestige in The Exchange.',
    bonusTarget: 'heroville',
    bonus: {
      type: BONUS_TYPES.COST_REDUCTION,
      value: 0.25,
      description: 'Potion costs reduced by 25% in Heroville',
    },
  },
  // ── The Hive ─────────────────────────────────────────────────────────────────
  {
    id: 'hive-critical-mass',
    sourceGame: 'hive',
    title: 'Critical Mass',
    description: 'Reach 1 billion workers in The Hive.',
    bonusTarget: 'clockwork',
    bonus: {
      type: BONUS_TYPES.STARTING_RESOURCE,
      value: 1,
      description: '+1 to starting Dimension 1 count in The Clockwork',
    },
  },
  {
    id: 'hive-evolved',
    sourceGame: 'hive',
    title: 'Evolved',
    description: 'Unlock 5 Evolution traits in The Hive.',
    bonusTarget: 'loop',
    bonus: {
      type: BONUS_TYPES.STARTING_RESOURCE,
      value: 2,
      description: '+2 permanent Action slots in The Loop',
    },
  },
  // ── The Loop ─────────────────────────────────────────────────────────────────
  {
    id: 'loop-perfect',
    sourceGame: 'loop',
    title: 'Perfect Loop',
    description: 'Complete a loop using all available action slots in The Loop.',
    bonusTarget: 'all',
    bonus: {
      type: BONUS_TYPES.PRODUCTION_MULTIPLIER,
      value: 1.01,
      description: '+1% production in all games',
    },
  },
  {
    id: 'loop-time-mastery',
    sourceGame: 'loop',
    title: 'Time Mastery',
    description: 'Complete your first Ascend prestige in The Loop.',
    bonusTarget: 'all',
    bonus: {
      type: BONUS_TYPES.OFFLINE_MULTIPLIER,
      value: 1.25,
      description: '+25% offline progress duration in all games',
    },
  },
  // ── Cross-game (sourceGame: 'any') ───────────────────────────────────────────
  {
    id: 'polymath',
    sourceGame: 'any',
    title: 'Polymath',
    description: 'Prestige in 4 different games.',
    bonusTarget: 'all',
    bonus: {
      type: BONUS_TYPES.EXTRA_PRESTIGE_CURRENCY,
      value: 0.05,
      description: '+5% Echo earnings globally',
    },
    // Condition evaluated against global state (not a per-game event)
    condition: (globalState) =>
      Object.values(globalState.prestigeCounts).filter((n) => n > 0).length >= 4,
  },
  {
    id: 'grand-tour',
    sourceGame: 'any',
    title: 'Grand Tour',
    description: 'Prestige in all 8 games.',
    bonusTarget: 'all',
    bonus: {
      type: BONUS_TYPES.UNLOCK_UPGRADE,
      value: 'ninth-loop',
      description: 'Unlock secret Ninth Loop mode',
    },
    condition: (globalState) =>
      Object.keys(globalState.prestigeCounts).length >= 8 &&
      Object.values(globalState.prestigeCounts).every((n) => n > 0),
  },
];

export const getAchievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id) ?? null;

export const getAchievementsForSourceGame = (gameId) =>
  ACHIEVEMENTS.filter((a) => a.sourceGame === gameId || a.sourceGame === 'any');

// Evaluate all 'any'-source achievements and return ids that should now be earned
export const evaluateGlobalAchievements = (globalState, alreadyEarned) =>
  ACHIEVEMENTS.filter(
    (a) =>
      a.sourceGame === 'any' &&
      typeof a.condition === 'function' &&
      !alreadyEarned.includes(a.id) &&
      a.condition(globalState),
  ).map((a) => a.id);
