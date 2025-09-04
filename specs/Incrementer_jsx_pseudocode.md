# Pseudocode: `Incrementer.jsx` (and `shared/Incrementer.jsx`) Modifications

## 1. Overview
This pseudocode outlines UI changes for `Incrementer.jsx` components (both linear-specific and shared, if applicable) to correctly display incrementer data according to `specs/linear_game_fixes_requirements.md`.

## 2. Props Expected by Incrementer Component (Illustrative)

```javascript
// PSEUDO: Props for an Incrementer component instance
// These would come from the game state managed by LinearGame.jsx / linearGameLogic.js
props = {
    id: 'thingamabob',
    name: 'Thingamabob',
    count: 5, // Number owned
    currentCost: 150, // REQ-004: Whole number, cost for the next one
    individualProductionValue: 2, // REQ-002, REQ-004: Value of ONE unit of this incrementer (e.g., "Value: 2")
    totalProductionFromType: 10, // REQ-001, REQ-004: Total value from all units of this type (e.g., "Total Prod: 10")
    onPurchase: function(id) { /* ... */ }, // Callback to purchase
    // ... other props like description, icon, etc.
};
```

## 3. `Incrementer.jsx` UI Structure (Illustrative)

```jsx
// PSEUDO: Structure of an Incrementer component's render output

function Incrementer(props) {
    // Destructure props
    const {
        name,
        count,
        currentCost,
        individualProductionValue, // Key for REQ-002
        totalProductionFromType,   // Key for REQ-001, REQ-002
        onPurchase,
        id
    } = props;

    // REQ-004: All displayed numerical values should be whole numbers.
    // This is ensured if the props themselves are already floored as per linearGameLogic.js pseudocode.

    return (
        <div className="incrementer-card">
            <h3>{name}</h3>
            <p>Owned: {count}</p>
            
            {/* REQ-002: Display for individual unit's production value */}
            <p>Value: {individualProductionValue} per sec</p>
            {/* TEST: Incrementer card for 'thingamabob' displays its individual production value correctly. (REQ-002) */}
            {/* TEST: The 'per-1' display for 'thingamabob' shows the value of a single 'thingamabob'. (REQ-001 related) */}

            {/* Optional: Display for total production from this type of incrementer */}
            {count > 0 && (
                <p>Total from {name}s: {totalProductionFromType} per sec</p>
            )}

            <p>Cost for next: {currentCost}</p>
            {/* TEST: All incrementer costs are whole numbers. (REQ-004, display part) */}
            {/* TEST: All incrementer production values are whole numbers. (REQ-004, display part) */}

            <button onClick={() => onPurchase(id)}>
                Buy 1 {name}
            </button>
            {/* ... other elements like upgrade buttons specific to this incrementer type if applicable */}
        </div>
    );
}
```

## 4. `LinearGame.jsx` (or parent component managing UI state)

### 4.1. Default for "Show Purchased" (REQ-003)
```jsx
// PSEUDO: In LinearGame.jsx or similar state management
function LinearGame() {
    // Assuming gameState is managed here or passed down from a top-level store
    const [gameState, setGameState] = useState(/* initial state from linearGameLogic.initializeGame() */);
    
    // gameState.settings.showPurchased should be false by default from linearGameLogic.js
    // TEST: On game load, the 'showPurchased' state defaults to false. (REQ-003)
    
    const handleToggleShowPurchased = () => {
        setGameState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                showPurchased: !prev.settings.showPurchased
            }
        }));
    };

    return (
        <div>
            {/* Scoreboard displaying gameState.score and gameState.totalPerSecond */}
            {/* TEST: Total score and perSecond rate are displayed as whole numbers. (REQ-004, display part) */}
            {/* TEST: Main scoreboard 'total score' is distinct from any individual incrementer's production display. (REQ-002, display part) */}

            <div>
                <label>
                    Show Purchased Upgrades:
                    <input
                        type="checkbox"
                        checked={gameState.settings.showPurchased}
                        onChange={handleToggleShowPurchased}
                    />
                </label>
            </div>

            {/* Render incrementers using data from gameState.incrementers */}
            {gameState.incrementers.map(incData => (
                <Incrementer
                    key={incData.id}
                    id={incData.id}
                    name={incData.name}
                    count={incData.count}
                    currentCost={incData.currentCost}
                    individualProductionValue={incData.individualProductionValue}
                    totalProductionFromType={incData.totalProductionFromType}
                    onPurchase={(id) => { /* call purchase logic from linearGameLogic.js and update gameState */ }}
                />
            ))}
            
            {/* Render upgrades, filtering based on gameState.settings.showPurchased */}
        </div>
    );
}
```

## 5. Notes
-   The key change for `Incrementer.jsx` is to ensure it receives and displays `individualProductionValue` clearly, distinguishing it from `totalProductionFromType` or the main game score.
-   All numerical data passed as props (`currentCost`, `individualProductionValue`, `totalProductionFromType`, `count`) should already be whole numbers as processed by `linearGameLogic.js`. The UI component's role is to display them.
-   The "Show Purchased" toggle's default state is handled by the initial game state setup in `linearGameLogic.js` and reflected in the UI component that manages this setting (likely `LinearGame.jsx`).