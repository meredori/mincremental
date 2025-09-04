# Phase 1: Linear Incrementer Upgrades – Pseudocode

## Module: Upgrade Logic

```pseudocode
function purchaseUpgrade(upgradeId, playerState):
    upgrade = findUpgradeById(upgradeId)
    incrementer = findIncrementerById(upgrade.incrementerId)
    if not incrementer.unlocked:
        return error("Incrementer locked") // TEST: Locked incrementer fails gracefully
    if playerState.resources < upgrade.cost:
        return error("Insufficient resources") // TEST: Purchase fails gracefully
    if upgrade.purchased:
        return error("Upgrade already purchased")
    if upgrade.effectType == "synergy":
        if not isValidSynergy(upgrade, incrementer):
            return error("Invalid synergy upgrade")
    deductResources(playerState, upgrade.cost)
    upgrade.purchased = true
    applyUpgradeEffect(incrementer, upgrade, playerState)
    updateUI(incrementer, upgrade, playerState) // TEST: Tooltip and display update immediately
    recalculateCostsAndUnlocks(incrementer, playerState) // TEST: Cost/tier unlocks update
    return success
```

## Module: Synergy Calculation

```pseudocode
function calculateSynergyBonus(upgrade, playerState):
    sourceTierCount = getTierCount(playerState, upgrade.synergySourceTier)
    if sourceTierCount < upgrade.bonusPer:
        return 0 // TEST: No bonus if referenced tier count is zero or < bonusPer
    bonus = floor(sourceTierCount / upgrade.bonusPer) * upgrade.bonusPercent
    return bonus // TEST: Correct bonus per 10 of another tier owned
```

## Module: UI Update Flow

```pseudocode
function updateUI(incrementer, upgrade, playerState):
    updateIncrementerTooltip(incrementer, playerState)
    updateUpgradeTooltip(upgrade, playerState)
    refreshDisplay(incrementer, playerState)
    // TEST: UI/tooltips update instantly after purchase or tier change
```

## Module: Validation

```pseudocode
function isValidSynergy(upgrade, incrementer):
    return upgrade.synergySourceTier != incrementer.tier
    // TEST: Prevent stacking synergy upgrades on same incrementer/tier pair
```

## Module: State Reactivity

```pseudocode
onTierCountChange(tier, playerState):
    for each incrementer in playerState.incrementers:
        for each upgrade in incrementer.upgrades:
            if upgrade.effectType == "synergy" and upgrade.purchased:
                recalculateSynergyBonus(upgrade, playerState)
                updateUI(incrementer, upgrade, playerState)
    // TEST: Synergy bonus and UI update in real time as tier counts change
```

## Error Handling

- All user actions validated before processing.
- Errors return clear feedback to UI.
- No hard-coded upgrade values; all scaling is data-driven.
- Performance: All updates are atomic and efficient.

## TDD Anchors

// TEST: See requirements doc for full anchor list; each function above includes inline anchors.