# Mincremental - AI Assistant Guide

## Project Overview

**Mincremental** is a modular incremental/idle game platform built with React 18. It hosts multiple distinct incremental games under a shared shell with per-game theming, a unified save system, and a planned meta-progression layer connecting all games.

Currently implemented games:
- **Exponential Incremental** - Cascading tier/dimension mechanics with exponential growth
- **Linear Incremental** - Cookie Clicker-style producers with an upgrade system

Planned expansion (per `specs/design_doc.md`): 8-game suite with cross-game bonuses, prestige mechanics, a global meta-currency (Echoes), and a shared achievement system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18.3 (JSX, functional components, hooks) |
| Build Tool | Vite 6.3 |
| Testing | Jest 29.7 + React Testing Library 14 |
| Styling | CSS modules + CSS custom properties (variables) |
| Persistence | `localStorage` via `saveSystem.js` |
| CSS Framework | Bootstrap 5.3 (available, used selectively) |
| Transpiler | Babel (`@babel/preset-env` + `@babel/preset-react`) |

---

## Repository Structure

```
mincremental/
├── index.html                        # HTML entry point (Vite)
├── src/
│   ├── main.jsx                      # React DOM entry point
│   ├── App.jsx                       # Root component: routing & view state
│   ├── App.css                       # Global styles & CSS variable definitions
│   ├── version.js                    # Single source of truth for APP_VERSION
│   ├── gameRegistry/
│   │   └── index.js                  # Game registry: metadata, palette, lazy import
│   ├── utils/
│   │   └── saveSystem.js             # localStorage save/load/reset helpers
│   ├── components/
│   │   ├── global/
│   │   │   ├── GlobalHeader.jsx      # User profile chip, back button
│   │   │   ├── GlobalFooter.jsx      # Version badge, GitHub link
│   │   │   └── ThemeProvider.jsx     # Injects CSS variables from active game palette
│   │   ├── gameselector/
│   │   │   └── GameSelector.jsx      # Game selection grid UI
│   │   ├── shared/
│   │   │   ├── Incrementer.jsx       # Reusable producer card (buy button + stats)
│   │   │   ├── Increment.jsx         # Single increment interaction
│   │   │   ├── UpgradeButton.jsx     # Upgrade purchase button with delta display
│   │   │   ├── Scoreboard.jsx        # Score display component
│   │   │   ├── Tooltip.jsx           # Hover tooltip wrapper
│   │   │   ├── IncrementerCard.jsx   # Card layout for incrementers
│   │   │   ├── incrementer.css
│   │   │   ├── upgrade.css
│   │   │   ├── scoreboard.css
│   │   │   ├── tooltip.css
│   │   │   ├── Incrementer.test.jsx
│   │   │   └── UpgradeButton.test.jsx
│   │   ├── linear/
│   │   │   ├── LinearGame.jsx        # State management, game loop (1s tick)
│   │   │   ├── linearGameLogic.js    # Pure functions: init, purchase, tick, apply
│   │   │   ├── upgradeEngine.js      # Upgrade definitions & unlock evaluation
│   │   │   ├── linear.css
│   │   │   ├── layouts/layouts.css
│   │   │   ├── linearGameLogic.test.js
│   │   │   └── upgradeEngine.test.js
│   │   └── exponential/
│   │       ├── ExponentialGame.jsx   # Cascading dimension game
│   │       ├── exponentialIncrementalUI.jsx
│   │       ├── Incrementer.jsx       # Dimension-specific incrementer (not shared)
│   │       ├── scoreboard.jsx
│   │       └── exponential.css
│   └── assets/
│       └── sprites/potions/          # PNG/JPG sprite assets
├── specs/
│   └── design_doc.md                 # Full 8-game vision & architecture spec
├── scripts/
│   ├── install_dependencies
│   ├── start_server
│   └── stop_server
├── package.json
├── vite.config.js
├── jest.config.js
├── jest.setup.js
└── babel.config.js
```

---

## Development Workflows

### Setup

```bash
npm install
```

### Run Development Server

```bash
npm run dev
# Vite dev server with HMR at http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in dist/
```

### Run Tests

```bash
npm test
# Jest 29 with jsdom environment
```

Tests use `identity-obj-proxy` for CSS imports, so stylesheets are mocked automatically.

---

## Key Conventions

### Component Patterns

- All components are **functional React components** with hooks. No class components.
- Props validation uses `prop-types` package.
- Game-level state lives in the top-level game component (e.g., `LinearGame.jsx`). Pure game logic lives in separate `.js` files (e.g., `linearGameLogic.js`).
- Keep UI components in `src/components/shared/` reusable and game-agnostic.

### CSS & Theming

- Each game has its own `.css` file alongside its components.
- Colors are driven by CSS custom properties (variables) defined in `App.css` and dynamically overridden by `ThemeProvider.jsx` when a game is active.
- Each game declares its palette in `src/gameRegistry/index.js`:
  ```js
  palette: {
    primary, secondary, accent,
    background, text, surface, shadow
  }
  ```
- Do not hardcode colors in component CSS; use `var(--primary)`, `var(--accent)`, etc.

### Adding a New Game

1. Create a directory under `src/components/<game-name>/`.
2. Implement `<GameName>Game.jsx` as the root component.
3. Separate pure game logic into `<gameName>Logic.js`.
4. Add an entry to `src/gameRegistry/index.js` with:
   - `id` (short string key, also used as `localStorage` namespace)
   - `title` and `blurb`
   - `loadComponent`: lazy import returning the root component
   - `palette`: color scheme object
   - `unlocks.available`: boolean controlling visibility in selector
5. The platform shell (`App.jsx`) handles routing, theming, and save/load automatically.

### Save System

All game state is persisted via `src/utils/saveSystem.js`:

```js
loadGameState(gameId)       // returns parsed JSON or null
saveGameState(gameId, state) // serializes to localStorage
resetGameState(gameId)       // removes the key
```

The `localStorage` key format is `mincremental:<gameId>`. Game components are responsible for calling these at appropriate times (on state change, before unload, on reset).

### Version Management

The single source of version truth is `src/version.js`:

```js
export const APP_VERSION = "1.0.2";
```

Update this file when bumping the version. `GlobalFooter.jsx` and `GlobalHeader.jsx` import from it.

### Game Logic Guidelines

- Write game calculations as **pure functions** (no side effects, no React imports).
- Always guard against `NaN`/`Infinity` using defensive helpers like the existing `safeNumber()` in `linearGameLogic.js`.
- Upgrade definitions live in `upgradeEngine.js` and follow this pattern:
  - Each upgrade has `id`, `name`, `description`, `cost`, `effect` (type + value), and `unlockCondition` (function).
  - Effect types: `FLAT_BONUS`, `MULTIPLIER`, `GLOBAL_MULTIPLIER`, `SET_BASE_VALUE`.

---

## Testing Conventions

- Unit tests live **next to the files they test** (e.g., `linearGameLogic.test.js` beside `linearGameLogic.js`).
- Use `@testing-library/react` for component tests; test behavior, not implementation details.
- Pure logic functions (game calculations, upgrade engine) should have comprehensive unit tests covering edge cases (zero values, max values, overflow).
- CSS is auto-mocked via `identity-obj-proxy`; no need to handle import errors.

---

## Architecture Decisions

### Lazy Loading Games

Game components are loaded lazily via dynamic `import()` in the registry:
```js
loadComponent: () => import("../components/linear/LinearGame.jsx")
```
`App.jsx` uses `React.lazy` + `Suspense` to code-split each game into its own bundle chunk.

### Global State (Meta-Progression)

Per-game state is local (React `useState`/`useEffect`). Cross-game meta-progression (Echoes, achievements) uses **Zustand** (`zustand` package) — lightweight and compatible with the existing React patterns. See the design doc for the global state shape.

### Large Number Arithmetic

Games that reach astronomical values (exponential tiers, late-game scaling) should use **`break_infinity.js`** (`Decimal` class) instead of native JS numbers to avoid floating-point overflow. Import it as:
```js
import Decimal from "break_infinity.js";
```

### Animations

**`framer-motion`** is available for UI animations. Use it for game card transitions, number pop effects, and unlock animations.

### Jest vs. Vite

Jest runs separately from Vite and uses its own Babel pipeline (`babel.config.js`). Vite uses `@vitejs/plugin-react`. Do not mix the two configs.

---

## Design Document Reference

`specs/design_doc.md` is the authoritative roadmap. Before implementing new games or meta-features, read the relevant sections:

- **Section 1** - Platform architecture & global state shape
- **Section 2** - Per-game prestige system patterns
- **Section 3** - Meta-progression (Echoes currency, Echo Shop)
- **Section 4** - Achievement system & cross-game bonus matrix
- **Sections 5-12** - Individual game designs (The Clockwork, The Forge, Heroville, The Kingdom, The Alchemist, The Exchange, The Hive, The Loop)

---

## Common Gotchas

- The `exponential/Incrementer.jsx` is a game-specific copy, not the shared component. Prefer `shared/Incrementer.jsx` for new games.
- `jest-environment-jsdom` is a separate package (required since Jest 27+). It is listed in devDependencies and referenced by `testEnvironment: "jsdom"` in `jest.config.js`.
- No environment variables are used. All config is in source files or `localStorage`.
- The `scripts/` directory contains shell scripts for server management unrelated to the npm scripts.
