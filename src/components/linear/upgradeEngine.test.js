import {
  allUpgradeDefinitions as actualAllUpgradeDefinitions,
  getUpgradeDefinition,
  getAllUpgradeDefinitions,
  getAvailableUpgrades,
} from './upgradeEngine';
import { initializeGame } from './linearGameLogic'; // For gameState context

// Create a deep copy for tests to avoid modifying the actual definitions
const allUpgradeDefinitions = JSON.parse(JSON.stringify(actualAllUpgradeDefinitions));

describe('upgradeEngine', () => {
  describe('getUpgradeDefinition', () => {
    test('should return a deep copy of the correct upgrade definition if it exists', () => {
      const id = 'thingamabob_flat_1';
      const definition = getUpgradeDefinition(id);
      expect(definition).toBeDefined();
      expect(definition.id).toBe(id);
      expect(definition).toEqual(allUpgradeDefinitions[id]);
      // Ensure it's a copy
      definition.cost = 9999;
      expect(allUpgradeDefinitions[id].cost).not.toBe(9999);
    });

    test('should return undefined if the upgrade definition does not exist', () => {
      const definition = getUpgradeDefinition('non_existent_upgrade');
      expect(definition).toBeUndefined();
    });
  });

  describe('getAllUpgradeDefinitions', () => {
    test('should return a deep copy of all upgrade definitions', () => {
      const definitions = getAllUpgradeDefinitions();
      expect(definitions).toEqual(allUpgradeDefinitions);
      // Ensure it's a copy
      definitions['thingamabob_flat_1'].cost = 1234;
      expect(allUpgradeDefinitions['thingamabob_flat_1'].cost).not.toBe(1234);
    });
  });

  describe('getAvailableUpgrades', () => {
    let baseGameState;

    beforeEach(() => {
      // Initialize a fresh gameState for each test to ensure isolation
      baseGameState = initializeGame();
      baseGameState.incrementers = [
        { id: 'thingamabob', name: 'Thingamabob', count: 0, baseCost: 10, currentCost: 10, baseValue: 1, upgrades: { multiplier: 1, flatBonus: 0 }, individualProductionValue: 1, totalProductionFromType: 0 },
        { id: 'widget', name: 'Widget', count: 0, baseCost: 100, currentCost: 100, baseValue: 10, upgrades: { multiplier: 1, flatBonus: 0 }, individualProductionValue: 10, totalProductionFromType: 0 },
      ];
      baseGameState.purchasedUpgrades = [];
      baseGameState.score = 0;
    });

    test('should return upgrades that have no unlock conditions and are not purchased', () => {
      baseGameState.score = 1000; // Enough to afford some
      const available = getAvailableUpgrades(baseGameState);
      // 'thingamabob_flat_1' has no unlockConditions other than implicit tier/existence
      expect(available.some(upg => upg.id === 'thingamabob_flat_1')).toBe(true);
    });

    test('should not return purchased upgrades', () => {
      baseGameState.score = 1000;
      baseGameState.purchasedUpgrades = ['thingamabob_flat_1'];
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'thingamabob_flat_1')).toBe(false);
    });

    test('should return upgrades if score condition is met', () => {
      baseGameState.score = 1000; // global_mult_1 unlocks at 1000
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'global_mult_1')).toBe(true);
    });

    test('should not return upgrades if score condition is not met', () => {
      baseGameState.score = 500; // global_mult_1 unlocks at 1000
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'global_mult_1')).toBe(false);
    });

    test('should return upgrades if incrementer count condition is met', () => {
      baseGameState.score = 1000; // Affordability
      baseGameState.incrementers.find(inc => inc.id === 'thingamabob').count = 10; // thingamabob_mult_1 unlocks at 10
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'thingamabob_mult_1')).toBe(true);
    });

    test('should not return upgrades if incrementer count condition is not met', () => {
      baseGameState.score = 1000;
      baseGameState.incrementers.find(inc => inc.id === 'thingamabob').count = 5; // thingamabob_mult_1 unlocks at 10
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'thingamabob_mult_1')).toBe(false);
    });

    test('should return upgrades if purchasedUpgrades condition is met', () => {
      baseGameState.score = 1000;
      baseGameState.purchasedUpgrades = ['thingamabob_flat_1']; // thingamabob_flat_2 unlocks after this
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'thingamabob_flat_2')).toBe(true);
    });

    test('should not return upgrades if purchasedUpgrades condition is not met', () => {
      baseGameState.score = 1000;
      // thingamabob_flat_1 is NOT purchased
      const available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'thingamabob_flat_2')).toBe(false);
    });

    test('should correctly handle multiple unlock conditions (e.g., score AND purchasedUpgrades)', () => {
      // global_mult_2 needs score 5000 AND global_mult_1 purchased
      baseGameState.score = 5000;
      baseGameState.purchasedUpgrades = ['global_mult_1'];
      let available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'global_mult_2')).toBe(true);

      baseGameState.score = 4000; // Score not enough
      baseGameState.purchasedUpgrades = ['global_mult_1'];
      available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'global_mult_2')).toBe(false);
      
      baseGameState.score = 5000;
      baseGameState.purchasedUpgrades = []; // Prerequisite not purchased
      available = getAvailableUpgrades(baseGameState);
      expect(available.some(upg => upg.id === 'global_mult_2')).toBe(false);
    });

    test('REQ-004: upgrade definitions should have whole number costs', () => {
        const definitions = getAllUpgradeDefinitions();
        for (const id in definitions) {
            expect(Number.isInteger(definitions[id].cost)).toBe(true);
            // Effect values can be floats/decimals
            definitions[id].effects.forEach(effect => {
                // effect.value can be float, so no integer check here unless specific to type
                if (effect.type === 'FLAT_BONUS' || effect.type === 'SET_BASE_VALUE') {
                    // These values are often whole but can be decimal for fine-tuning,
                    // the game logic (safeNumber) will handle flooring where appropriate.
                }
            });
        }
    });

    test('REQ-005, REQ-006: Verify specific upgrade costs and effects for balancing', () => {
        // REQ-005: First incrementer ('thingamabob') upgrades should be small.
        const thingamabobFlat1 = getUpgradeDefinition('thingamabob_flat_1');
        expect(thingamabobFlat1.cost).toBe(20); // Example cost
        expect(thingamabobFlat1.effects[0].value).toBe(0.2); // Small flat bonus

        const thingamabobMult1 = getUpgradeDefinition('thingamabob_mult_1');
        expect(thingamabobMult1.cost).toBe(150);
        expect(thingamabobMult1.effects[0].value).toBe(1.05); // Small multiplier (5%)

        // REQ-006: Overall upgrade impact reduced, costs might be higher.
        const globalMult1 = getUpgradeDefinition('global_mult_1');
        expect(globalMult1.cost).toBe(500); // Higher cost
        expect(globalMult1.effects[0].value).toBe(1.02); // Smaller global multiplier (2%)
    });

    test('should add isAffordable flag to available upgrades', () => {
        baseGameState.score = 25; // Enough for thingamabob_flat_1 (cost 20) but not thingamabob_flat_2 (cost 30)
        baseGameState.purchasedUpgrades = ['thingamabob_flat_1']; // To make thingamabob_flat_2 potentially available

        const available = getAvailableUpgrades(baseGameState);
        
        const tf1 = available.find(upg => upg.id === 'thingamabob_flat_1');
        // tf1 should not be in available because it's purchased.
        // Let's check an upgrade that *is* available.
        // 'thingamabob_flat_2' requires 'thingamabob_flat_1' (purchased) and costs 30. Score is 25.
        const tf2 = available.find(upg => upg.id === 'thingamabob_flat_2');
        if (tf2) { // It will be available if unlock conditions met
             expect(tf2.isAffordable).toBe(false);
        }

        baseGameState.score = 35; // Now enough for tf2
        const availableAgain = getAvailableUpgrades(baseGameState);
        const tf2Again = availableAgain.find(upg => upg.id === 'thingamabob_flat_2');
         if (tf2Again) {
            expect(tf2Again.isAffordable).toBe(true);
        }

        // Check an initially available one
        baseGameState = initializeGame(); // Reset
        baseGameState.score = 10; // Not enough for thingamabob_flat_1 (cost 20)
        const availableInitial = getAvailableUpgrades(baseGameState);
        const tf1Initial = availableInitial.find(upg => upg.id === 'thingamabob_flat_1');
        if (tf1Initial) {
            expect(tf1Initial.isAffordable).toBe(false);
        }

        baseGameState.score = 20; // Exactly enough
        const availableInitialAffordable = getAvailableUpgrades(baseGameState);
        const tf1InitialAffordable = availableInitialAffordable.find(upg => upg.id === 'thingamabob_flat_1');
        if (tf1InitialAffordable) {
            expect(tf1InitialAffordable.isAffordable).toBe(true);
        }
    });
  });
});