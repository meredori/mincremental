# Pseudocode: `linearGameLogic.js` Modifications

## 1. Overview
This pseudocode outlines changes to `linearGameLogic.js` to address bug fixes, display issues, and re-balancing for the linear ticker game, based on `specs/linear_game_fixes_requirements.md`.

## 2. Data Structures (Illustrative)

```javascript
// PSEUDO: Illustrative state structure
let gameState = {
    score: 0, // REQ-004: Must be whole number
    totalPerSecond: 0, // REQ-004: Must be whole number
    incrementers: [
        {
            id: 'thingamabob',
            name: 'Thingamabob',
            count: 0,
            baseCost: 10, // REQ-004
            costMultiplier: 1.15, // REQ-006: May need adjustment for slower scaling
            currentCost: 10, // REQ-004
            baseValue: 1, // REQ-005: Base production of one unit, before non-percentage upgrades
            upgrades: { // Modifiers from upgrades
                multiplier: 1, // e.g., from percentage upgrades
                flatBonus: 0   // e.g., from flat additive upgrades
            },
            // Calculated properties:
            // individualProductionValue: REQ-002, REQ-004. The value one unit produces.
            // totalProductionFromType: REQ-001, REQ-004. Total from all units of this type.
        },
        // ... other incrementers
    ],
    upgrades: {
        // ... upgrade states
    },
    settings: {
        showPurchased: false // REQ-003: Default to false
    }
};
```

## 3. Core Functions Modifications

### 3.1. `initializeGame()` or equivalent
```javascript
// PSEUDO:
function initializeGame() {
    // ... other initializations
    gameState.settings.showPurchased = false; // REQ-003
    // TEST: On game load, the 'showPurchased' state defaults to false. (REQ-003)

    gameState.incrementers.forEach(inc => {
        inc.baseValue = (inc.id === 'thingamabob') ? 1 : inc.baseValue; // REQ-005
        // TEST: The first incrementer ('thingamabob') base value is 1 (or adjusted by initial upgrades to 1). (REQ-005)
        calculateIncrementerCost(inc);
        calculateIncrementerProduction(inc); // To set initial individual and total production
    });
    calculateTotalPerSecond();
    // ...
}
```

### 3.2. `calculateIncrementerProduction(incrementer)`
```javascript
// PSEUDO:
function calculateIncrementerProduction(incrementer) {
    // Calculate the value of a single unit of this incrementer
    let singleUnitValue = incrementer.baseValue;
    // Apply multiplicative upgrades
    singleUnitValue *= incrementer.upgrades.multiplier;
    // Apply flat bonus upgrades
    singleUnitValue += incrementer.upgrades.flatBonus;

    incrementer.individualProductionValue = Math.floor(singleUnitValue); // REQ-004, REQ-002
    // TEST: Incrementer card for 'thingamabob' displays its individual production value correctly. (REQ-002)
    // TEST: All incrementer production values are whole numbers. (REQ-004)

    // Calculate total production from all units of this type
    // This directly uses the count and the calculated individualProductionValue
    incrementer.totalProductionFromType = Math.floor(incrementer.count * incrementer.individualProductionValue); // REQ-001, REQ-004
    // TEST: Purchasing a second 'thingamabob' correctly adds its base value to the 'thingamabob' type's total production, not multiplies. (REQ-001)
    // TEST: The 'per-1' display for 'thingamabob' shows the value of a single 'thingamabob'. (REQ-001 related, via individualProductionValue)
}
```

### 3.3. `purchaseIncrementer(incrementerId)`
```javascript
// PSEUDO:
function purchaseIncrementer(incrementerId) {
    let inc = gameState.incrementers.find(i => i.id === incrementerId);
    if (gameState.score >= inc.currentCost) {
        gameState.score = Math.floor(gameState.score - inc.currentCost); // REQ-004
        inc.count++;

        calculateIncrementerCost(inc); // Update cost for the next one
        calculateIncrementerProduction(inc); // Recalculate its production contribution
        // TEST: (Covered by calculateIncrementerProduction tests for REQ-001)

        calculateTotalPerSecond();
    }
}
```

### 3.4. `calculateIncrementerCost(incrementer)`
```javascript
// PSEUDO:
function calculateIncrementerCost(incrementer) {
    // Example cost formula, REQ-006 might require adjusting costMultiplier or baseCost
    let cost = incrementer.baseCost * Math.pow(incrementer.costMultiplier, incrementer.count);
    incrementer.currentCost = Math.floor(cost); // REQ-004
    // TEST: All incrementer costs are whole numbers. (REQ-004)
    // TEST: The cost of the 10th 'thingamabob' is higher relative to its production compared to previous scaling. (REQ-006)
}
```

### 3.5. `applyUpgrade(upgradeId)`
```javascript
// PSEUDO:
function applyUpgrade(upgradeId) {
    let upgrade = getUpgradeDefinition(upgradeId); // From upgradeEngine.js or similar
    if (gameState.score >= Math.floor(upgrade.cost)) { // REQ-004 for upgrade cost
        gameState.score = Math.floor(gameState.score - Math.floor(upgrade.cost)); // REQ-004

        // Apply effect
        upgrade.effects.forEach(effect => {
            let targetIncrementer = gameState.incrementers.find(inc => inc.id === effect.targetId);
            if (targetIncrementer) {
                if (effect.type === 'MULTIPLIER') {
                    // REQ-006: The actual value of effect.value comes from upgradeEngine and should be smaller
                    targetIncrementer.upgrades.multiplier = parseFloat((targetIncrementer.upgrades.multiplier * effect.value).toFixed(4)); // Keep some precision internally before flooring final production
                } else if (effect.type === 'FLAT_BONUS') {
                    // REQ-006: The actual value of effect.value comes from upgradeEngine and should be smaller
                    targetIncrementer.upgrades.flatBonus += effect.value;
                } else if (effect.type === 'SET_BASE_VALUE') { // For specific upgrades that directly set baseValue
                    targetIncrementer.baseValue = effect.value;
                }
                // REQ-005: Logic for first incrementer's upgrades to have small impact is primarily in upgrade definitions (upgradeEngine.js)
                // but the application here ensures it feeds into calculateIncrementerProduction.
                calculateIncrementerProduction(targetIncrementer);
                // TEST: An upgrade to 'thingamabob' increases its value by a smaller, predefined amount compared to previous scaling. (REQ-006)
                // TEST: After N upgrades (e.g., 5), the 'thingamabob' value is still 1. (REQ-005)
                // TEST: After M upgrades (e.g., 10), the 'thingamabob' value becomes 2. (REQ-005)
            } else if (effect.targetId === 'GLOBAL') {
                // Apply global effects, e.g., to all incrementer multipliers
                gameState.incrementers.forEach(inc => {
                    if (effect.type === 'GLOBAL_MULTIPLIER') {
                         inc.upgrades.multiplier = parseFloat((inc.upgrades.multiplier * effect.value).toFixed(4));
                         calculateIncrementerProduction(inc);
                    }
                });
                // TEST: Global upgrades provide a smaller percentage increase than before. (REQ-006)
            }
        });
        markUpgradeAsPurchased(upgradeId);
        calculateTotalPerSecond();
        // TEST: Upgrade effects result in whole number changes to incrementer values (via calculateIncrementerProduction). (REQ-004)
    }
}
```

### 3.6. `updateGameTick()` (or main game loop update)
```javascript
// PSEUDO:
function updateGameTick() {
    let scoreThisTick = gameState.totalPerSecond; // totalPerSecond is already floored
    gameState.score = Math.floor(gameState.score + scoreThisTick); // REQ-004
    // TEST: Total score and perSecond rate are displayed as whole numbers. (REQ-004) (Display part is in UI)
    // TEST: Main scoreboard 'total score' is distinct from any individual incrementer's production display. (REQ-002) (Data provided here)
}
```

### 3.7. `calculateTotalPerSecond()`
```javascript
// PSEUDO:
function calculateTotalPerSecond() {
    let total = 0;
    gameState.incrementers.forEach(inc => {
        total += inc.totalProductionFromType; // This is already floored
    });
    gameState.totalPerSecond = Math.floor(total); // REQ-004
}

```

## 4. Notes
-   `getUpgradeDefinition(upgradeId)` is assumed to fetch upgrade details (cost, effects) which are defined in `upgradeEngine.js` or a similar module.
-   The `toFixed(4)` for multipliers is a suggestion to manage floating point precision internally before the final `Math.floor()` on production values. The exact strategy might vary.
-   Cost scaling (`costMultiplier`, `baseCost`) and upgrade effects in `upgradeEngine.js` are critical for REQ-006.
-   REQ-005 (first incrementer balancing) heavily relies on the `baseValue` and the specific upgrade definitions in `upgradeEngine.js`.