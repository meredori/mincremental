# Specification: Direct Upgrade Structure

This document outlines the new structure for upgrade objects, removing the need for the `normalizeUpgrade.js` step. Upgrades will directly define their effects.

## Core Upgrade Properties

All upgrades will have the following base properties:

-   `id`: (String) Unique identifier for the upgrade (e.g., "tier1_direct_production_1").
-   `name`: (String) Display name of the upgrade (e.g., "Thingamabob Production Boost I").
-   `desc`: (String) Descriptive text for the upgrade.
-   `cost`: (Number) Cost to purchase the upgrade.
-   `unlocked`: (Boolean) Whether the upgrade is available for purchase.
-   `purchased`: (Boolean) Whether the upgrade has been bought.
-   `tier`: (Number) The tier number of the incrementer this upgrade is primarily associated with (used for grouping/unlock conditions).
-   `affects`: (String) The `id` of the incrementer this upgrade directly modifies (e.g., "tier1").
-   `effect`: (Object) An object detailing the direct effect of the upgrade. See "Effect Structures" below.

## Effect Structures

The `effect` object will have a `type` property and other properties specific to that type.

### 1. `INCREASE_BASE_PRODUCTION`
   Increases the base production rate of the target incrementer by a flat amount.
   - `type`: "INCREASE_BASE_PRODUCTION"
   - `value`: (Number) The amount to add to the target incrementer's base production rate.
   - `appliesTo`: "BASE_RATE" (Indicates this modifies the fundamental rate)

   *Example TDD Anchor for Engine:* `// TEST: engine applies INCREASE_BASE_PRODUCTION correctly to incrementer.rate`

### 2. `MULTIPLY_OUTPUT`
   Multiplies the final calculated output of the target incrementer.
   - `type`: "MULTIPLY_OUTPUT"
   - `multiplier`: (Number) The factor by which to multiply the output (e.g., 1.5 for +50%).
   - `appliesTo`: "FINAL_OUTPUT"

   *Example TDD Anchor for Engine:* `// TEST: engine applies MULTIPLY_OUTPUT correctly to final production`

### 3. `SYNERGY_BONUS_PERCENT`
   Adds a percentage bonus to the target incrementer's output based on the count of another (source) incrementer.
   - `type`: "SYNERGY_BONUS_PERCENT"
   - `sourceIncrementerId`: (String) The `id` of the incrementer whose count provides the bonus.
   - `percentPerUnit`: (Number) The percentage bonus per unit of the source incrementer (e.g., 0.01 for 1%).
   - `perXUnits`: (Number, optional, default: 1) The number of source units required for one application of `percentPerUnit` (e.g., 10 for "per 10 owned").
   - `appliesTo`: "FINAL_OUTPUT_ADDITIVE_PERCENT" (Indicates it's an additive percentage bonus to the final output calculation stage)

   *Example TDD Anchor for Engine:* `// TEST: engine applies SYNERGY_BONUS_PERCENT based on sourceIncrementer count`

### 4. `SELF_SYNERGY_BONUS_PERCENT`
   Adds a percentage bonus to the target incrementer's output based on its own count.
   - `type`: "SELF_SYNERGY_BONUS_PERCENT"
   - `percentPerOwnUnit`: (Number) The percentage bonus per unit of the target incrementer itself.
   - `perXOwnUnits`: (Number, optional, default: 1) The number of own units required for one application of `percentPerOwnUnit`.
   - `appliesTo`: "FINAL_OUTPUT_ADDITIVE_PERCENT"

   *Example TDD Anchor for Engine:* `// TEST: engine applies SELF_SYNERGY_BONUS_PERCENT based on target's own count`

## Unlock Conditions

Unlock conditions will be managed by `effectParams` on the upgrade object, similar to the current system, but will be read directly by the `upgradeEngine`.
Example:
- `unlockConditions`: (Object, optional)
    - `incrementerCount`: (Object, optional)
        - `incrementerId`: (String) The ID of the incrementer to check. If not specified, defaults to the upgrade's `affects` incrementer.
        - `countRequired`: (Number) The number of owned units required.

   *Example TDD Anchor for Engine:* `// TEST: engine unlocks upgrade based on incrementerCount condition`

## Example Upgrade Object

```javascript
{
  id: "tier1_direct_production_1",
  name: "Thingamabob Production Boost I",
  desc: "Directly boosts Thingamabob output.",
  cost: 100,
  unlocked: false,
  purchased: false,
  tier: 1,
  affects: "tier1",
  effect: {
    type: "MULTIPLY_OUTPUT",
    multiplier: 1.5, // +50%
    appliesTo: "FINAL_OUTPUT"
  },
  unlockConditions: {
    incrementerCount: {
      incrementerId: "tier1", // or defaults to 'affects'
      countRequired: 10
    }
  }
}
```

## Transition Notes:

- The `upgradeEngine.js` will need to be refactored to understand these `effect.type` values and their corresponding properties.
- The `linearGameLogic.js` `getUpgradesForTier` function will be updated to generate upgrades in this new format.
- UI components (`UpgradeButton.jsx`, `LinearGame.jsx`) will be updated to calculate and display benefits based on this direct structure.