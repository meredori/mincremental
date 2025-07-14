# Pseudocode: Refactor linearGameLogic.js

This document outlines the pseudocode for refactoring `linearGameLogic.js` to:
1.  Remove the import and usage of `normalizeUpgrade.js`.
2.  Modify `getUpgradesForTier` to generate upgrade objects according to the new direct structure defined in `specs/linear/03_direct_upgrade_structure.md`.
3.  Ensure other functions like `getMultiplier`, `getSynergyBonus`, and `handleTick` are adapted or reviewed for compatibility if they were relying on normalized fields that no longer exist or have changed meaning. (Note: `upgradeEngine.js` will handle the core logic changes for effect application).

## 1. Remove Normalization

```diff
// linearGameLogic.js

- import normalizeUpgrade from "./normalizeUpgrade"; // REMOVE

// ... rest of the file
```

## 2. Refactor `getUpgradesForTier`

This function will now directly create upgrade objects with the new `effect` structure.

```javascript
// PSEUDOCODE for getUpgradesForTier in linearGameLogic.js

function getUpgradesForTier(tierId, tierName, baseCost, allTiers = []) {
  // Synergy upgrades
  const synergyUpgrades = [];
  if (allTiers && allTiers.length > 1) {
    allTiers.forEach(otherTier => {
      if (otherTier.id !== tierId) {
        synergyUpgrades.push({
          id: `${tierId}_synergy_${otherTier.id}_1`,
          name: `${tierName} Synergy with ${otherTier.name} I`,
          desc: `+1% output per 10 ${otherTier.name}s owned.`,
          cost: safeNumber(baseCost * 12, 1),
          unlocked: true, // Or based on game progression rules
          purchased: false,
          tier: safeNumber(parseInt(tierId.replace("tier", "")), 1),
          affects: tierId,
          effect: {
            type: "SYNERGY_BONUS_PERCENT",
            sourceIncrementerId: otherTier.id,
            percentPerUnit: 0.01, // 1%
            perXUnits: 10,
            appliesTo: "FINAL_OUTPUT_ADDITIVE_PERCENT"
          },
          // TEST: Ensure synergy upgrade has correct effect structure
          unlockConditions: { /* ... if any ... */ }
        });
      }
    });
  }

  const upgrades = [
    // Example: Production Multiplier Upgrade
    {
      id: `${tierId}_production_boost_1`, // New ID reflecting direct effect
      name: `Speedy ${tierName} I`, // Name can remain similar
      desc: `Your ${tierName}s work 50% faster!`, // Description can remain similar
      cost: safeNumber(baseCost * 10, 1),
      unlocked: false,
      purchased: false,
      tier: safeNumber(parseInt(tierId.replace("tier", "")), 1),
      affects: tierId,
      effect: {
        type: "MULTIPLY_OUTPUT",
        multiplier: 1.5, // Represents a +50% boost
        appliesTo: "FINAL_OUTPUT"
      },
      // TEST: Ensure production boost upgrade has correct effect structure
      unlockConditions: {
        incrementerCount: {
          // incrementerId: tierId, // Defaults to 'affects' if not specified
          countRequired: 1 // Example: unlock at 1 owned
        }
      }
    },
    // Example: Self-Synergy Upgrade
    {
      id: `${tierId}_self_synergy_1`, // New ID
      name: `${tierName} Self-Synergy`,
      desc: `Each ${tierName} owned increases its own output by 2%.`,
      cost: safeNumber(baseCost * 8, 1),
      unlocked: false,
      purchased: false,
      tier: safeNumber(parseInt(tierId.replace("tier", "")), 1),
      affects: tierId,
      effect: {
        type: "SELF_SYNERGY_BONUS_PERCENT",
        percentPerOwnUnit: 0.02, // 2%
        perXOwnUnits: 1,
        appliesTo: "FINAL_OUTPUT_ADDITIVE_PERCENT"
      },
      // TEST: Ensure self-synergy upgrade has correct effect structure
      unlockConditions: {
        incrementerCount: {
          countRequired: 5 // Example: unlock at 5 owned
        }
      }
    },
    ...synergyUpgrades
  ];
  return upgrades;
  // TEST: getUpgradesForTier returns upgrades matching the new direct structure
}
```

## 3. Review and Adapt Other Functions

### `getMultiplier` and `getSynergyBonus`
These functions (`getMultiplier` at [`linearGameLogic.js:141`](src/components/linear/linearGameLogic.js:141) and `getSynergyBonus` at [`linearGameLogic.js:154`](src/components/linear/linearGameLogic.js:154)) were previously used by UI components to understand upgrade effects.
With the `upgradeEngine.js` taking over the core calculation of production based on the new direct effect structures, these functions in `linearGameLogic.js` might become redundant or need significant simplification.

**Decision:** These functions will likely be **removed** or heavily refactored. The `upgradeEngine.js` will provide the source of truth for production calculations. UI components will query the `upgradeEngine` or use its outputs.

*Pseudocode for removal/deprecation:*
```javascript
// linearGameLogic.js

// DEPRECATE or REMOVE getMultiplier
// export function getMultiplier(state, tierId, type = "production") { ... }
// TEST: Ensure getMultiplier is no longer called or its calls are replaced

// DEPRECATE or REMOVE getSynergyBonus
// export function getSynergyBonus(state, tierId) { ... }
// TEST: Ensure getSynergyBonus is no longer called or its calls are replaced
```

### `handleTick`
The `handleTick` function ([`linearGameLogic.js:318`](src/components/linear/linearGameLogic.js:318)) already calls `calculateProduction` and `checkAndUnlockUpgrades` from `upgradeEngine.js`.
The main change here is to ensure the `incrementer` object passed to `calculateProduction` and the `state` passed to `checkAndUnlockUpgrades` are compatible with the refactored `upgradeEngine.js`.

The `incrementer` object passed to `calculateProduction` currently includes:
```javascript
    // const incrementer = {
    //   ...inc,
    //   count: safeNumber(inc.owned, 0),
    //   baseProduction: safeNumber(inc.rate, 0),
    //   upgrades: (state.upgrades || []).filter(u => u.affects === inc.id) // This remains valid
    // };
```
This structure should still be largely compatible, as `upgradeEngine.js` will now interpret the `effect` field within each upgrade object.

The `state` object passed to `checkAndUnlockUpgrades` also seems compatible. The `upgradeEngine`'s `requirementsMet` function will be updated to read `unlockConditions` directly from the upgrade objects.

No significant structural changes are anticipated for `handleTick` itself, but its reliance on the refactored `upgradeEngine.js` is key.
// TEST: handleTick correctly utilizes the refactored upgradeEngine for production and unlock checks

### `handleUpgrade`
The `handleUpgrade` function ([`linearGameLogic.js:199`](src/components/linear/linearGameLogic.js:199)) primarily deals with deducting cost and marking upgrades as purchased. This logic is independent of the upgrade's effect structure and should not require changes.
// TEST: handleUpgrade functions correctly with new upgrade structure (cost, purchased flags)

## 4. Sanitization
The `sanitizeEffectParams` function ([`linearGameLogic.js:16`](src/components/linear/linearGameLogic.js:16)) was used by `normalizeUpgrade`. Since `normalizeUpgrade` is being removed, and effect parameters are now part of the direct structure, this specific sanitization function might become obsolete in `linearGameLogic.js`. The `upgradeEngine.js` will be responsible for sanitizing the parameters it directly consumes from the `effect` and `unlockConditions` objects.

**Decision:** Remove `sanitizeEffectParams` from `linearGameLogic.js`.
```diff
// linearGameLogic.js

- function sanitizeEffectParams(params = {}) { ... } // REMOVE
// TEST: Ensure sanitizeEffectParams is no longer present or called within linearGameLogic.js
```

## Summary of Changes in `linearGameLogic.js`:
- Remove `normalizeUpgrade.js` import.
- Remove `sanitizeEffectParams` function.
- Refactor `getUpgradesForTier` to create upgrades with the new direct `effect` structure and `unlockConditions`.
- Deprecate/remove `getMultiplier` and `getSynergyBonus` as their roles will be superseded by the refactored `upgradeEngine.js` and direct state access for UI.
- Confirm `handleTick` and `handleUpgrade` remain compatible, relying on `upgradeEngine.js` for new effect logic.