// src/components/linear/linearGameLogic.js

// Defensive: Validate and sanitize a number (non-negative, finite, not NaN)
function safeNumber(val, fallback = 0) {
  if (typeof val !== "number" || !isFinite(val) || isNaN(val)) return fallback;
  return val < 0 ? 0 : Math.floor(val); // REQ-004: Ensure whole numbers
}

// Forward declaration for functions that might be called by others
let calculateIncrementerCost;
let calculateIncrementerProduction;
let calculateTotalPerSecond;
let getUpgradeDefinition; // To be imported or defined via upgradeEngine.js

const initialIncrementers = [
  {
    id: 'thingamabob',
    name: 'Thingamabob',
    description: 'A curious little gadget that does... something.',
    count: 0,
    baseCost: 10, // REQ-004, REQ-006: Adjust for balancing
    costMultiplier: 1.15, // REQ-006: Adjust for balancing
    currentCost: 0, // Calculated
    baseValue: 1, // REQ-005: Base production of one unit
    upgrades: {
        multiplier: 1,
        flatBonus: 0
    },
    individualProductionValue: 0, // Calculated, REQ-002
    totalProductionFromType: 0, // Calculated, REQ-001
  },
  // TODO: Add other incrementers as needed, following the same structure
  // Example:
  // {
  //   id: 'widget',
  //   name: 'Widget',
  //   description: 'A standard widget, produces widgets.',
  //   count: 0,
  //   baseCost: 100,
  //   costMultiplier: 1.20,
  //   currentCost: 0,
  //   baseValue: 10,
  //   upgrades: { multiplier: 1, flatBonus: 0 },
  //   individualProductionValue: 0,
  //   totalProductionFromType: 0,
  // },
];

export function initializeGame() {
  const gameState = {
    score: safeNumber(10), // REQ-DEBUG: Start with 10 to afford the first incrementer
    totalPerSecond: safeNumber(0),
    incrementers: JSON.parse(JSON.stringify(initialIncrementers)), // Deep copy
    upgrades: {}, // Will be populated by upgradeEngine.js definitions
    purchasedUpgrades: [], // IDs of purchased upgrades
    settings: {
      showPurchased: false, // REQ-003
    },
  };

  // TEST: On game load, the 'showPurchased' state defaults to false. (REQ-003)

  gameState.incrementers.forEach(inc => {
    if (inc.id === 'thingamabob') {
      inc.baseValue = safeNumber(1); // REQ-005
      // TEST: The first incrementer ('thingamabob') base value is 1 (or adjusted by initial upgrades to 1). (REQ-005)
    } else {
      inc.baseValue = safeNumber(inc.baseValue);
    }
    inc.baseCost = safeNumber(inc.baseCost);
    inc.costMultiplier = inc.costMultiplier; // Multiplier can be float
    inc.count = safeNumber(inc.count);

    calculateIncrementerCost(inc);
    calculateIncrementerProduction(inc);
  });

  calculateTotalPerSecond(gameState);
  return gameState;
}

calculateIncrementerProduction = function(incrementer) {
  // Calculate the value of a single unit of this incrementer
  let singleUnitValue = safeNumber(incrementer.baseValue);
  // Apply flat bonus upgrades first, then multiplier
  singleUnitValue += safeNumber(incrementer.upgrades.flatBonus);
  singleUnitValue *= incrementer.upgrades.multiplier; // Multiplier can be float

  incrementer.individualProductionValue = safeNumber(singleUnitValue); // REQ-004, REQ-002
  // TEST: Incrementer card for 'thingamabob' displays its individual production value correctly. (REQ-002)
  // TEST: All incrementer production values are whole numbers. (REQ-004)

  incrementer.totalProductionFromType = safeNumber(incrementer.count * incrementer.individualProductionValue); // REQ-001, REQ-004
  // TEST: Purchasing a second 'thingamabob' correctly adds its base value to the 'thingamabob' type's total production, not multiplies. (REQ-001)
  // TEST: The 'per-1' display for 'thingamabob' shows the value of a single 'thingamabob'. (REQ-001 related)
};

calculateIncrementerCost = function(incrementer) {
  // REQ-006: costMultiplier or baseCost might need adjustment for slower scaling
  let cost = incrementer.baseCost * Math.pow(incrementer.costMultiplier, incrementer.count);
  incrementer.currentCost = safeNumber(cost); // REQ-004
  // TEST: All incrementer costs are whole numbers. (REQ-004)
  // TEST: The cost of the 10th 'thingamabob' is higher relative to its production compared to previous scaling. (REQ-006)
};

calculateTotalPerSecond = function(gameState) {
  let total = 0;
  gameState.incrementers.forEach(inc => {
    total += safeNumber(inc.totalProductionFromType); // This is already floored
  });
  gameState.totalPerSecond = safeNumber(total); // REQ-004
  // TEST: Total score and perSecond rate are displayed as whole numbers. (REQ-004)
};

export function purchaseIncrementer(gameState, incrementerId) {
  const inc = gameState.incrementers.find(i => i.id === incrementerId);
  if (!inc) return gameState;

  if (gameState.score >= inc.currentCost) {
    gameState.score = safeNumber(gameState.score - inc.currentCost); // REQ-004
    inc.count = safeNumber(inc.count + 1);

    calculateIncrementerCost(inc);
    calculateIncrementerProduction(inc);
    calculateTotalPerSecond(gameState);
    // TEST: (Covered by calculateIncrementerProduction tests for REQ-001)
  }
  return gameState;
}

export function applyUpgrade(gameState, upgradeId, allUpgradeDefinitions) {
  // Ensure getUpgradeDefinition is available (simulating import from upgradeEngine.js)
  getUpgradeDefinition = (id) => allUpgradeDefinitions[id];
  const upgrade = getUpgradeDefinition(upgradeId);

  if (!upgrade || gameState.purchasedUpgrades.includes(upgradeId)) return gameState;

  const cost = safeNumber(upgrade.cost); // REQ-004 for upgrade cost
  if (gameState.score >= cost) {
    gameState.score = safeNumber(gameState.score - cost); // REQ-004
    gameState.purchasedUpgrades.push(upgradeId);

    upgrade.effects.forEach(effect => {
      if (effect.targetId === 'GLOBAL') {
        gameState.incrementers.forEach(targetIncrementer => {
          if (effect.type === 'GLOBAL_MULTIPLIER') {
            // REQ-006: effect.value comes from upgradeEngine and should be smaller
            targetIncrementer.upgrades.multiplier = parseFloat((targetIncrementer.upgrades.multiplier * effect.value).toFixed(4)); // Keep some precision
            calculateIncrementerProduction(targetIncrementer);
          }
        });
        // TEST: Global upgrades provide a smaller percentage increase than before. (REQ-006)
      } else {
        const targetIncrementer = gameState.incrementers.find(inc => inc.id === effect.targetId);
        if (targetIncrementer) {
          if (effect.type === 'MULTIPLIER') {
            // REQ-006: effect.value comes from upgradeEngine and should be smaller
            targetIncrementer.upgrades.multiplier = parseFloat((targetIncrementer.upgrades.multiplier * effect.value).toFixed(4));
          } else if (effect.type === 'FLAT_BONUS') {
            // REQ-006: effect.value comes from upgradeEngine and should be smaller
            targetIncrementer.upgrades.flatBonus += effect.value; // effect.value can be decimal
          } else if (effect.type === 'SET_BASE_VALUE') {
            targetIncrementer.baseValue = safeNumber(effect.value);
          }
          calculateIncrementerProduction(targetIncrementer);
          // TEST: An upgrade to 'thingamabob' increases its value by a smaller, predefined amount compared to previous scaling. (REQ-006)
          // TEST: After N upgrades (e.g., 5), the 'thingamabob' value is still 1. (REQ-005)
          // TEST: After M upgrades (e.g., 10), the 'thingamabob' value becomes 2. (REQ-005)
        }
      }
    });
    calculateTotalPerSecond(gameState);
    // TEST: Upgrade effects result in whole number changes to incrementer values (via calculateIncrementerProduction). (REQ-004)
  }
  return gameState;
}

export function updateGameTick(gameState) {
  // Ensure totalPerSecond is up-to-date, though it should be after any purchase/upgrade
  calculateTotalPerSecond(gameState); 
  
  const scoreThisTick = safeNumber(gameState.totalPerSecond);
  gameState.score = safeNumber(gameState.score + scoreThisTick); // REQ-004
  // TEST: Total score and perSecond rate are displayed as whole numbers. (REQ-004)
  // TEST: Main scoreboard 'total score' is distinct from any individual incrementer's production display. (REQ-002)
  return gameState;
}

// Placeholder for upgrade definitions that would come from upgradeEngine.js
// This will be replaced by importing from the actual upgradeEngine.js file.
// For now, it's here to make applyUpgrade runnable in isolation if needed for testing.
// const placeholderUpgradeDefinitions = {
//   'thingamabob_upgrade_1': {
//     id: 'thingamabob_upgrade_1',
//     cost: 20,
//     effects: [{ targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0.2 }]
//   },
// };

// The old checkAndUnlockUpgrades and calculateProduction from upgradeEngine
// are not directly used in this refactored logic.
// The new model is that linearGameLogic calls calculateIncrementerProduction
// which uses the flatBonus and multiplier from the incrementer's own state,
// which are modified by applyUpgrade based on definitions from upgradeEngine.

// Tier unlocking logic from old handleIncrement needs to be re-evaluated.
// For now, focusing on the core requirements.
// If tier unlocking is needed, it would be called from purchaseIncrementer.
/*
function handleTierUnlocking(gameState, purchasedIncrementerIndex) {
    const incrementers = gameState.incrementers;
    const currentTier = incrementers[purchasedIncrementerIndex];

    // Example: Unlock next tier if 10 of current are owned and it's the latest tier
    if (
        incrementers.length < 10 && // Max tiers example
        purchasedIncrementerIndex === incrementers.length - 1 &&
        currentTier.count >= 10
    ) {
        const tierNames = ["Whosit", "Whatsit", "Doohickey", "Gizmo", "Widget", "Contraption", "Gubbins", "Doodad", "Thingummy", "Thingamajig"];
        const tierDescs = ["Unlocks mysterious powers.", "Does something even stranger."]; // Add more
        
        const nextTierId = `tier${incrementers.length + 1}`;
        const nextTierName = tierNames[incrementers.length % tierNames.length];
        const nextTierDesc = tierDescs[incrementers.length % tierDescs.length];
        
        const newTier = {
            id: nextTierId,
            name: nextTierName,
            description: nextTierDesc,
            count: 0,
            baseCost: safeNumber(currentTier.baseCost * 10), // Example scaling
            costMultiplier: currentTier.costMultiplier + 0.05, // Example scaling
            currentCost: 0, // Will be calculated
            baseValue: safeNumber(currentTier.baseValue * 2), // Example scaling
            upgrades: { multiplier: 1, flatBonus: 0 },
            individualProductionValue: 0,
            totalProductionFromType: 0,
        };
        calculateIncrementerCost(newTier);
        calculateIncrementerProduction(newTier);
        incrementers.push(newTier);

        // TODO: Add logic to create/unlock upgrades for this new tier
        // This would involve dynamically adding to gameState.upgrades (definitions)
        // and potentially calling a function similar to the old getUpgradesForTier
        // but adapted for the new upgrade definition structure.
        // For example:
        // const newTierUpgrades = generateUpgradesForNewTier(newTier, allUpgradeDefinitions);
        // Object.assign(allUpgradeDefinitions, newTierUpgrades); // If allUpgradeDefinitions is mutable
    }
}
*/