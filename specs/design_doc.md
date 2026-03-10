# Mincremental — Design Document

> **Vision:** A suite of 8 lite incremental games, each inspired by a distinct genre of idle/incremental game. Games are connected through a shared meta-progression layer: achievements in one game grant permanent bonuses in others, and prestige in any game earns global currency. The experience is roguelike-flavoured — you run games, build up, prestige, and gradually unlock a more powerful version of every world.

---

## Table of Contents

1. [Platform Architecture](#1-platform-architecture)
2. [Meta-Progression System](#2-meta-progression-system)
3. [Prestige System](#3-prestige-system)
4. [Achievement System & Cross-Game Bonuses](#4-achievement-system--cross-game-bonuses)
5. [The Eight Games](#5-the-eight-games)
   - [Game 1 — The Clockwork](#game-1--the-clockwork-dimensionsabstract-numbers)
   - [Game 2 — The Forge](#game-2--the-forge-resource-chains--crafting)
   - [Game 3 — Heroville](#game-3--heroville-idle-rpg--combat)
   - [Game 4 — The Kingdom](#game-4--the-kingdom-civilisationpopulation)
   - [Game 5 — The Alchemist](#game-5--the-alchemist-discoverycombination)
   - [Game 6 — The Exchange](#game-6--the-exchange-economytrading)
   - [Game 7 — The Hive](#game-7--the-hive-swarmevolution)
   - [Game 8 — The Loop](#game-8--the-loop-time-loopsmeta-reset)
6. [Cross-Game Bonus Matrix](#6-cross-game-bonus-matrix)
7. [Progression & Unlock Order](#7-progression--unlock-order)
8. [Technical Notes](#8-technical-notes)

---

## 1. Platform Architecture

The platform shell (App, GameSelector, GlobalHeader, ThemeProvider, saveSystem) remains game-agnostic. Each game is a self-contained module registered in `src/gameRegistry/index.js`.

### Global vs Local State

| Scope | Key | Contents |
|---|---|---|
| **Global** | `mincremental:global` | Echoes, achievements, unlocked games, ascension rank, prestige counts |
| **Per-game** | `mincremental:<gameId>` | All local game state (score, producers, upgrades, etc.) |

The global state is loaded once at app start and made available to all games via a `GlobalContext`. When a game awards an achievement or triggers a prestige, it dispatches an action to the global context which handles persistence.

**Canonical game ID:** The `id` field in the game registry entry (e.g. `'clockwork'`, `'forge'`) is the single canonical identifier. It is used as both the localStorage key suffix (`mincremental:<id>`) and as the key in `globalState.prestigeCounts`. The old codebase used inconsistent IDs (`exp`/`lin` for selection, `exponential`/`linear` for storage); the new convention is one consistent id everywhere.

**Prestige count authority:** `prestigeCounts` lives exclusively in global state. Per-game local state does not store its own prestige count — it reads from `GlobalContext` when needed.

### Game Registration Shape (extended)

```js
{
  id: 'clockwork',
  title: 'The Clockwork',
  blurb: '...',
  loadComponent: () => import('./components/clockwork/ClockworkGame'),
  palette: { ... },
  unlocks: {
    available: true,           // false = locked on selector
    condition: null,           // null = always available
    // condition: { globalAchievements: ['forge-first-prestige'] }
  },
  metaContributions: {
    prestigeCurrencyPerReset: 10,   // base Echoes awarded on prestige
    achievementIds: ['cw-dim2', 'cw-infinity', ...],
  }
}
```

---

## 2. Meta-Progression System

### Currency: Echoes

**Echoes** are the global meta-currency. They persist across all resets and can be spent freely — the balance can reach zero, but never goes negative (purchases are blocked if the player cannot afford them). They are earned by:

- Prestiging within any game (base amount set per game, scaled by prestige depth)
- Unlocking cross-game achievements
- Reaching milestone scores in any game

Echoes are spent in the **Echo Shop**, a panel accessible from the GlobalHeader. Purchases here are permanent and apply across all games.

### Echo Shop (example purchases)

| Purchase | Cost | Effect |
|---|---|---|
| Head Start | 5 | All games begin with 10% of first-tier resources already owned |
| Resilient | 15 | Offline progress calculated up to 4 hours instead of 1 |
| Polymath | 25 | Each game you have prestiged gives all other games +2% production |
| Echoing Legacy | 50 | Prestige earns 25% more Echoes globally |
| Quick Study | 30 | Upgrade unlock conditions require 20% less progress |
| Veteran | 100 | All games start with their first upgrade pre-purchased |

---

## 3. Prestige System

Each game has its own **prestige mechanic** that fits its theme. Prestige always:

1. Resets local game progress (to a defined baseline, not zero)
2. Awards a permanent in-game prestige multiplier (stacks additively)
3. Awards **Echoes** to the global pool
4. Records the prestige in global state (used for cross-game bonuses)

The prestige button is gated behind a meaningful threshold so first prestige feels earned (roughly 10–20 minutes of play). Subsequent prestiges should be reachable faster due to compounding bonuses.

| Game | Prestige Name | What Resets | Kept on Reset | In-game Reward |
|---|---|---|---|---|
| The Clockwork | Infinity | All dimensions | Infinity upgrades | +∞ multiplier to base dim output |
| The Forge | Temper | Materials & buildings | Blueprints | +X% to all production rates |
| Heroville | Rebirth | Hero levels & gear | Class unlocks | Heroes start at higher base stats |
| The Kingdom | Era | Population & buildings | Technologies | Start new era with bonus resources |
| The Alchemist | Distil | Resources & reagents | Discovered recipes, Formulae (lore) | New element tier unlocked |
| The Exchange | Market Reset | Routes & businesses | Trade licenses | Price floor raised on all goods |
| The Hive | Metamorphosis | Swarm count | Evolved traits | Trait slots increase by 1 |
| The Loop | Ascend | Loop count resets to 0 | Action queue depth | Action slots increase permanently |

---

## 4. Achievement System & Cross-Game Bonuses

Achievements are one-time milestones. Once earned, they are stored globally and their bonus is permanently applied to the target game, even across prestiges.

### Achievement Structure

```js
{
  id: 'forge-first-prestige',

  // A specific game id, or 'any' for achievements that can be triggered in any game.
  // 'any' achievements use a separate condition function rather than a per-game check.
  sourceGame: 'forge',              // string | 'any'

  title: 'Master of Metal',
  description: 'Complete your first Temper in The Forge.',

  // A specific game id, or 'all' to apply the bonus to every registered game.
  bonusTarget: 'clockwork',         // string | 'all'

  bonus: {
    type: 'PRODUCTION_MULTIPLIER',   // shared bonus type enum
    value: 1.05,                     // +5%
    description: '+5% to all Dimension output'
  }
}
```

**Sentinel values:**

| Field | Value | Meaning |
|---|---|---|
| `sourceGame` | `'any'` | Achievement is evaluated globally (e.g. "prestige in any 4 games"). The trigger condition is a function on global state rather than a per-game event. |
| `bonusTarget` | `'all'` | `getMetaBonuses` applies this bonus when called for any game id. |

`getMetaBonuses(gameId, globalState)` filters by `bonusTarget === gameId || bonusTarget === 'all'`.

### Bonus Types (shared enum)

| Type | Effect |
|---|---|
| `PRODUCTION_MULTIPLIER` | Multiplies all production in target game |
| `COST_REDUCTION` | Reduces all purchase costs by a flat % |
| `STARTING_RESOURCE` | Target game starts each run with extra resources |
| `OFFLINE_MULTIPLIER` | Boosts offline progress rate |
| `UNLOCK_UPGRADE` | Immediately unlocks a specific upgrade in target game |
| `EXTRA_PRESTIGE_CURRENCY` | Earns more Echoes on prestige in target game |
| `TICK_RATE_BONUS` | Reduces game tick interval (faster updates) |

---

## 5. The Eight Games

---

### Game 1 — The Clockwork *(Dimensions/Abstract Numbers)*

> **Merges the current Linear and Exponential games into one.**

**Inspiration:** Antimatter Dimensions, Derivative Clicker, Idle Big Devil

**Premise:** An abstract machine of cascading dimensions. Dimension 1 produces points. Dimension 2 produces Dimension 1 per tick. Dimension 3 produces Dimension 2 per tick, and so on. At first only Dim 1 and 2 exist — higher dimensions unlock as you grow.

**Core Loop:**
1. Buy units of Dimension 1 → generates Points/sec
2. Buy units of Dimension 2 → generates Dim 1 units/sec (automating tier 1 purchases)
3. Continue up to Dimension 8 (max tier)
4. Points unlock Upgrades that multiply individual or all Dimensions
5. Reach an "Infinity Point" threshold to Prestige → reset Dims, gain Infinity Multiplier

**Key Mechanics:**
- Dimension costs scale exponentially; buying 10 at once gives a bulk discount
- Each Dimension has its own multiplier upgrade tree (x2, x4, etc.) bought with Points
- Dimension 8 only produces 1 unit ever (extremely rare, extremely powerful)
- **Infinity:** First prestige layer. Awards a flat multiplier applied to all future runs.
- **Eternity (stretch goal):** Second prestige layer stacking on top of Infinity.

**What Makes It Distinct:** Cascading tiers create explosive, hard-to-predict growth. The satisfaction is watching all numbers accelerate as higher tiers come online — less "buy the thing, thing produces points" and more "the machine feeds itself."

**Palette:** Deep navy + electric cyan (`#0a0e1a`, `#00d4ff`)

---

### Game 2 — The Forge *(Resource Chains & Crafting)*

**Inspiration:** Kittens Game, A Dark Room, Forager (idle aspects)

**Premise:** A blacksmith's workshop in a fantasy world. Raw materials must be gathered, processed, and crafted into goods — each stage requires the output of the previous one.

**Core Loop:**
1. Gather raw materials (Stone, Iron Ore, Coal) — manually at first, then via miners
2. Smelt ores → ingots (consumes Coal)
3. Craft ingots → tools/weapons → sold for Gold
4. Gold buys workshops and automation upgrades
5. Buildings (Mine, Smelter, Workshop, Market) unlock and run passively

**Key Mechanics:**
- Resource chain dependency: you can't craft without smelting; you can't smelt without fuel
- Bottleneck design: identifying and fixing the slow link in the chain is the gameplay
- Blueprint system: discover new craftable items (a form of the upgrade unlock tree)
- Stockpile limits: storage upgrades required or production halts
- Prestige (Temper): Resets raw materials and building counts; keeps Blueprints unlocked

**What Makes It Distinct:** Supply-chain thinking. The player juggles multiple interdependent resources rather than one accumulating number. Satisfying when everything flows; frustrating when one step stalls — fixing the stall is the game.

**Palette:** Warm charcoal + amber + orange (`#1a1208`, `#e8871a`, `#f5c842`)

---

### Game 3 — Heroville *(Idle RPG & Combat)*

> Named after the project's original working title.

**Inspiration:** Swords & Potions, Idle Heroes, Trimps, Idle Dungeon Master

**Premise:** A small adventurer's guild. Recruit heroes, send them to dungeons, collect loot, upgrade gear, fight increasingly powerful bosses.

**Core Loop:**
1. Recruit hero classes (Fighter, Rogue, Mage, Cleric) — each has different DPS/utility
2. Assign heroes to Dungeons — auto-battle over time, earning Gold and Loot
3. Use Gold to recruit more heroes; use Loot to craft/upgrade gear
4. Progress through Dungeon tiers unlocked by defeating bosses
5. Boss fights are manual/semi-manual checkpoints requiring party preparation

**Key Mechanics:**
- Party composition matters: balanced parties clear faster than single-class spam
- Gear has simple stats (Attack, Defence, Speed) that apply bonuses to hero output
- Hero XP and levels give incremental production bonuses (RPG feel without real-time combat)
- Potions (using the existing sprite assets!) are consumable during boss fights
- Prestige (Rebirth): Heroes reset to level 1 but retain their Class Unlocks; future heroes of that class start with a base stat bonus

**What Makes It Distinct:** Narrative progression (dungeon floors, boss names, loot descriptions). The player feels like they're building something with character rather than just accumulating abstract numbers. Gear and class variety give decision points absent from pure number games.

**Palette:** Deep crimson + gold + stone (`#1a0808`, `#d4a017`, `#8b7355`)

---

### Game 4 — The Kingdom *(Civilisation & Population)*

**Inspiration:** Evolve Idle, Kittens Game (civilisation layer), Realm Grinder

**Premise:** A growing medieval settlement. Grow your population, assign citizens to roles, construct buildings, research technologies, and expand into new territory.

**Core Loop:**
1. Population grows passively based on Housing capacity
2. Assign Citizens to roles: Farmers (food), Miners (stone/iron), Scholars (research)
3. Build structures: Granary, Library, Barracks, Market, etc. (require resources)
4. Research technologies from the Library to unlock efficiency upgrades
5. Territory expansion unlocks new building slots and resource types

**Key Mechanics:**
- Citizens are a finite resource — allocating more to one role starves another
- Food is a tick-based consumption: insufficient food causes population growth to stall
- Tech tree: technologies are one-time purchases with cascading unlock chains
- Happiness system: affects population growth rate; certain buildings raise or lower it
- Prestige (Era): Resets population and buildings; keeps the full tech tree. Start the new era with a "founding bonus" (extra starting resources scaled by era count)

**What Makes It Distinct:** Resource allocation and optimisation under constraints. The player isn't just accumulating — they're managing a living system where decisions have knock-on effects. The tech tree gives a sense of historical progression and discovery.

**Palette:** Forest green + parchment + stone (`#0d1f0d`, `#e8dcc8`, `#6b7c5a`)

---

### Game 5 — The Alchemist *(Discovery & Combination)*

**Inspiration:** Universal Paperclips (discovery pacing), Little Alchemy, Candy Box (hidden reveals), Idle Research

**Premise:** A wizard's laboratory. Combine base elements and reagents to discover new substances, brew potions, and unlock increasingly exotic alchemical reactions.

**Core Loop:**
1. Start with 4 base elements (Fire, Water, Earth, Air) — accumulate them passively
2. Combine two elements to attempt a reaction; success reveals a new compound
3. Discovered compounds become new resources and ingredients for further combinations
4. Potions are saleable end-products: sell them for Gold
5. Gold buys Apparatus upgrades (Alembic, Crucible, etc.) that automate or accelerate reactions

**Key Mechanics:**
- Discovery is the dopamine hit: the recipe list expands as you find combinations, many of which are surprising or humorous
- Failed combinations waste resources — resource management matters especially early
- Hint system: after enough failed attempts, a vague clue unlocks (costs Gold)
- Reaction yield improves with upgrades; early combinations are slow and lossy
- The potion sprite assets fit naturally here as item icons
- Prestige (Distil): Recipes stay discovered (they are permanent knowledge). Resources reset. Each Distil unlocks a new tier of elements (e.g., Aether, Void) with new reaction trees.

**What Makes It Distinct:** Exploration and "aha" moments rather than optimisation. The player is hunting for the recipe list rather than maximising a number. Replayability comes from the tree expanding with each prestige tier.

**Palette:** Purple + emerald + gold (`#120a1f`, `#1a6b3a`, `#c8a000`)

---

### Game 6 — The Exchange *(Economy & Trading)*

**Inspiration:** Adventure Capitalist, Offworld Trading Company (lite), Idle Business Tycoon, Stock Market Game

**Premise:** A travelling merchant turned trade empire. Buy and sell goods across routes, exploit price differences, upgrade your fleet, and manipulate markets.

**Core Loop:**
1. Begin with one Trade Route between two towns, selling a basic good (grain, cloth)
2. Each route takes time to complete a round trip; completion earns Gold
3. Gold buys more routes, larger caravans (higher capacity), and faster travel upgrades
4. Good prices fluctuate on a simple sine-wave schedule — buying cheap and selling high is possible
5. New goods unlock (spices, gems, exotic goods) with higher margins but more complexity

**Key Mechanics:**
- Time-to-completion is the core resource: shorter trips + larger caravans = more Gold/sec
- Price fluctuation creates an active (optional) layer: watching prices and timing purchases
- Trade licenses unlock exclusive routes with better margins (bought with Echoes or Gold)
- Market events (drought, festival, war) cause temporary price spikes — windows to exploit
- Prestige (Market Reset): Routes and caravans reset. Trade Licenses kept. Price floors raise permanently (better baseline income each run).

**What Makes It Distinct:** Time-based return on investment rather than per-tick production. The player thinks in "trips per hour" rather than "per second." The price fluctuation layer rewards attention without requiring it, making it both idle and engaging.

**Palette:** Ocean blue + sand + gold coin (`#0a1628`, `#d4b896`, `#f0c040`)

---

### Game 7 — The Hive *(Swarm & Evolution)*

**Inspiration:** Swarm Simulator, Cell to Singularity, Spore (creature stage), Idle Evolution

**Premise:** A single cell that divides, evolves, and grows into a vast insectoid civilisation. Manage population castes, evolve traits, and consume territory.

**Core Loop:**
1. Start with Worker cells that reproduce and gather nutrients
2. Nutrients fund specialisation: Workers, Soldiers, Scouts, Queens
3. Each caste has a role: Workers gather, Soldiers defend/attack territory, Scouts find new territory, Queens increase breeding rate
4. Territories are conquered by Soldiers — each new territory adds a resource multiplier
5. Evolution points (earned slowly over time) are spent on permanent Trait upgrades

**Key Mechanics:**
- Caste balance: too many Soldiers = slow resource growth; too few = vulnerable to territory loss
- Territory attacks are asynchronous events — lose a territory if defence is too low
- Evolution traits persist through prestige (partial persistence, unlike most resources)
- Exponential swarm numbers — Hive is the "big numbers" game of the suite, intentionally reaching billions and beyond
- Prestige (Metamorphosis): Resets swarm counts and territories; keeps all evolved traits; gains a new Trait Slot (max traits you can have active simultaneously increases)

**What Makes It Distinct:** Multiple competing pressures (resources, territory, caste balance) with an explicitly adversarial element (territory attacks). The evolution/trait system gives the player a feeling of permanent biological progress even after resets.

**Palette:** Sickly green + chitin brown + bio-yellow (`#0d1a08`, `#3d2b1a`, `#a8c400`)

---

### Game 8 — The Loop *(Time Loops & Meta Reset)*

**Inspiration:** Idle Loops, Groundhog Life, Loop Hero (idle aspects), NGU Idle (the meta feel)

**Premise:** You are trapped in a time loop. Each loop lasts a fixed duration. During the loop you take actions. At the end of the loop you reset — but retain a growing list of permanent improvements. The goal: make each loop faster and more efficient than the last.

**Core Loop:**
1. Each loop has a countdown timer (e.g., 60 seconds real time)
2. During the loop, queue **Actions** (gather resource, buy building, fight enemy, research upgrade)
3. Actions take time to execute sequentially; you fill the loop with as many actions as possible
4. At loop end: resources reset but **Progress Points** are kept, and permanent upgrades are purchasable
5. Loop 2 starts faster than Loop 1 because you know what actions are efficient

**Key Mechanics:**
- Action Queue: drag-and-drop or ordered list of up to N actions (N grows with Ascension)
- Actions have variable durations; optimising the queue is the puzzle
- Some actions unlock only after X loops completed (knowledge accumulation)
- Mana regenerates loop-to-loop (not reset), used for powerful one-shot actions
- Prestige (Ascend): Resets loop count to 0 and Progress Points; permanently increases Action Queue depth by 2 and unlocks a new tier of Actions
- The game is inherently about meta-thinking — it mirrors the overall platform's prestige loop

**What Makes It Distinct:** The player is always doing *something* active (curating their queue) while still being idle (the loop runs itself). It's the most cerebral of the 8 — less "watch numbers grow" and more "optimise the system." It also acts as a thematic mirror for the platform's own prestige loop.

**Palette:** Temporal violet + silver + white (`#0d0819`, `#b0b8d0`, `#e8eaf6`)

---

## 6. Cross-Game Bonus Matrix

Each achievement targets a *different* game than its source, encouraging players to visit all games. The bonuses are meaningful but not so large they trivialise the target game.

| Achievement | Source Game | Trigger | Target Game | Bonus |
|---|---|---|---|---|
| **First Spark** | The Clockwork | Reach Dimension 4 | The Forge | +10% Miner output |
| **Infinity Reached** | The Clockwork | First Infinity prestige | Heroville | Heroes start at level 2 |
| **Master of Metal** | The Forge | First Temper prestige | The Clockwork | +5% all Dimension production |
| **Supply Chain** | The Forge | Automate all 3 resource tiers | The Exchange | Start with 1 Trade License |
| **First Blood** | Heroville | Defeat first dungeon boss | The Hive | Soldiers deal +15% damage |
| **Veteran Guild** | Heroville | Prestige 3 times | The Kingdom | Barracks trains 20% faster |
| **Growing Empire** | The Kingdom | Reach 1000 population | The Exchange | All routes earn +5% Gold |
| **Scholar** | The Kingdom | Research full tech tree tier 1 | The Alchemist | Hint costs reduced by 50% |
| **First Brew** | The Alchemist | Discover 10 compounds | The Forge | Unlock Alchemical Alloy blueprint |
| **Grand Distil** | The Alchemist | First Distil prestige | The Loop | Unlock Brew Action in action queue |
| **Merchant Prince** | The Exchange | Earn 1M Gold total | The Kingdom | Start each Era with 500 Gold |
| **Market Crash** | The Exchange | First Market Reset prestige | Heroville | Potion costs reduced by 25% |
| **Critical Mass** | The Hive | Reach 1 billion workers | The Clockwork | +1 to starting Dimension 1 count |
| **Evolved** | The Hive | Unlock 5 Evolution traits | The Loop | Add 2 Action slots permanently |
| **Perfect Loop** | The Loop | Complete a loop using all available slots | All Games | +1% production in all games |
| **Time Mastery** | The Loop | First Ascend prestige | All Games | +15 min offline progress window |
| **Polymath** | Any | Prestige in 4 different games | All Games | +5% Echo earnings globally |
| **Grand Tour** | Any | Prestige in all 8 games | All Games | Unlock secret "Ninth Loop" mode |

---

## 7. Progression & Unlock Order

Games unlock sequentially to avoid overwhelming new players. The first two are always available; others unlock via global achievements.

| Unlock Order | Game | Unlock Condition |
|---|---|---|
| 1 | **The Clockwork** | Always available |
| 2 | **The Forge** | Always available |
| 3 | **Heroville** | Earn any 1 achievement in Clockwork or Forge |
| 4 | **The Kingdom** | Prestige once in any game |
| 5 | **The Alchemist** | Earn 3 total achievements across any games |
| 6 | **The Exchange** | Prestige in 2 different games |
| 7 | **The Hive** | Earn 8 total achievements across any games |
| 8 | **The Loop** | Prestige in 4 different games |

This ensures:
- Players experience the core loop in simple games first
- Complexity is introduced gradually
- Prestige (the key meta mechanic) is discovered naturally before the more complex games appear
- The Loop — the most conceptually unusual game — is a late reward

---

## 8. Technical Notes

### Merging Linear + Exponential → The Clockwork

The current codebase has two separate games:
- **Linear:** Basic producer/upgrader (Cookie Clicker style)
- **Exponential:** Cascading tier mechanics

These cover the same fundamental archetype. The Clockwork replaces both, incorporating:
- The upgrade system from `upgradeEngine.js` (adaptable to per-Dimension upgrades)
- The tier cascade logic from `ExponentialGame.jsx`
- A new prestige layer (Infinity) not present in either current game

Both existing games' save keys (`mincremental:linear`, `mincremental:exponential`) should be treated as deprecated. Migration is not required — old saves can simply be dropped.

### Global Context Shape

```js
{
  echoes: 0,
  totalEchoesEarned: 0,
  achievements: [],               // array of achievement ids
  prestigeCounts: {},             // { gameId: count } — authoritative prestige record
  echoShopPurchases: [],          // array of shop item ids
  unlockedGames: ['clockwork', 'forge'],
  ascensionRank: 0,               // total prestiges across all games; used for display and some bonuses
  version: 1                      // for migration
}
```

`ascensionRank` is a derived convenience value: `Object.values(prestigeCounts).reduce((sum, n) => sum + n, 0)`. It is recomputed and stored on every prestige dispatch so that UI components can read it without recalculating.

### Meta Bonus Application

Each game's logic init should call a `getMetaBonuses(gameId, globalState)` utility that:
1. Scans all achievements in `globalState.achievements`
2. Filters for those targeting `gameId`
3. Returns an aggregated bonus object: `{ productionMultiplier, costReduction, startingResources, ... }`

Game logic applies these bonuses on top of local state before the first tick.

### Achievement Dispatch

When a game detects an achievement condition is met:
```js
dispatch({ type: 'AWARD_ACHIEVEMENT', payload: { id: 'forge-first-prestige' } })
```
The global reducer adds the id to the achievements array (idempotent — duplicate awards are ignored) and persists to `mincremental:global`.

### Prestige Dispatch

```js
dispatch({ type: 'PRESTIGE', payload: { gameId: 'forge', echoValue: 15 } })
```
Global reducer increments `prestigeCounts[gameId]` and adds `echoValue` (scaled by any Echo multiplier upgrades) to `echoes`.

### Save System Extension

The existing `saveSystem.js` handles per-game saves cleanly. Global state needs one additional exported pair:
```js
export const loadGlobalState = () => loadGameState('global');
export const saveGlobalState = (state) => saveGameState('global', state);
```

---

*Document version: 0.1 — Initial design. Subject to revision as implementation progresses.*
