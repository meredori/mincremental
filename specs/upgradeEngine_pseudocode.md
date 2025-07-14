# Pseudocode: `upgradeEngine.js` Modifications

## 1. Overview
This pseudocode outlines changes and considerations for `upgradeEngine.js` (or equivalent module managing upgrade definitions) to support the re-balancing and bug fixes for the linear ticker game, as per `specs/linear_game_fixes_requirements.md`. The primary focus here is on defining upgrade effects to meet REQ-005 and REQ-006.

## 2. Upgrade Definition Structure (Illustrative)

```javascript
// PSEUDO: Illustrative upgrade definition structure
const upgrades = {
    'thingamabob_upgrade_1': {
        id: 'thingamabob_upgrade_1',
        name: 'Slightly Better Thingamabobs',
        description: 'Increases Thingamabob output by a tiny bit.',
        cost: 20, // REQ-004: Must be whole number. REQ-006: Costs may need to increase.
        effects: [
            {
                targetId: 'thingamabob',
                type: 'FLAT_BONUS', // Or could be a very small multiplier initially
                // REQ-005 & REQ-006: Value should be small.
                // e.g., if baseValue is 1, multiple such upgrades needed to make it 2.
                // If 5 such upgrades make it produce +1 total, then value could be 0.2 (which then gets floored in logic)
                // Or, if we want to avoid decimals entirely even in definitions,
                // the logic in applyUpgrade might need to handle "counts" of micro-upgrades.
                // For simplicity here, assume effect values can be decimals that are then processed.
                value: 0.2 // This implies after 5 such upgrades, flatBonus reaches 1.
            }
        ],
        appliesTo: 'thingamabob', // Category or specific target
        purchased: false
    },
    'thingamabob_value_boost_major': {
        id: 'thingamabob_value_boost_major',
        name: 'Significant Thingamabob Enhancement',
        description: 'Thingamabobs now produce +1 base value.',
        cost: 200, // REQ-004, REQ-006
        effects: [
            {
                targetId: 'thingamabob',
                type: 'FLAT_BONUS', // Adds to the existing flat bonus
                value: 1 // REQ-005, REQ-006
            }
        ],
        // ...
    },
    'global_production_boost_1': {
        id: 'global_production_boost_1',
        name: 'Overall Production Boost I',
        description: 'Slightly increases production of all incrementers.',
        cost: 500, // REQ-004, REQ-006
        effects: [
            {
                targetId: 'GLOBAL', // Special target for global effects
                type: 'GLOBAL_MULTIPLIER',
                // REQ-006: Value should be smaller than before, e.g., 1.05 for a 5% boost instead of 1.10
                value: 1.02 // Represents a 2% boost
            }
        ],
        // ...
    }
    // ... other upgrades
};

function getUpgradeDefinition(upgradeId) {
    // PSEUDO: Retrieve a deep copy to prevent mutation of original definitions
    return JSON.parse(JSON.stringify(upgrades[upgradeId]));
}
```

## 3. Key Considerations for Upgrade Definitions

### 3.1. First Incrementer Balancing (REQ-005)
-   **Initial `baseValue`**: The 'thingamabob' incrementer in `linearGameLogic.js` should have `baseValue: 1`.
-   **Upgrade Effects**:
    -   Early upgrades for 'thingamabob' should provide very small `FLAT_BONUS` values (e.g., 0.1, 0.2).
    -   It should take multiple (e.g., 5-10) of these initial, cheaper upgrades for the `Math.floor(baseValue + flatBonus)` to actually increment the effective production from 1 to 2.
    -   **TDD Anchor (in `linearGameLogic.js` `applyUpgrade`):** `// TEST: After N upgrades (e.g., 5), the 'thingamabob' value is still 1.`
    -   **TDD Anchor (in `linearGameLogic.js` `applyUpgrade`):** `// TEST: After M upgrades (e.g., 10), the 'thingamabob' value becomes 2.`

### 3.2. Slower Game Scaling & Less Impactful Upgrades (REQ-006)
-   **Multiplier Values**: For upgrades with `type: 'MULTIPLIER'` or `type: 'GLOBAL_MULTIPLIER'`, the `value` should be reduced.
    -   Example: Instead of `value: 1.2` (20% boost), use `value: 1.05` (5% boost) or `value: 1.1` (10% boost).
-   **Flat Bonus Values**: For `type: 'FLAT_BONUS'`, ensure these are scaled appropriately. For later game incrementers, these might be larger, but early game ones should be small.
-   **Upgrade Costs**: The `cost` of all upgrades should be reviewed and likely increased, or their cost scaling formula (if dynamic) adjusted to be steeper.
    -   **TDD Anchor (in `linearGameLogic.js` `applyUpgrade`):** `// TEST: An upgrade to 'thingamabob' increases its value by a smaller, predefined amount compared to previous scaling.`
    -   **TDD Anchor (in `linearGameLogic.js` `applyUpgrade`):** `// TEST: Global upgrades provide a smaller percentage increase than before.`

### 3.3. Whole Numbers (REQ-004)
-   **Upgrade Costs**: All `cost` fields in upgrade definitions must be whole numbers.
    -   **TDD Anchor (in `linearGameLogic.js` `applyUpgrade`):** `// TEST: Upgrade effects result in whole number changes to incrementer values.` (This is tested by ensuring `calculateIncrementerProduction` always floors values).
-   **Effect Values**: While `effect.value` might be defined with decimals (e.g., `0.2` for a partial bonus, or `1.05` for a multiplier), the `linearGameLogic.js` functions (`calculateIncrementerProduction`, `applyUpgrade`) are responsible for applying these effects and then ensuring all final game state values (production, score) are `Math.floor()`ed.

## 4. Function to Retrieve Upgrades
```javascript
// PSEUDO:
// (Already shown above)
// function getUpgradeDefinition(upgradeId) {
//     return JSON.parse(JSON.stringify(upgrades[upgradeId]));
// }

// It might also be useful to have a function that returns all available upgrades,
// potentially filtered by whether they are affordable or already purchased, for UI display.
function getAllAvailableUpgrades(currentScore, purchasedUpgradeIds) {
    let available = [];
    for (const id in upgrades) {
        if (!purchasedUpgradeIds.includes(id)) { // Or check `upgrades[id].purchased` if state is in definitions
            let def = getUpgradeDefinition(id);
            // Optionally add affordability check here for UI hints
            // def.isAffordable = currentScore >= Math.floor(def.cost); // REQ-004
            available.push(def);
        }
    }
    return available;
}
```

## 5. Notes
-   The actual balancing (specific values for costs and effects) will require iterative tuning and testing. This pseudocode provides the structure for implementing those tuned values.
-   The interaction between `upgradeEngine.js` (definitions) and `linearGameLogic.js` (application of effects) is key. `linearGameLogic.js` handles the state changes and ensures adherence to REQ-004 (whole numbers) after applying effects defined here.