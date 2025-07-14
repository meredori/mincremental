import {
  initializeGame,
  purchaseIncrementer,
  applyUpgrade,
  updateGameTick,
} from './linearGameLogic';

// Mock initialIncrementers structure for comparison if needed,
// or rely on known values from linearGameLogic.js
const expectedInitialThingamabob = {
  id: 'thingamabob',
  name: 'Thingamabob',
  description: 'A curious little gadget that does... something.',
  count: 0,
  baseCost: 10,
  costMultiplier: 1.15,
  currentCost: 10, // Initial calculation: 10 * 1.15^0
  baseValue: 1,    // REQ-005
  upgrades: {
    multiplier: 1,
    flatBonus: 0,
  },
  individualProductionValue: 1, // (1 + 0) * 1
  totalProductionFromType: 0, // 0 * 1
};

describe('linearGameLogic', () => {
  describe('initializeGame', () => {
    let gameState;

    beforeEach(() => {
      gameState = initializeGame();
    });

    test('REQ-003, REQ-005: should initialize game state correctly', () => {
      expect(gameState.score).toBe(10); // Updated for initial score fix
      expect(gameState.totalPerSecond).toBe(0);
      expect(gameState.incrementers).toBeInstanceOf(Array);
      expect(gameState.incrementers.length).toBeGreaterThan(0);
      expect(gameState.purchasedUpgrades).toEqual([]);
      expect(gameState.settings.showPurchased).toBe(false); // REQ-003
    });

    test('REQ-005: should initialize thingamabob incrementer correctly', () => {
      const thingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');
      expect(thingamabob).toBeDefined();
      expect(thingamabob.baseValue).toBe(expectedInitialThingamabob.baseValue); // REQ-005
      expect(thingamabob.count).toBe(expectedInitialThingamabob.count);
      expect(thingamabob.baseCost).toBe(expectedInitialThingamabob.baseCost);
      expect(thingamabob.costMultiplier).toBe(expectedInitialThingamabob.costMultiplier);
      expect(thingamabob.currentCost).toBe(expectedInitialThingamabob.currentCost); // Initial cost
      expect(thingamabob.upgrades).toEqual(expectedInitialThingamabob.upgrades);
      expect(thingamabob.individualProductionValue).toBe(expectedInitialThingamabob.individualProductionValue); // REQ-002 (implicitly tested)
      expect(thingamabob.totalProductionFromType).toBe(expectedInitialThingamabob.totalProductionFromType); // REQ-001 (implicitly tested)
    });

    test('REQ-004: all initial numeric values should be whole numbers where specified', () => {
      expect(Number.isInteger(gameState.score)).toBe(true);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true);
      gameState.incrementers.forEach(inc => {
        expect(Number.isInteger(inc.count)).toBe(true);
        expect(Number.isInteger(inc.baseCost)).toBe(true);
        // costMultiplier can be float
        expect(Number.isInteger(inc.currentCost)).toBe(true);
        expect(Number.isInteger(inc.baseValue)).toBe(true);
        expect(Number.isInteger(inc.upgrades.flatBonus)).toBe(true);
        // upgrades.multiplier can be float
        expect(Number.isInteger(inc.individualProductionValue)).toBe(true);
        expect(Number.isInteger(inc.totalProductionFromType)).toBe(true);
      });
    });
  });

  describe('calculateIncrementerCost (tested via purchaseIncrementer and initializeGame)', () => {
    test('REQ-004: cost should be a whole number and increase with count', () => {
      let gameState = initializeGame();
      const thingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');
      
      expect(Number.isInteger(thingamabob.currentCost)).toBe(true);
      expect(thingamabob.currentCost).toBe(10); // 10 * 1.15^0

      // Simulate purchase to check next cost
      thingamabob.count = 1;
      // Manually call what purchaseIncrementer would do for cost calculation part
      // This is a bit of a workaround as calculateIncrementerCost is not exported
      // A better approach would be to test through purchaseIncrementer
      let tempGameState = { ...gameState, incrementers: [ { ...thingamabob} ] };
      tempGameState = purchaseIncrementer(tempGameState, 'thingamabob'); // Need score to do this
      
      // Let's re-initialize and purchase properly
      gameState = initializeGame();
      gameState.score = 100; // Enough to buy
      
      gameState = purchaseIncrementer(gameState, 'thingamabob'); // Buys 1st
      const purchasedThingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');
      expect(purchasedThingamabob.count).toBe(1);
      expect(Number.isInteger(purchasedThingamabob.currentCost)).toBe(true);
      // Cost of 2nd: 10 * 1.15^1 = 11.5, floored to 11
      expect(purchasedThingamabob.currentCost).toBe(11); 

      gameState = purchaseIncrementer(gameState, 'thingamabob'); // Buys 2nd
      const purchasedAgainThingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');
      expect(purchasedAgainThingamabob.count).toBe(2);
      // Cost of 3rd: 10 * 1.15^2 = 10 * 1.3225 = 13.225, floored to 13
      expect(Number.isInteger(purchasedAgainThingamabob.currentCost)).toBe(true);
      expect(purchasedAgainThingamabob.currentCost).toBe(13);
    });
  });

  describe('calculateIncrementerProduction (tested via purchaseIncrementer, applyUpgrade and initializeGame)', () => {
    test('REQ-001, REQ-002, REQ-004: production values should be correct and whole numbers', () => {
      let gameState = initializeGame();
      let thingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');

      expect(Number.isInteger(thingamabob.individualProductionValue)).toBe(true); // REQ-004
      expect(thingamabob.individualProductionValue).toBe(1); // REQ-002 (baseValue * multiplier + flatBonus)
      expect(Number.isInteger(thingamabob.totalProductionFromType)).toBe(true); // REQ-004
      expect(thingamabob.totalProductionFromType).toBe(0); // REQ-001 (count * individualProductionValue)

      // Simulate purchase
      gameState.score = 100; // Enough score
      gameState = purchaseIncrementer(gameState, 'thingamabob');
      thingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');
      
      expect(thingamabob.count).toBe(1);
      expect(thingamabob.individualProductionValue).toBe(1);
      expect(thingamabob.totalProductionFromType).toBe(1); // 1 * 1

      gameState = purchaseIncrementer(gameState, 'thingamabob');
      thingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');

      expect(thingamabob.count).toBe(2);
      expect(thingamabob.individualProductionValue).toBe(1);
      expect(thingamabob.totalProductionFromType).toBe(2); // 2 * 1 (REQ-001: additive)
    });
  });

  describe('calculateTotalPerSecond (tested via purchaseIncrementer, applyUpgrade, initializeGame, updateGameTick)', () => {
    test('REQ-004: should sum production from all incrementers and be a whole number', () => {
      let gameState = initializeGame();
      expect(gameState.totalPerSecond).toBe(0);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true);

      gameState.score = 100;
      gameState = purchaseIncrementer(gameState, 'thingamabob'); // thingamabob produces 1
      expect(gameState.totalPerSecond).toBe(1);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true);
      
      gameState = purchaseIncrementer(gameState, 'thingamabob'); // thingamabob now produces 2 total
      expect(gameState.totalPerSecond).toBe(2);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true);

      // If there were other incrementer types, their production would add here.
      // For now, only 'thingamabob' exists in initialIncrementers.
    });
  });

  describe('purchaseIncrementer', () => {
    let gameState;

    beforeEach(() => {
      gameState = initializeGame();
      gameState.score = 100; // Set enough score for purchases
    });

    test('should update counts, costs, score, and production correctly', () => {
      const initialScore = gameState.score;
      const thingamabobInitialCost = gameState.incrementers.find(i => i.id === 'thingamabob').currentCost;

      gameState = purchaseIncrementer(gameState, 'thingamabob');
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(thingamabob.count).toBe(1);
      expect(gameState.score).toBe(initialScore - thingamabobInitialCost);
      expect(Number.isInteger(gameState.score)).toBe(true); // REQ-004
      
      // Cost of next one (10 * 1.15^1 = 11.5, floored to 11)
      expect(thingamabob.currentCost).toBe(11); 
      expect(Number.isInteger(thingamabob.currentCost)).toBe(true); // REQ-004

      expect(thingamabob.individualProductionValue).toBe(1);
      expect(Number.isInteger(thingamabob.individualProductionValue)).toBe(true); // REQ-004
      expect(thingamabob.totalProductionFromType).toBe(1); // 1 * 1
      expect(Number.isInteger(thingamabob.totalProductionFromType)).toBe(true); // REQ-004
      
      expect(gameState.totalPerSecond).toBe(1);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true); // REQ-004
    });

    test('should not purchase if score is insufficient', () => {
      gameState.score = 5; // Not enough for thingamabob (costs 10)
      const originalGameState = JSON.parse(JSON.stringify(gameState));

      gameState = purchaseIncrementer(gameState, 'thingamabob');
      
      expect(gameState).toEqual(originalGameState); // State should not change
    });

    test('REQ-004: all relevant values remain whole numbers after purchase', () => {
        gameState = purchaseIncrementer(gameState, 'thingamabob');
        const thingamabob = gameState.incrementers.find(inc => inc.id === 'thingamabob');

        expect(Number.isInteger(gameState.score)).toBe(true);
        expect(Number.isInteger(thingamabob.count)).toBe(true);
        expect(Number.isInteger(thingamabob.currentCost)).toBe(true);
        expect(Number.isInteger(thingamabob.individualProductionValue)).toBe(true);
        expect(Number.isInteger(thingamabob.totalProductionFromType)).toBe(true);
        expect(Number.isInteger(gameState.totalPerSecond)).toBe(true);
    });
  });

  describe('applyUpgrade', () => {
    let gameState;
    const mockAllUpgradeDefinitions = {
      'upgrade_thing_flat': {
        id: 'upgrade_thing_flat',
        name: 'Thing Flat Bonus',
        description: '+2 to Thingamabob base production',
        cost: 20, // REQ-004: whole number cost
        effects: [{ targetId: 'thingamabob', type: 'FLAT_BONUS', value: 2 }], // REQ-006
        unlockConditions: { score: 10 }
      },
      'upgrade_thing_mult': {
        id: 'upgrade_thing_mult',
        name: 'Thing Multiplier',
        description: 'x1.5 to Thingamabob production',
        cost: 50,
        effects: [{ targetId: 'thingamabob', type: 'MULTIPLIER', value: 1.5 }], // REQ-006
        unlockConditions: { score: 40 }
      },
      'upgrade_global_mult': {
        id: 'upgrade_global_mult',
        name: 'Global Multiplier',
        description: 'x1.1 to all production',
        cost: 100,
        effects: [{ targetId: 'GLOBAL', type: 'GLOBAL_MULTIPLIER', value: 1.1 }], // REQ-006
        unlockConditions: { score: 80 }
      },
       'upgrade_thing_set_base': {
        id: 'upgrade_thing_set_base',
        name: 'Set Thingamabob Base',
        description: 'Set Thingamabob base value to 5',
        cost: 70,
        effects: [{ targetId: 'thingamabob', type: 'SET_BASE_VALUE', value: 5 }],
        unlockConditions: { score: 60 }
      },
      'req_005_upgrade_1': { // To test REQ-005
        id: 'req_005_upgrade_1', cost: 1, effects: [{ targetId: 'thingamabob', type: 'FLAT_BONUS', value: 0 }], unlockConditions: {}
      },
      'req_005_upgrade_2_makes_2': { // To test REQ-005
        id: 'req_005_upgrade_2_makes_2', cost: 1, effects: [{ targetId: 'thingamabob', type: 'SET_BASE_VALUE', value: 2 }], unlockConditions: {}
      }
    };

    beforeEach(() => {
      gameState = initializeGame();
      gameState.score = 200; // Sufficient score for upgrades
      // Buy one thingamabob to see production changes
      gameState = purchaseIncrementer(gameState, 'thingamabob'); // score becomes 200-10=190, thingamabob prod=1, totalProd=1
    });

    test('should apply FLAT_BONUS upgrade correctly', () => {
      gameState = applyUpgrade(gameState, 'upgrade_thing_flat', mockAllUpgradeDefinitions);
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');
      
      expect(gameState.score).toBe(190 - 20); // 170
      expect(gameState.purchasedUpgrades).toContain('upgrade_thing_flat');
      expect(thingamabob.upgrades.flatBonus).toBe(2);
      // Production: (baseValue 1 + flatBonus 2) * multiplier 1 = 3
      expect(thingamabob.individualProductionValue).toBe(3);
      expect(Number.isInteger(thingamabob.individualProductionValue)).toBe(true); // REQ-004
      expect(thingamabob.totalProductionFromType).toBe(3); // count 1 * 3
      expect(Number.isInteger(thingamabob.totalProductionFromType)).toBe(true); // REQ-004
      expect(gameState.totalPerSecond).toBe(3);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true); // REQ-004
    });

    test('should apply MULTIPLIER upgrade correctly', () => {
      // Initial state: thingamabob individual prod = 1
      gameState = applyUpgrade(gameState, 'upgrade_thing_mult', mockAllUpgradeDefinitions);
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(gameState.score).toBe(190 - 50); // 140
      expect(gameState.purchasedUpgrades).toContain('upgrade_thing_mult');
      expect(thingamabob.upgrades.multiplier).toBe(1.5);
      // Production: (baseValue 1 + flatBonus 0) * multiplier 1.5 = 1.5, floored to 1
      expect(thingamabob.individualProductionValue).toBe(1); // REQ-004 (floor)
      expect(thingamabob.totalProductionFromType).toBe(1); // count 1 * 1
      expect(gameState.totalPerSecond).toBe(1);
    });
    
    test('should apply MULTIPLIER after FLAT_BONUS correctly', () => {
      gameState = applyUpgrade(gameState, 'upgrade_thing_flat', mockAllUpgradeDefinitions); // score 170, flatBonus 2, indProd 3
      gameState = applyUpgrade(gameState, 'upgrade_thing_mult', mockAllUpgradeDefinitions); // score 170-50=120, mult 1.5
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(gameState.score).toBe(120);
      expect(thingamabob.upgrades.flatBonus).toBe(2);
      expect(thingamabob.upgrades.multiplier).toBe(1.5);
      // Production: (baseValue 1 + flatBonus 2) * multiplier 1.5 = 3 * 1.5 = 4.5, floored to 4
      expect(thingamabob.individualProductionValue).toBe(4); // REQ-004
      expect(thingamabob.totalProductionFromType).toBe(4); // count 1 * 4
      expect(gameState.totalPerSecond).toBe(4);
    });

    test('should apply SET_BASE_VALUE upgrade correctly', () => {
      gameState = applyUpgrade(gameState, 'upgrade_thing_set_base', mockAllUpgradeDefinitions);
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(gameState.score).toBe(190 - 70); // 120
      expect(gameState.purchasedUpgrades).toContain('upgrade_thing_set_base');
      expect(thingamabob.baseValue).toBe(5);
      // Production: (new baseValue 5 + flatBonus 0) * multiplier 1 = 5
      expect(thingamabob.individualProductionValue).toBe(5);
      expect(thingamabob.totalProductionFromType).toBe(5);
      expect(gameState.totalPerSecond).toBe(5);
    });

    test('should apply GLOBAL_MULTIPLIER upgrade correctly to all incrementers', () => {
      // Assume another incrementer type if it existed
      // For now, only thingamabob
      gameState = applyUpgrade(gameState, 'upgrade_global_mult', mockAllUpgradeDefinitions);
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(gameState.score).toBe(190 - 100); // 90
      expect(gameState.purchasedUpgrades).toContain('upgrade_global_mult');
      expect(thingamabob.upgrades.multiplier).toBe(1 * 1.1); // Initial 1 * global 1.1
      // Production: (baseValue 1 + flatBonus 0) * new multiplier 1.1 = 1.1, floored to 1
      expect(thingamabob.individualProductionValue).toBe(1);
      expect(thingamabob.totalProductionFromType).toBe(1);
      expect(gameState.totalPerSecond).toBe(1);
    });

    test('should not apply upgrade if score is insufficient', () => {
      gameState.score = 10; // Not enough for 'upgrade_thing_flat' (costs 20)
      const originalGameState = JSON.parse(JSON.stringify(gameState));
      
      gameState = applyUpgrade(gameState, 'upgrade_thing_flat', mockAllUpgradeDefinitions);
      expect(gameState).toEqual(originalGameState);
    });

    test('should not apply upgrade if already purchased', () => {
      gameState = applyUpgrade(gameState, 'upgrade_thing_flat', mockAllUpgradeDefinitions);
      const scoreAfterFirstPurchase = gameState.score;
      const originalPurchasedUpgrades = [...gameState.purchasedUpgrades];
      
      gameState = applyUpgrade(gameState, 'upgrade_thing_flat', mockAllUpgradeDefinitions); // Try to buy again
      
      expect(gameState.score).toBe(scoreAfterFirstPurchase);
      expect(gameState.purchasedUpgrades).toEqual(originalPurchasedUpgrades);
    });

    test('REQ-004: upgrade costs and effects result in whole numbers for relevant game state values', () => {
      gameState = applyUpgrade(gameState, 'upgrade_thing_flat', mockAllUpgradeDefinitions); // cost 20
      const thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(Number.isInteger(gameState.score)).toBe(true);
      expect(Number.isInteger(thingamabob.individualProductionValue)).toBe(true);
      expect(Number.isInteger(thingamabob.totalProductionFromType)).toBe(true);
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true);

      // Test with a multiplier that could result in float before floor
      gameState = initializeGame();
      gameState.score = 200;
      gameState = purchaseIncrementer(gameState, 'thingamabob'); // score 190
      gameState = applyUpgrade(gameState, 'upgrade_thing_mult', mockAllUpgradeDefinitions); // cost 50
      const thingamabob2 = gameState.incrementers.find(i => i.id === 'thingamabob');

      expect(Number.isInteger(gameState.score)).toBe(true); // 190 - 50 = 140
      expect(Number.isInteger(thingamabob2.individualProductionValue)).toBe(true); // (1+0)*1.5 = 1.5 -> 1
      expect(Number.isInteger(thingamabob2.totalProductionFromType)).toBe(true); // 1*1 = 1
      expect(Number.isInteger(gameState.totalPerSecond)).toBe(true); // 1
    });

    test('REQ-005: Thingamabob value remains 1 after some upgrades, then becomes 2', () => {
      // Initial: thingamabob.baseValue = 1, .individualProductionValue = 1
      // Apply some non-value changing upgrades or small flat bonuses that get floored away if base is low
      gameState = applyUpgrade(gameState, 'req_005_upgrade_1', mockAllUpgradeDefinitions); // cost 1, flat_bonus 0
      let thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');
      expect(thingamabob.individualProductionValue).toBe(1); // (1+0)*1 = 1

      // Apply another similar upgrade
      gameState.score = 100; // Reset score
      gameState = applyUpgrade(gameState, 'req_005_upgrade_1', mockAllUpgradeDefinitions);
      thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');
      // Note: applyUpgrade won't apply same upgrade twice. Need different dummy upgrades or a different approach.
      // For REQ-005, the pseudocode implies specific upgrades are designed to achieve this.
      // Let's assume 'req_005_upgrade_1' is one of the "N upgrades"
      // And 'req_005_upgrade_2_makes_2' is one of the "M upgrades"
      
      // Reset for clarity
      gameState = initializeGame();
      gameState.score = 200;
      gameState = purchaseIncrementer(gameState, 'thingamabob'); // thingamabob prod 1

      // Simulate "N upgrades" that don't change its value from 1 (e.g. small flat bonuses that don't overcome floor, or multipliers < 2 on base 1)
      // The provided 'req_005_upgrade_1' has flat_bonus: 0, so it won't change it.
      // Let's assume a few such upgrades are applied. The test for this specific requirement might be better
      // if the upgrade definitions are more aligned with the "N" and "M" concept.
      // For now, we'll use the provided SET_BASE_VALUE upgrade to demonstrate the change.
      
      gameState = applyUpgrade(gameState, 'req_005_upgrade_1', mockAllUpgradeDefinitions); // No change
      thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');
      expect(thingamabob.individualProductionValue).toBe(1);

      gameState.score = 100; // Replenish score
      gameState = applyUpgrade(gameState, 'req_005_upgrade_2_makes_2', mockAllUpgradeDefinitions); // Sets baseValue to 2
      thingamabob = gameState.incrementers.find(i => i.id === 'thingamabob');
      expect(thingamabob.baseValue).toBe(2);
      expect(thingamabob.individualProductionValue).toBe(2); // (2+0)*1 = 2
    });

    // REQ-006 tests are implicitly covered by ensuring effect values are smaller
    // and checking the outcomes of applyUpgrade with specific values.
    // E.g., 'upgrade_thing_flat' has value: 2, which is a "smaller, predefined amount".
    // 'upgrade_global_mult' has value: 1.1 (10% increase), which is smaller.
  });

  describe('updateGameTick', () => {
    let gameState;

    beforeEach(() => {
      gameState = initializeGame();
    });

    test('REQ-004: should update score correctly based on totalPerSecond, ensuring whole numbers', () => {
      // gameState is from initializeGame() in beforeEach, but we'll re-initialize for clarity
      // as this test needs specific setups for totalPerSecond.

      // --- Part 1: Test with totalPerSecond = 5 ---
      gameState = initializeGame();
      // Ensure enough score to buy 5 'thingamabob' incrementers.
      // Each 'thingamabob' initially produces 1/sec. Cost progression: 10, 11, 13, 15, 17. Total: 66.
      gameState.score = 200;
      
      for (let i = 0; i < 5; i++) {
        gameState = purchaseIncrementer(gameState, 'thingamabob');
      }
      // After purchases, gameState.totalPerSecond should be 5.
      // gameState.score would be 200 - 66 = 134.
      
      gameState.score = 10; // Set score to 10 for this specific assertion point as in the original test
      
      gameState = updateGameTick(gameState);
      // updateGameTick calls calculateTotalPerSecond (which should yield 5)
      // then adds it to score. Expected: 10 (manually set) + 5 (calculated) = 15.
      expect(gameState.score).toBe(15);
      expect(Number.isInteger(gameState.score)).toBe(true);

      // --- Part 2: Test with totalPerSecond = 3, with score starting at 15 (simulating continuation) ---
      gameState = initializeGame();
      // Ensure enough score for 3 'thingamabob' incrementers.
      // Cost progression: 10, 11, 13. Total: 34.
      gameState.score = 200;

      for (let i = 0; i < 3; i++) {
        gameState = purchaseIncrementer(gameState, 'thingamabob');
      }
      // After purchases, gameState.totalPerSecond should be 3.
      // gameState.score would be 200 - 34 = 166.

      // Set score to 15 (the result of the previous conceptual tick) for this assertion
      gameState.score = 15;
      
      gameState = updateGameTick(gameState);
      // updateGameTick calls calculateTotalPerSecond (which should yield 3)
      // then adds it to score. Expected: 15 (manually set) + 3 (calculated) = 18.
      expect(gameState.score).toBe(18);
      expect(Number.isInteger(gameState.score)).toBe(true);
    });

    test('should handle zero totalPerSecond', () => {
      gameState.totalPerSecond = 0;
      gameState.score = 10;

      gameState = updateGameTick(gameState);
      expect(gameState.score).toBe(10); // 10 + 0
      expect(Number.isInteger(gameState.score)).toBe(true);
    });
    
    test('should recalculate totalPerSecond before updating score (defensive check)', () => {
        gameState.score = 0;
        // Buy a thingamabob, which should make totalPerSecond = 1
        gameState.score = 10; // afford it
        gameState = purchaseIncrementer(gameState, 'thingamabob');
        expect(gameState.totalPerSecond).toBe(1);
        
        // Now, if updateGameTick is called, it should use this 1
        gameState.score = 0; // reset score for clarity of tick effect
        gameState = updateGameTick(gameState);
        expect(gameState.score).toBe(1); // 0 + 1
    });
  });
});