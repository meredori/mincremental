# Linear Ticker Game - Bug Fixes and Enhancements Requirements

## 1. Overview
This document outlines the requirements for fixing bugs, adjusting display elements, and re-balancing the linear ticker game.

## 2. Affected Components
- `src/components/linear/linearGameLogic.js`
- `src/components/linear/Incrementer.jsx`
- `src/components/shared/Incrementer.jsx`
- `src/components/linear/upgradeEngine.js`
- Potentially UI state management in `src/components/linear/LinearGame.jsx`

## 3. Detailed Requirements

### 3.1. Incrementer Purchase Logic (Thingamabob - 1st Incrementer)
-   **REQ-001**: When purchasing an incrementer, its contribution to the `perSecond` (or equivalent) value for that incrementer *type* must be additive, not multiplicative.
    -   **Current Behavior**: Purchasing an Nth incrementer of a type might be multiplying the `perSecond` output of that type.
    -   **Desired Behavior**: If an incrementer (e.g., "thingamabob") produces `X` units per second, and `C` units are owned, the total production from this type should be `C * X`. Purchasing another should make it `(C+1) * X`. The `per-1` display for the incrementer itself should reflect `X` (the value of one unit).
    -   **TDD Anchor**: `// TEST: Purchasing a second 'thingamabob' correctly adds its base value to the 'thingamabob' type's total production, not multiplies.`
    -   **TDD Anchor**: `// TEST: The 'per-1' display for 'thingamabob' shows the value of a single 'thingamabob'.`

### 3.2. Display Clarity: Per-Incrementer vs. Total Score
-   **REQ-002**: The display for an individual incrementer's production rate (e.g., "per sec" on the incrementer card) must be distinct from the overall game's total score/currency.
    -   **Current Behavior**: The "per-1" or "per sec" display on an incrementer card might be confusing or incorrectly linked to the total game score.
    -   **Desired Behavior**:
        -   The incrementer card should clearly display the production rate of a *single unit* of that incrementer (e.g., "Value: 5").
        -   It may also display the total production from *all units of that type* (e.g., "Total Prod: 50" if 10 units are owned, each producing 5).
        -   The main game scoreboard must display the overall total currency/score accumulated and the aggregate `perSecond` rate from all sources.
    -   **TDD Anchor**: `// TEST: Incrementer card for 'thingamabob' displays its individual production value correctly.`
    -   **TDD Anchor**: `// TEST: Main scoreboard 'total score' is distinct from any individual incrementer's production display.`

### 3.3. "Show Purchased" Default Setting
-   **REQ-003**: The "Show purchased" toggle/option should be `false` (off) by default when the game loads.
    -   **Current Behavior**: "Show purchased" is `true` (on) by default.
    -   **Desired Behavior**: The default state for displaying already purchased one-time upgrades or similar items should be hidden.
    -   **TDD Anchor**: `// TEST: On game load, the 'showPurchased' state defaults to false.`

### 3.4. Numerical Precision: Whole Numbers Only
-   **REQ-004**: All game calculations, currency, production rates, costs, and displayed values must use whole numbers. Decimals should be removed/truncated.
    -   **Current Behavior**: Calculations or displays might involve decimal values.
    -   **Desired Behavior**: Apply `Math.floor()` (or equivalent, ensuring no unintended rounding up) to all relevant calculations (costs, production values, upgrade effects, total score) and ensure displayed values are integers.
    -   **TDD Anchor**: `// TEST: All incrementer costs are whole numbers.`
    -   **TDD Anchor**: `// TEST: All incrementer production values are whole numbers.`
    -   **TDD Anchor**: `// TEST: Total score and perSecond rate are displayed as whole numbers.`
    -   **TDD Anchor**: `// TEST: Upgrade effects result in whole number changes to incrementer values.`

### 3.5. First Incrementer Balancing
-   **REQ-005**: The first incrementer type (e.g., "thingamabob") must require a significant number of its specific upgrades before its individual production value becomes greater than 1.
    -   **Current Behavior**: The first incrementer might become too powerful too quickly, or start with a base value > 1.
    -   **Desired Behavior**: Adjust the base production value of the first incrementer to be 1 (or less, if it's then modified by initial upgrades to become 1). Its specific upgrades should provide small, incremental benefits, such that multiple upgrades are needed to increase its production value to 2, then 3, and so on.
    -   **TDD Anchor**: `// TEST: The first incrementer ('thingamabob') base value is 1 (or adjusted by initial upgrades to 1).`
    -   **TDD Anchor**: `// TEST: After N upgrades (e.g., 5), the 'thingamabob' value is still 1.`
    -   **TDD Anchor**: `// TEST: After M upgrades (e.g., 10), the 'thingamabob' value becomes 2.`

### 3.6. Game Scaling and Upgrade Impact
-   **REQ-006**: The overall game progression scaling must be slowed down. Upgrades should be less impactful.
    -   **Current Behavior**: Game progression and power scaling might be too rapid due to overly effective upgrades.
    -   **Desired Behavior**:
        -   Reduce the multiplicative or additive bonuses provided by upgrades.
        -   Increase the cost scaling of incrementers and upgrades.
        -   Ensure a smoother and more extended progression curve.
    -   **TDD Anchor**: `// TEST: An upgrade to 'thingamabob' increases its value by a smaller, predefined amount compared to previous scaling.`
    -   **TDD Anchor**: `// TEST: The cost of the 10th 'thingamabob' is higher relative to its production compared to previous scaling.`
    -   **TDD Anchor**: `// TEST: Global upgrades provide a smaller percentage increase than before.`

## 4. Validation
-   All changes will be validated against these requirements through testing and review.
-   Pseudocode will include TDD anchors to guide test creation.