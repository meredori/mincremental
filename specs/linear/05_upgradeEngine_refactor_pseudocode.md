# Pseudocode: Refactor upgradeEngine.js

This document outlines the pseudocode for refactoring `upgradeEngine.js` to:
1.  Work with the new direct upgrade structure defined in `specs/linear/03_direct_upgrade_structure.md`.
2.  Update `effectHandlers` (or replace with a new mechanism) to process the new `effect.type` values.
3.  Modify `applyUpgradeEffect` to use the new effect processing logic.
4.  Adjust `requirementsMet` and `checkAndUnlockUpgrades` to use the new `unlockConditions` structure.
5.  Refactor or remove helper functions like `getRelatedCount`, `checkCondition`, and `getUpgradeMultiplier` as their logic will change or be integrated into the new effect application.
6.  Ensure input sanitization is applied to the new direct effect properties.

## 1. Update Sanitization

The `sanitizeEffectParams` function was generic. We'll need more specific sanitization or ensure it's done where parameters are used. For simplicity, we can adapt `sanitizeEffectParams` or create new ones if needed, but the key is that the *direct* properties of `upgrade.effect` and `upgrade.unlockConditions` are sanitized.

```javascript
// PSEUDOCODE for sanitization in upgradeEngine.js

// Keep or adapt safeNumber
function safeNumber(val, fallback = 0) { /* ... as is ... */ }

// Sanitize specific effect structures as they are processed, or have a general sanitizer
// for common numeric fields within effect objects.
function sanitizeEffectObject(effect = {}) {
  const sanitized = { ...effect };
  if (effect.type === "INCREASE_BASE_PRODUCTION") {
    sanitized.value = safeNumber(sanitized.value, 0);
  } else if (effect.type === "MULTIPLY_OUTPUT") {
    sanitized.multiplier = safeNumber(sanitized.multiplier, 1);
  } else if (effect.type === "SYNERGY_BONUS_PERCENT") {
    sanitized.percentPerUnit = safeNumber(sanitized.percentPerUnit, 0);
    sanitized.perXUnits = safeNumber(sanitized.perXUnits, 1);
    // sourceIncrementerId is a string, no numeric sanitization needed here
  } else if (effect.type === "SELF_SYNERGY_BONUS_PERCENT") {
    sanitized.percentPerOwnUnit = safeNumber(sanitized.percentPerOwnUnit, 0);
    sanitized.perXOwnUnits = safeNumber(sanitized.perXOwnUnits, 1);
  }
  // appliesTo is a string, no numeric sanitization
  return sanitized;
}

function sanitizeUnlockConditions(conditions = {}) {
  const sanitized = { ...conditions };
  if (sanitized.incrementerCount) {
    sanitized.incrementerCount.countRequired = safeNumber(sanitized.incrementerCount.countRequired, 0);
    // incrementerId is a string
  }
  return sanitized;
}

// The old sanitizeEffectParams might be removed or adapted if its general structure is still useful
// for parts of unlockConditions that might resemble old effectParams.
// For now, assume direct sanitization of new structures.
```
// TEST: All relevant numeric fields in `upgrade.effect` and `upgrade.unlockConditions` are sanitized before use.

## 2. Refactor `effectHandlers` and `applyUpgradeEffect`

The `effectHandlers` registry will be keyed by the new `effect.type` values.
The `applyUpgradeEffect` function will now pass the `upgrade.effect` object to the handlers.

```javascript
// PSEUDOCODE for effectHandlers and applyUpgradeEffect in upgradeEngine.js

const effectApplicators = {
  // Note: Production calculation will be multi-stage.
  // Stage 1: Modify base rate
  // Stage 2: Apply multipliers
  // Stage 3: Apply additive percentage bonuses

  INCREASE_BASE_PRODUCTION: (effect, incrementer, state, currentRates) => {
    // This effect modifies the base rate of an incrementer *before* count is applied.
    // It's unusual for typical idle games but kept if it's a direct translation of an old effect.
    // More commonly, one might modify the baseProduction *per unit*.
    // Assuming currentRates is an object like { baseRate: X, finalMultiplier: Y, additiveBonusPercent: Z }
    const sanitizedEffect = sanitizeEffectObject(effect);
    currentRates.baseRate = safeNumber(currentRates.baseRate, 0) + sanitizedEffect.value;
    // TEST: INCREASE_BASE_PRODUCTION correctly adds to incrementer's base rate.
    return currentRates;
  },

  MULTIPLY_OUTPUT: (effect, incrementer, state, currentRates) => {
    // This applies a multiplier to the production *after* base rate and count.
    const sanitizedEffect = sanitizeEffectObject(effect);
    currentRates.finalMultiplier = safeNumber(currentRates.finalMultiplier, 1) * sanitizedEffect.multiplier;
    // TEST: MULTIPLY_OUTPUT correctly multiplies the final output.
    return currentRates;
  },

  SYNERGY_BONUS_PERCENT: (effect, incrementer, state, currentRates) => {
    const sanitizedEffect = sanitizeEffectObject(effect);
    const sourceInc = state.incrementers.find(inc => inc.id === sanitizedEffect.sourceIncrementerId);
    if (sourceInc) {
      const sourceCount = safeNumber(sourceInc.count, 0);
      const applications = Math.floor(sourceCount / sanitizedEffect.perXUnits);
      currentRates.additiveBonusPercent = safeNumber(currentRates.additiveBonusPercent, 0) + (applications * sanitizedEffect.percentPerUnit);
    }
    // TEST: SYNERGY_BONUS_PERCENT correctly adds percentage based on source incrementer count.
    return currentRates;
  },

  SELF_SYNERGY_BONUS_PERCENT: (effect, incrementer, state, currentRates) => {
    const sanitizedEffect = sanitizeEffectObject(effect);
    const ownCount = safeNumber(incrementer.count, 0);
    const applications = Math.floor(ownCount / sanitizedEffect.perXOwnUnits);
    currentRates.additiveBonusPercent = safeNumber(currentRates.additiveBonusPercent, 0) + (applications * sanitizedEffect.percentPerOwnUnit);
    // TEST: SELF_SYNERGY_BONUS_PERCENT correctly adds percentage based on own count.
    return currentRates;
  }
  // Add more effect applicators as per the new direct structure
};

// applyUpgradeEffect is no longer suitable as effects are applied in stages.
// Instead, calculateProduction will iterate through upgrades and apply them stage by stage.
```

## 3. Refactor `calculateProduction`

This function will now iterate through an incrementer's purchased and unlocked upgrades, applying their effects in defined stages.

```javascript
// PSEUDOCODE for calculateProduction in upgradeEngine.js

export function calculateProduction(incrementer, state) {
  const baseProductionPerUnit = safeNumber(incrementer.baseProduction, 0); // This is the 'rate' from the old structure
  const count = safeNumber(incrementer.count, 0);

  // Initialize production modifiers
  let effectiveBaseRate = baseProductionPerUnit;
  let finalMultiplier = 1;
  let additiveBonusPercent = 0;

  if (!Array.isArray(incrementer.upgrades)) {
    return baseProductionPerUnit * count;
  }

  const purchasedAndUnlockedUpgrades = incrementer.upgrades.filter(u => u && u.purchased && u.unlocked);

  // Stage 1: Apply effects that modify the base rate directly (e.g., INCREASE_BASE_PRODUCTION)
  // (This stage is less common; usually, base rate is fixed and multipliers apply later)
  for (const upgrade of purchasedAndUnlockedUpgrades) {
    if (upgrade.effect && upgrade.effect.appliesTo === "BASE_RATE") {
      const applicator = effectApplicators[upgrade.effect.type];
      if (applicator) {
        // This is tricky. If multiple upgrades modify baseRate, how do they stack?
        // For now, assume applicator modifies effectiveBaseRate directly.
        // This part of the design might need refinement based on desired stacking behavior.
        // Let's assume for now INCREASE_BASE_PRODUCTION is the only one.
        if (upgrade.effect.type === "INCREASE_BASE_PRODUCTION") {
            const sanitizedEffect = sanitizeEffectObject(upgrade.effect);
            effectiveBaseRate += sanitizedEffect.value;
        }
      }
    }
  }
  // TEST: calculateProduction correctly applies BASE_RATE modifications.

  // Initial production after base rate modifications and count
  let currentProduction = effectiveBaseRate * count;

  // Stage 2: Apply direct multipliers (e.g., MULTIPLY_OUTPUT)
  for (const upgrade of purchasedAndUnlockedUpgrades) {
    if (upgrade.effect && upgrade.effect.appliesTo === "FINAL_OUTPUT") {
      const applicator = effectApplicators[upgrade.effect.type];
      if (applicator && upgrade.effect.type === "MULTIPLY_OUTPUT") { // Be specific for this stage
        const sanitizedEffect = sanitizeEffectObject(upgrade.effect);
        finalMultiplier *= sanitizedEffect.multiplier;
      }
    }
  }
  currentProduction *= finalMultiplier;
  // TEST: calculateProduction correctly applies FINAL_OUTPUT multipliers.

  // Stage 3: Apply additive percentage bonuses (e.g., SYNERGY_BONUS_PERCENT, SELF_SYNERGY_BONUS_PERCENT)
  for (const upgrade of purchasedAndUnlockedUpgrades) {
    if (upgrade.effect && upgrade.effect.appliesTo === "FINAL_OUTPUT_ADDITIVE_PERCENT") {
      const applicator = effectApplicators[upgrade.effect.type];
      if (applicator) {
         // Applicator will add to a temporary sum of percentages for this stage
         // This requires effectApplicators to return the bonus amount, not modify currentProduction directly.
         // Let's refine the applicator signature or how additiveBonusPercent is managed.
         // For now, assume applicator directly contributes to additiveBonusPercent sum.
         const sanitizedEffect = sanitizeEffectObject(upgrade.effect);
         if (upgrade.effect.type === "SYNERGY_BONUS_PERCENT") {
            const sourceInc = state.incrementers.find(inc => inc.id === sanitizedEffect.sourceIncrementerId);
            if (sourceInc) {
                const sourceCount = safeNumber(sourceInc.count, 0);
                const applications = Math.floor(sourceCount / sanitizedEffect.perXUnits);
                additiveBonusPercent += (applications * sanitizedEffect.percentPerUnit);
            }
         } else if (upgrade.effect.type === "SELF_SYNERGY_BONUS_PERCENT") {
            const ownCount = safeNumber(incrementer.count, 0);
            const applications = Math.floor(ownCount / sanitizedEffect.perXOwnUnits);
            additiveBonusPercent += (applications * sanitizedEffect.percentPerOwnUnit);
         }
      }
    }
  }
  currentProduction *= (1 + additiveBonusPercent);
  // TEST: calculateProduction correctly applies FINAL_OUTPUT_ADDITIVE_PERCENT bonuses.

  return safeNumber(currentProduction, 0);
  // TEST: calculateProduction returns a valid, non-negative number.
}
```

## 4. Refactor `requirementsMet` and `checkAndUnlockUpgrades`

These will now use the `upgrade.unlockConditions` object.

```javascript
// PSEUDOCODE for requirementsMet and checkAndUnlockUpgrades in upgradeEngine.js

export function requirementsMet(upgrade, state) {
  if (!upgrade.unlockConditions) {
    return true; // No specific conditions, always met (or handle as error/default false)
                 // For safety, let's assume true if not defined, meaning manually unlocked.
                 // Or, more robustly, upgrades without conditions are unlocked by default or via other game events.
                 // Let's assume for now: if no unlockConditions, it's not unlockable via this mechanism.
                 // This needs clarification based on game design. For now, let's say:
    // return false; // If no conditions, it can't be auto-unlocked by this function.
    // A common pattern is for some upgrades to be unlocked by default (e.g. in getInitialState)
    // and others by meeting conditions. If `unlocked` is already true, this function isn't called.
    // So, if `unlockConditions` is missing, it means it's not unlockable by *these* dynamic checks.
    // Let's assume if `unlockConditions` is empty or null, it means it's not met by this check.
    return false;
  }

  const conditions = sanitizeUnlockConditions(upgrade.unlockConditions);

  if (conditions.incrementerCount) {
    const targetIncrementerId = conditions.incrementerCount.incrementerId || upgrade.affects;
    const inc = Array.isArray(state.incrementers)
      ? state.incrementers.find(i => i.id === targetIncrementerId)
      : null;
    if (!inc || safeNumber(inc.count, 0) < conditions.incrementerCount.countRequired) {
      return false; // This condition not met
    }
    // TEST: requirementsMet correctly checks incrementerCount condition.
  }

  // Add checks for other types of unlock conditions from `specs/linear/03_direct_upgrade_structure.md`
  // e.g., scoreRequired, specificUpgradePurchased, etc.

  return true; // All defined conditions were met
}

// checkAndUnlockUpgrades can remain largely the same structurally,
// as it iterates upgrades and calls requirementsMet.
export function checkAndUnlockUpgrades(state) {
  if (!Array.isArray(state.upgrades)) return;
  for (const upgrade of state.upgrades) {
    // Ensure upgrade object and its nested properties are valid before accessing
    if (upgrade && !upgrade.purchased && !upgrade.unlocked && upgrade.unlockConditions) { // only try to unlock if conditions exist
      if (requirementsMet(upgrade, state)) {
        upgrade.unlocked = true;
        // TEST: checkAndUnlockUpgrades correctly sets upgrade.unlocked to true when requirementsMet.
      }
    }
  }
}
```

## 5. Review Helper Functions

-   **`getRelatedCount`**: This logic is now integrated into `SYNERGY_BONUS_PERCENT` applicator or `calculateProduction`. Can be **removed**.
    // TEST: getRelatedCount is removed and its logic correctly handled by new effect applicators.
-   **`checkCondition`**: This was for `MULTIPLY_ON_CONDITION`. If this effect type is re-introduced in the new structure, its logic would be part of its applicator. For now, assuming it's not in the initial direct structure, it can be **removed**.
    // TEST: checkCondition is removed or adapted if conditional effects are re-added.
-   **`getUpgradeMultiplier` (from `upgradeEngine.js`)**: This function ([`upgradeEngine.js:199`](src/components/linear/upgradeEngine.js:199)) attempted to calculate a total multiplier. This is now superseded by the more granular `calculateProduction` which applies different types of effects correctly. This function should be **removed**.
    // TEST: getUpgradeMultiplier is removed from upgradeEngine.js.
-   **`applyUpgrade`**: This function ([`upgradeEngine.js:169`](src/components/linear/upgradeEngine.js:169)) is for purchasing. It's similar to `handleUpgrade` in `linearGameLogic.js`. It seems redundant if `linearGameLogic.js` handles the purchase action. **Review for removal/consolidation**. For now, assume `linearGameLogic.js.handleUpgrade` is the primary.
    // TEST: applyUpgrade is reviewed and potentially removed if redundant with linearGameLogic.handleUpgrade.
-   **`canUnlockUpgrade`**: This function ([`upgradeEngine.js:237`](src/components/linear/upgradeEngine.js:237)) uses `requirementsMet`. It can be kept if UI needs to check this without actually modifying state.
    // TEST: canUnlockUpgrade correctly uses the refactored requirementsMet.

## Summary of Changes in `upgradeEngine.js`:
- Update or replace `sanitizeEffectParams` with sanitization for new direct `effect` and `unlockConditions` properties.
- Rework `effectHandlers` into `effectApplicators` based on new `effect.type` values and multi-stage application within `calculateProduction`.
- `applyUpgradeEffect` is effectively replaced by the logic within `calculateProduction`.
- `calculateProduction` is significantly refactored to apply upgrades in stages (base rate mods, multipliers, additive percentages).
- `requirementsMet` is updated to read from `upgrade.unlockConditions`.
- `checkAndUnlockUpgrades` remains structurally similar but uses the new `requirementsMet`.
- Remove `getRelatedCount`, `checkCondition`, and `getUpgradeMultiplier`.
- Review `applyUpgrade` for redundancy with `linearGameLogic.js.handleUpgrade`.
- `canUnlockUpgrade` is updated if kept.