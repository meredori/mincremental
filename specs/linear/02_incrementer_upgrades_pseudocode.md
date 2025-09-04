# Linear Incrementer Upgrades – Pseudocode & TDD Anchors

## 1. Data Structures

```pseudo
// Upgrade definition
Upgrade:
  id: string
  name: string
  tier: int
  effectType: enum // e.g., MULTIPLY_AT_COUNT, ADD_PER_OTHER, MULTIPLY_ON_CONDITION, ETC
  effectParams: object // parameters for effect calculation
  unlocked: bool
  purchased: bool

// Incrementer definition
Incrementer:
  tier: int
  count: int
  baseProduction: float
  upgrades: list[Upgrade]

// Game state
GameState:
  incrementers: list[Incrementer]
  upgrades: list[Upgrade]
  lastActiveTimestamp: timestamp
  allUpgradesUnlocked: bool
```

---

## 2. Core Functions

```pseudo
// Apply all unlocked upgrades to incrementer production
function calculateProduction(incrementer: Incrementer, state: GameState) -> float
  production = incrementer.baseProduction
  for upgrade in incrementer.upgrades where upgrade.unlocked:
    production = applyUpgradeEffect(upgrade, incrementer, state, production)
  return production
// TEST: Production reflects all unlocked upgrades for incrementer

// Apply a single upgrade's effect
function applyUpgradeEffect(upgrade: Upgrade, incrementer: Incrementer, state: GameState, currentProduction: float) -> float
  switch upgrade.effectType:
    case MULTIPLY_AT_COUNT:
      if incrementer.count >= upgrade.effectParams.threshold:
        currentProduction *= upgrade.effectParams.multiplier
    case ADD_PER_OTHER:
      relatedCount = getRelatedCount(upgrade, state)
      currentProduction *= (1 + upgrade.effectParams.percent * relatedCount)
    case MULTIPLY_ON_CONDITION:
      if checkCondition(upgrade, state):
        currentProduction *= upgrade.effectParams.multiplier
    // ...other effect types
  return currentProduction
// TEST: Each upgrade effect applies correctly per its type and params

// Unlock upgrade if requirements met
function checkAndUnlockUpgrades(state: GameState)
  for upgrade in state.upgrades:
    if not upgrade.unlocked and requirementsMet(upgrade, state):
      upgrade.unlocked = true
// TEST: Upgrades unlock only when requirements are met

// Helper: Get related incrementer count for upgrade
function getRelatedCount(upgrade: Upgrade, state: GameState) -> int
  // e.g., count of incrementers in a specific tier
// TEST: Returns correct count for upgrade's related tier

// Helper: Check upgrade-specific condition
function checkCondition(upgrade: Upgrade, state: GameState) -> bool
  // e.g., idle time, all upgrades unlocked, etc.
// TEST: Returns true only when condition is satisfied
```

---

## 3. Upgrade Logic by Tier (Examples)

```pseudo
// Tier 1: Clicker
Upgrade: Finger of Fate
  effectType: MULTIPLY_AT_COUNT
  effectParams: { threshold: 10, multiplier: 2 }
// TEST: Clicker production doubles at 10 owned

Upgrade: Momentum Builder
  effectType: ADD_PER_OTHER
  effectParams: { relatedTier: 2, percent: 0.05 }
// TEST: Clicker gains 5% per Tier 2 incrementer

Upgrade: Idle Surge
  effectType: MULTIPLY_ON_CONDITION
  effectParams: { idleSeconds: 60, multiplier: 3 }
// TEST: Clicker triples output after 60s idle

Upgrade: Synergy Spark
  effectType: ADD_PER_OTHER
  effectParams: { related: "uniqueUpgradesUnlocked", percent: 0.01 }
// TEST: Clicker gains 1% per unique upgrade

// ...repeat for other tiers/upgrades as per spec
```

---

## 4. Edge Cases & Constraints

- All effects are multiplicative unless specified
- Upgrades must not stack unless designed to
- Idle/activation-based upgrades require state tracking
- Synergy upgrades must reference correct unlock counts
- Validate all user inputs (e.g., manual activation, upgrade purchase)
- Error handling for missing data, invalid states
// TEST: Edge cases (e.g., zero incrementers, all upgrades unlocked, rapid state changes) handled gracefully

---

## 5. Performance & Modularity

- Upgrade application logic must be O(n) in number of upgrades
- Data structures must support future upgrade types
- All functions are pure except where state mutation is required
// TEST: Production calculation remains performant with many upgrades