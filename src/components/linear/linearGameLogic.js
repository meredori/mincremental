// src/components/linear/linearGameLogic.js

import { glimmerglassTiers } from "./data/glimmerglassTiers";

// Defensive: Validate and sanitize a number (non-negative, finite, not NaN)
function safeNumber(val, fallback = 0) {
  if (typeof val !== "number" || !isFinite(val) || isNaN(val)) return fallback;
  const cleaned = val < 0 ? 0 : val;
  return Math.floor(cleaned);
}

const STARTING_LUMENS = 25;
const MANUAL_CAST_VALUE = 3;

// Forward declaration for functions that might be called by others
let calculateIncrementerCost;
let calculateIncrementerProduction;
let calculateTotalPerSecond;
let unlockIncrementers;
let getUpgradeDefinition; // To be imported or defined via upgradeEngine.js

function createIncrementerState(tier) {
  return {
    id: tier.id,
    name: tier.name,
    description: tier.description,
    lore: tier.lore,
    count: 0,
    baseCost: safeNumber(tier.baseCost),
    costMultiplier: typeof tier.costMultiplier === "number" ? tier.costMultiplier : 1.15,
    currentCost: 0,
    baseValue: safeNumber(tier.baseLumens),
    upgrades: {
      multiplier: 1,
      flatBonus: 0,
    },
    individualProductionValue: 0,
    totalProductionFromType: 0,
    unlockThreshold: safeNumber(tier.unlockThreshold),
    isUnlocked: false,
  };
}

function buildBaseGameState() {
  const baseState = {
    score: safeNumber(STARTING_LUMENS),
    totalPerSecond: safeNumber(0),
    incrementers: glimmerglassTiers.map(createIncrementerState),
    upgrades: {},
    purchasedUpgrades: [],
    settings: {
      showPurchased: false,
    },
    statistics: {
      lifetimeLumens: safeNumber(STARTING_LUMENS),
    },
    metadata: {
      manualLumensPerCast: MANUAL_CAST_VALUE,
    },
  };

  baseState.incrementers.forEach((incrementer) => {
    calculateIncrementerCost(incrementer);
    if (incrementer.unlockThreshold <= baseState.statistics.lifetimeLumens) {
      incrementer.isUnlocked = true;
      calculateIncrementerProduction(incrementer);
    }
  });

  calculateTotalPerSecond(baseState);
  return baseState;
}

export function initializeGame() {
  return buildBaseGameState();
}

export function rehydrateGameState(savedState) {
  const baseState = buildBaseGameState();
  if (!savedState) return baseState;

  const hydrated = {
    ...baseState,
    ...savedState,
  };

  const tierOrder = glimmerglassTiers.map((tier) => tier.id);
  const baseMap = new Map(baseState.incrementers.map((inc) => [inc.id, inc]));

  (savedState.incrementers || []).forEach((savedInc) => {
    const baseInc = baseMap.get(savedInc.id);
    if (baseInc) {
      baseMap.set(savedInc.id, {
        ...baseInc,
        ...savedInc,
        upgrades: {
          ...baseInc.upgrades,
          ...(savedInc.upgrades || {}),
        },
      });
    } else {
      baseMap.set(savedInc.id, {
        ...savedInc,
      });
    }
  });

  hydrated.incrementers = tierOrder.map((id) => {
    const incrementer = baseMap.get(id);
    calculateIncrementerCost(incrementer);
    if (incrementer.isUnlocked || incrementer.unlockThreshold <= (hydrated.statistics?.lifetimeLumens ?? hydrated.score)) {
      incrementer.isUnlocked = true;
      calculateIncrementerProduction(incrementer);
    } else {
      incrementer.isUnlocked = false;
      incrementer.individualProductionValue = 0;
      incrementer.totalProductionFromType = 0;
    }
    return incrementer;
  });

  hydrated.statistics = {
    lifetimeLumens: safeNumber(
      Math.max(
        hydrated.statistics?.lifetimeLumens ?? 0,
        hydrated.score,
        baseState.statistics.lifetimeLumens
      )
    ),
  };

  hydrated.metadata = {
    ...baseState.metadata,
    ...(savedState.metadata || {}),
  };

  calculateTotalPerSecond(hydrated);
  unlockIncrementers(hydrated);
  return hydrated;
}

calculateIncrementerProduction = function (incrementer) {
  if (!incrementer.isUnlocked) {
    incrementer.individualProductionValue = 0;
    incrementer.totalProductionFromType = 0;
    return;
  }

  let singleUnitValue = safeNumber(incrementer.baseValue);
  singleUnitValue += safeNumber(incrementer.upgrades.flatBonus);
  singleUnitValue *= incrementer.upgrades.multiplier;

  incrementer.individualProductionValue = safeNumber(singleUnitValue);
  incrementer.totalProductionFromType = safeNumber(
    incrementer.count * incrementer.individualProductionValue
  );
};

calculateIncrementerCost = function (incrementer) {
  const cost = incrementer.baseCost * Math.pow(incrementer.costMultiplier, incrementer.count);
  incrementer.currentCost = safeNumber(cost);
};

calculateTotalPerSecond = function (gameState) {
  let total = 0;
  gameState.incrementers.forEach((inc) => {
    if (!inc.isUnlocked) return;
    total += safeNumber(inc.totalProductionFromType);
  });
  gameState.totalPerSecond = safeNumber(total);
};

unlockIncrementers = function (gameState) {
  const lifetimeLumens = safeNumber(gameState.statistics?.lifetimeLumens ?? gameState.score);
  gameState.incrementers.forEach((incrementer) => {
    if (!incrementer.isUnlocked && lifetimeLumens >= incrementer.unlockThreshold) {
      incrementer.isUnlocked = true;
      calculateIncrementerProduction(incrementer);
    }
  });
};

export function castLight(gameState) {
  const amount = safeNumber(gameState.metadata?.manualLumensPerCast ?? MANUAL_CAST_VALUE);
  gameState.score = safeNumber(gameState.score + amount);
  gameState.statistics = {
    ...gameState.statistics,
    lifetimeLumens: safeNumber((gameState.statistics?.lifetimeLumens ?? 0) + amount),
  };
  unlockIncrementers(gameState);
  return gameState;
}

export function purchaseIncrementer(gameState, incrementerId) {
  const inc = gameState.incrementers.find((i) => i.id === incrementerId);
  if (!inc || !inc.isUnlocked) return gameState;

  if (gameState.score >= inc.currentCost) {
    gameState.score = safeNumber(gameState.score - inc.currentCost);
    inc.count = safeNumber(inc.count + 1);

    calculateIncrementerCost(inc);
    calculateIncrementerProduction(inc);
    calculateTotalPerSecond(gameState);
  }
  return gameState;
}

export function applyUpgrade(gameState, upgradeId, allUpgradeDefinitions) {
  getUpgradeDefinition = (id) => allUpgradeDefinitions[id];
  const upgrade = getUpgradeDefinition(upgradeId);

  if (!upgrade || gameState.purchasedUpgrades.includes(upgradeId)) return gameState;

  const cost = safeNumber(upgrade.cost);
  if (gameState.score >= cost) {
    gameState.score = safeNumber(gameState.score - cost);
    gameState.purchasedUpgrades.push(upgradeId);

    upgrade.effects.forEach((effect) => {
      if (effect.targetId === "GLOBAL") {
        gameState.incrementers.forEach((targetIncrementer) => {
          if (!targetIncrementer.isUnlocked) return;
          if (effect.type === "GLOBAL_MULTIPLIER") {
            targetIncrementer.upgrades.multiplier = parseFloat(
              (targetIncrementer.upgrades.multiplier * effect.value).toFixed(4)
            );
            calculateIncrementerProduction(targetIncrementer);
          }
        });
      } else {
        const targetIncrementer = gameState.incrementers.find((inc) => inc.id === effect.targetId);
        if (targetIncrementer) {
          if (effect.type === "MULTIPLIER") {
            targetIncrementer.upgrades.multiplier = parseFloat(
              (targetIncrementer.upgrades.multiplier * effect.value).toFixed(4)
            );
          } else if (effect.type === "FLAT_BONUS") {
            targetIncrementer.upgrades.flatBonus += effect.value;
          } else if (effect.type === "SET_BASE_VALUE") {
            targetIncrementer.baseValue = safeNumber(effect.value);
          }
          if (targetIncrementer.isUnlocked) {
            calculateIncrementerProduction(targetIncrementer);
          }
        }
      }
    });
    calculateTotalPerSecond(gameState);
  }
  return gameState;
}

export function updateGameTick(gameState) {
  calculateTotalPerSecond(gameState);

  const scoreThisTick = safeNumber(gameState.totalPerSecond);
  if (scoreThisTick > 0) {
    gameState.score = safeNumber(gameState.score + scoreThisTick);
    gameState.statistics = {
      ...gameState.statistics,
      lifetimeLumens: safeNumber((gameState.statistics?.lifetimeLumens ?? 0) + scoreThisTick),
    };
    unlockIncrementers(gameState);
  }
  return gameState;
}

// Placeholder comment retained for context on upgrade definitions handling.
