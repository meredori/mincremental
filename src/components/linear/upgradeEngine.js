// src/components/linear/upgradeEngine.js

/**
 * Utility: Validate and sanitize a number (non-negative, finite, not NaN)
 * Ensures whole numbers as per REQ-004 for costs, and allows safe processing of effect values.
 */
function safeNumber(val, fallback = 0, floorOutput = true) {
  if (typeof val !== "number" || !isFinite(val) || isNaN(val)) {
    return floorOutput ? Math.floor(fallback) : fallback;
  }
  const result = val < 0 ? fallback : val;
  return floorOutput ? Math.floor(result) : result;
}

// Define all upgrades available in the game.
// REQ-005: First incrementer ('thingamabob') upgrades should be small.
// REQ-006: Overall upgrade impact reduced, costs might be higher.
// REQ-004: All costs must be whole numbers.
export const allUpgradeDefinitions = {
  // --- Thingamabob Upgrades (REQ-005) ---
  'thingamabob_flat_1': {
    id: 'thingamabob_flat_1',
    name: 'Minor Tweak',
    description: 'Slightly improves Thingamabob output. (+0.2 to base effectiveness)',
    cost: safeNumber(20), // REQ-004, REQ-006
    effects: [
      { targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0.2 } // REQ-005
    ],
    tier: 1,
  },
  'thingamabob_flat_2': {
    id: 'thingamabob_flat_2',
    name: 'Small Adjustment',
    description: 'Another small boost to Thingamabobs. (+0.2 to base effectiveness)',
    cost: safeNumber(30),
    effects: [
      { targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0.2 }
    ],
    tier: 1,
    unlockConditions: { purchasedUpgrades: ['thingamabob_flat_1'] } // Example unlock
  },
  'thingamabob_flat_3': {
    id: 'thingamabob_flat_3',
    name: 'Fine Tuning',
    description: 'More fine tuning for Thingamabobs. (+0.2 to base effectiveness)',
    cost: safeNumber(45),
    effects: [
      { targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0.2 }
    ],
    tier: 1,
    unlockConditions: { purchasedUpgrades: ['thingamabob_flat_2'] }
  },
  'thingamabob_flat_4': {
    id: 'thingamabob_flat_4',
    name: 'Calibration',
    description: 'Calibrating Thingamabobs. (+0.2 to base effectiveness)',
    cost: safeNumber(65),
    effects: [
      { targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0.2 }
    ],
    tier: 1,
    unlockConditions: { purchasedUpgrades: ['thingamabob_flat_3'] }
  },
  'thingamabob_flat_5_milestone': {
    id: 'thingamabob_flat_5_milestone',
    name: 'Efficiency Breakthrough!',
    description: 'Thingamabobs are now noticeably better! (+0.2, should make them produce 2 with base 1 after 5 such upgrades)',
    cost: safeNumber(100),
    effects: [
      { targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0.2 }
      // After this, total flatBonus = 1.0. If baseValue = 1, individualProduction = floor((1+1)*multiplier)
    ],
    tier: 1,
    unlockConditions: { purchasedUpgrades: ['thingamabob_flat_4'] }
  },
  'thingamabob_mult_1': {
    id: 'thingamabob_mult_1',
    name: 'Thingamabob Gearing',
    description: 'Improves Thingamabob output by 5%.',
    cost: safeNumber(150),
    effects: [
      // REQ-006: Smaller multiplier
      { targetId: 'thingamabob', type: 'MULTIPLIER', value: 1.05 }
    ],
    tier: 1,
    unlockConditions: { incrementerCount: { id: 'thingamabob', count: 10 } }
  },

  // --- Global Upgrades (REQ-006) ---
  'global_mult_1': {
    id: 'global_mult_1',
    name: 'Universal Production Boost I',
    description: 'All incrementers produce 2% more.',
    cost: safeNumber(500), // REQ-006: Higher cost
    effects: [
      // REQ-006: Smaller multiplier
      { targetId: 'GLOBAL', type: 'GLOBAL_MULTIPLIER', value: 1.02 }
    ],
    tier: 0, // Or some general tier
    unlockConditions: { score: 1000 } // Example: unlock when score reaches 1000
  },
  'global_mult_2': {
    id: 'global_mult_2',
    name: 'Universal Production Boost II',
    description: 'All incrementers produce an additional 3% more.',
    cost: safeNumber(2500),
    effects: [
      { targetId: 'GLOBAL', type: 'GLOBAL_MULTIPLIER', value: 1.03 }
    ],
    tier: 0,
    unlockConditions: { purchasedUpgrades: ['global_mult_1'], score: 5000 }
  },
  // Add more upgrades for other incrementers and global effects as needed
  // Example for a second incrementer type 'widget'
  /*
  'widget_base_value_1': {
    id: 'widget_base_value_1',
    name: 'Improved Widgets',
    description: 'Increases base production of Widgets by 5.',
    cost: safeNumber(1000),
    effects: [
      { targetId: 'widget', type: 'FLAT_BONUS', value: 5 }
    ],
    tier: 2, // Assuming widget is tier 2
    unlockConditions: { incrementerCount: { id: 'widget', count: 1 } }
  },
  'widget_mult_1': {
    id: 'widget_mult_1',
    name: 'Widget Assembly Line',
    description: 'Improves Widget output by 10%.',
    cost: safeNumber(2000),
    effects: [
      { targetId: 'widget', type: 'MULTIPLIER', value: 1.10 }
    ],
    tier: 2,
    unlockConditions: { incrementerCount: { id: 'widget', count: 10 } }
  },
  */
};

/**
 * Retrieves a deep copy of a specific upgrade definition.
 * @param {string} upgradeId - The ID of the upgrade to retrieve.
 * @returns {object | undefined} The upgrade definition or undefined if not found.
 */
export function getUpgradeDefinition(upgradeId) {
  if (allUpgradeDefinitions[upgradeId]) {
    return JSON.parse(JSON.stringify(allUpgradeDefinitions[upgradeId]));
  }
  return undefined;
}

/**
 * Retrieves all upgrade definitions.
 * @returns {object} A new object containing all upgrade definitions.
 */
export function getAllUpgradeDefinitions() {
    return JSON.parse(JSON.stringify(allUpgradeDefinitions));
}


/**
 * Gets all upgrades that are currently available for purchase.
 * Availability can be based on unlock conditions being met and not already purchased.
 * @param {object} gameState - The current game state.
 * @returns {Array<object>} An array of available upgrade definitions.
 */
export function getAvailableUpgrades(gameState) {
  const available = [];
  for (const id in allUpgradeDefinitions) {
    const definition = allUpgradeDefinitions[id];
    if (gameState.purchasedUpgrades && gameState.purchasedUpgrades.includes(id)) {
      continue; // Already purchased
    }

    let unlocked = true; // Assume unlocked if no conditions
    if (definition.unlockConditions) {
      unlocked = checkUnlockConditions(definition.unlockConditions, gameState);
    }

    if (unlocked) {
      const displayDefinition = JSON.parse(JSON.stringify(definition));
      // Optionally add affordability for UI, though linearGameLogic handles actual purchase logic
      displayDefinition.isAffordable = gameState.score >= safeNumber(displayDefinition.cost);
      available.push(displayDefinition);
    }
  }
  return available;
}

/**
 * Checks if the unlock conditions for an upgrade are met.
 * @param {object} conditions - The unlockConditions object from an upgrade definition.
 * @param {object} gameState - The current game state.
 * @returns {boolean} True if all conditions are met, false otherwise.
 */
function checkUnlockConditions(conditions, gameState) {
  if (!conditions) return true; // No conditions means it's unlocked (or unlocked by other means)

  if (conditions.score) {
    if (gameState.score < safeNumber(conditions.score)) {
      return false;
    }
  }

  if (conditions.incrementerCount) {
    const targetInc = gameState.incrementers.find(inc => inc.id === conditions.incrementerCount.id);
    if (!targetInc || targetInc.count < safeNumber(conditions.incrementerCount.count)) {
      return false;
    }
  }

  if (conditions.purchasedUpgrades) {
    for (const requiredUpgradeId of conditions.purchasedUpgrades) {
      if (!gameState.purchasedUpgrades.includes(requiredUpgradeId)) {
        return false;
      }
    }
  }
  // Add more condition types here as needed

  return true; // All specified conditions met
}