# Mincremental — Design Document

> **Vision:** One kingdom, many games. Each mini-game is a building inside the walls or a place in the lands around them, and each is a complete game with its own loop, resources, upgrades and mastery. The Kingdom sits above them as the only layer that connects them. Generations of monarchs (successions) build a Dynasty whose Legacy steadily widens what the Kingdom can do, until the final Eternal Kingdom runs every game at once and lets the player reach 100% of the content without another reset.

*Document version: 0.3. Supersedes v0.1 (the 8-game suite with Echoes and cross-game achievement bonuses). Section 12 lists what changed and why.*

---

## Table of Contents

1. [Design Pillars](#1-design-pillars)
2. [Structure at a Glance](#2-structure-at-a-glance)
3. [The Roster](#3-the-roster)
4. [Mastery and Depth](#4-mastery-and-depth)
5. [The Kingdom](#5-the-kingdom)
6. [Succession and the Dynasty](#6-succession-and-the-dynasty)
7. [The Exchange, Caravan and Warehouse](#7-the-exchange-caravan-and-warehouse)
8. [Automation and Player Attention](#8-automation-and-player-attention)
9. [Endgame: the Eternal Kingdom](#9-endgame-the-eternal-kingdom)
10. [Technical Architecture](#10-technical-architecture)
11. [Milestones](#11-milestones)
12. [Changes from v0.1](#12-changes-from-v01)
13. [Open Questions](#13-open-questions)

---

## 1. Design Pillars

1. **Independent games.** Every mini-game has a distinct primary loop, its own resources and upgrades, meaningful mastery, and a reason to replay it. No game requires items produced inside another game as part of its own core mechanics.
2. **The Kingdom is the only connection.** Games affect each other only through Kingdom systems (projects, policies, the Exchange). There are no direct game-to-game links.
3. **Progress flows up, options flow down.** Games feed resources up to the Kingdom; Kingdom and Dynasty progress opens new depth inside games.
4. **Mastery compresses repetition; the Kingdom adds content.** Replaying a game should get faster and more automated. New gameplay inside a game comes from Kingdom and Dynasty progression, not from grinding.
5. **Attention, not building count, is the balancing measure.** A large kingdom stays playable because mature games run themselves.
6. **New economies are never trivialised.** Each game's economy scales beyond earlier ones, so resources from an earlier game cannot skip a later game, except as a deliberate reward for heavy investment.
7. **Everything is reachable in one kingdom eventually.** Mutually exclusive choices (land, policies) are early and midgame constraints that Legacy gradually removes.

---

## 2. Structure at a Glance

| Layer | What it is | Resets on succession? |
|---|---|---|
| **Mini-games** (cap 18) | Standalone games placed on Kingdom plots | Economy and active infrastructure reset; **mastery is kept** |
| **Kingdom** | Land allocation, policies and projects for the current reign | Yes, except permanent breakthroughs |
| **Dynasty** | Legacy, the Legacy tree, mastery records, unlocked depth, breakthroughs | Never |
| **Exchange** | Kingdom-level resource conversion, unlocked later through Legacy | Temporary rate investments reset; permanent improvements stay |

The Kingdom, Dynasty and Exchange are overarching systems and **do not count** toward the 18-game cap.

**Pacing targets**

| Measure | Target |
|---|---|
| A normal succession | About 1–3 hours of play |
| Games touched per succession | Meaningful progress in one or two games, or light progress across several |
| A game's total content | Several depth eras spread across the Dynasty; **not** limited to 1–3 hours |
| First decision in any game | Within about 2 minutes |
| Full completion | Can exceed 100 hours across the whole game, but no grind is added to hit a duration |

A succession never needs every game unlocked or any game finished.

---

## 3. The Roster

The base game is capped at **18 standalone mini-games**. Fourteen are proposed; **four slots are deliberately open** until mechanics worth including are found. Do not fill them just to reach 18.

| # | Game | Zone | Plot type | Primary loop | Reference games |
|---|---|---|---|---|---|
| 1 | Blacksmith | Town | Internal | Production bottlenecks: gather, smelt and craft along a chain, then fix the slow link | Kittens Game, A Dark Room |
| 2 | Apothecary | Town | Internal | Recipe discovery: combine reagents to find new compounds, then brew | Little Alchemy, Candy Box |
| 3 | Academy | Town | Internal | Cascading generators: each rank trains the rank below | Antimatter Dimensions |
| 4 | Theatre | Town | Internal | Creative production simulator | To be specified |
| 5 | Warehouse | Town | Internal | Automated sorting and logistics: workers collect objects, store them correctly, then optimise routing and throughput | To be specified |
| 6 | Mines | Surrounds | External | Run-based digging with a skill tree between runs | Keep on Mining, Rock Bottom |
| 7 | Dungeons | Surrounds | External | Run-based party RPG | Master Healer Kale |
| 8 | Docks | Surrounds | External | Run-based fishing and descent | Fishing Inc, Scale the Depths |
| 9 | The Walls | Surrounds | External | Run-based wave defence | The Tower |
| 10 | Arena | Arena | Internal (proposed) | Team drafting auto-battler | Super Auto Pets |
| 11 | Armoury | Arena | Internal (proposed) | Spatial equipment optimisation | Backpack Battles |
| 12 | Menagerie | Arena | Internal (proposed) | Creature breeding, inherited traits and its own competitions | To be specified |
| 13 | Farm | Countryside | External | Largely passive crop growth, crossbreeding, orchards and seasons | Idle farming games |
| 14 | Caravan | To be decided | To be decided | Market arbitrage, trade routes and merchant progression | To be specified |
| 15–18 | *Open* | — | — | — | — |

**Independence rules**

- Menagerie does not supply mandatory creatures to the Arena. The Armoury does not supply mandatory equipment to anything.
- Mines, Dungeons and Docks may share the run-based skill-tree structure, provided their moment-to-moment interactions stay distinct.
- Zones describe where a game sits in the world. The Surrounds are reserved for run-based games so the zone signals the genre; other zones group games more loosely.
- Each game gets its own design and implementation phase, using the template in Section 10.8, once the foundation is proven. Only Blacksmith and Mines are specified for M1.

---

## 4. Mastery and Depth

Every mini-game progresses along two independent dimensions. This is the core rule that keeps games from being "finished" early and keeps successions from being repetitive.

| | **Mastery** | **Depth** |
|---|---|---|
| Earned by | Playing that game | Kingdom breakthroughs and Dynasty Legacy |
| Improves | Capability, automation and speed **within content already unlocked** | Opens new resource tiers, upgrades, mechanics and content branches |
| Persists | Permanently, per game and per depth tier | Permanently |
| Cap | Can reach 100% for the currently unlocked depth | Grows until the game's final tier |

**Example: Blacksmith depth tiers** (illustrative only)

| Tier | Unlocked by | New content |
|---|---|---|
| 0 | Available from the first Kingdom | Iron and steel production |
| 1 | Kingdom breakthrough | Mithril production |
| 2 | Later breakthrough | Magical and enchanted metals |
| 3 | Endgame breakthrough | Legendary forging mechanics |

**Rules**

1. Grinding a game in the early Dynasty can master tier 0 completely, but cannot open tier 1. A game can be 100% mastered at its current depth while only partly complete overall.
2. Mastery is tracked per tier. Mastery levels grant automation (auto-buy, auto-craft, auto-run), speed multipliers, and **rebuild**: at the start of a succession, a mastered tier reconstructs its established economy quickly so the player can move on.
3. When a new tier unlocks, earlier tiers should already be highly automated or rebuild fast, so the player focuses on the new mechanics.
4. "1–3 hours" describes a normal succession, not a game's total content. A game can have several eras of play spread across the Dynasty.

---

## 5. The Kingdom

The Kingdom is a game in its own right. Each succession the player makes three kinds of choices: **land**, **policies** and **projects**.

### 5.1 Land and plots

- Every game declares a plot type: **internal** (inside the walls) or **external** (the lands outside).
- The first Kingdom has **3 plots: 2 internal + 1 external**.
- Early Legacy unlocks **alternative configurations** chosen between successions, for example 1 internal + 2 external.
- Later Legacy unlocks **larger Kingdoms** with more plots, up to the point where every game in the roster can run at once.
- Roster size (18) and simultaneous capacity are separate concepts. Limited land is an early and midgame constraint that gradually disappears; players are never permanently capped at three to five active games.
- Land is data-driven: plot types, configurations and capacity tiers are definitions, so adding a game or a configuration never requires rewriting the Kingdom.

Which games are available to place is also data: a game enters the pool when its unlock condition (a Legacy node or a Kingdom milestone) is met.

### 5.2 Policies

Policies are **forks**: two options that change how games play, not just their numbers. Initially the player picks one side of each fork per succession.

| Fork | Option A | Option B | Available from |
|---|---|---|---|
| Labour | **Guild charters:** town games gain extra automation | **Expedition pay:** run-based games get more energy per run | First Kingdom |
| Learning | **Royal library:** faster discovery (Apothecary, Academy) | **War college:** Arena-zone and Walls runs start stronger | Early Legacy |
| Land | **Frontier charter:** one plot may host a game of the other plot type this succession | **Stewardship:** fully automated games produce more while needing no attention | When alternative land configurations unlock |
| Trade | **Open markets:** better Exchange rates and more pairs | **Royal works:** Kingdom projects cost less | When the Exchange unlocks |

**Flexibility unlocks through Legacy**, in order: switch one policy once mid-succession → extra policy slots → both sides of a fork at once → in the Eternal Kingdom, every policy benefit active.

**Balance notes**

- The old Land option "one extra plot" is removed. Plot **capacity** belongs to Legacy alone; the Land fork only changes **flexibility** (which plot type a game may use) or rewards automation, so it never competes with Legacy capacity.
- A fork appears only once the systems it affects exist (Trade with the Exchange, Land with alternative configurations), so no early choice is dead.
- Late-game automation reduces the value of pure automation options; Stewardship and later forks should reward depth and attention, not just more automation.

### 5.3 Projects

Projects consume resources from one or more games. They are the main way games are expanded and connected, and they are defined as data (cost, requirements, effects) using named modifiers.

| Class | Lifetime | Typical effects |
|---|---|---|
| **Breakthroughs** | Permanent (Dynasty) | Unlock a depth tier, a new mechanic, advanced automation, a Kingdom feature, or a change to how a system operates |
| **Investments** | Current succession only | Production or speed multipliers, temporary Exchange rate improvements, short-term boosts |

**Rules**

1. Significant content unlocks are breakthroughs and stay unlocked. Players never rediscover the same technology each succession.
2. Breakthrough funding persists across successions, so a breakthrough needing Blacksmith and Mines resources can be funded over several reigns, even with only three plots.
3. A project may expand a game, but no game ever needs items from another game in its own core loop.
4. Projects should be meaningful, not only percentage bonuses.
5. Not every pair of games needs a connection. Each project names the modifiers it affects (for example `blacksmith.depth.mithril` or `mines.energy.max`), which keeps 18 games maintainable.

---

## 6. Succession and the Dynasty

**A reign:** choose a land configuration and place games, set policies, develop the chosen games, fund projects, then pass the crown.

| Succession resets | Succession keeps |
|---|---|
| The Kingdom's plot placements and policy choices | Legacy and the Legacy tree |
| Investments and other temporary upgrades | Every game's mastery (per tier) |
| Each game's economy and active infrastructure | Unlocked depth tiers and breakthroughs, including partial breakthrough funding |
| Temporary Exchange rate investments | Permanent Exchange improvements, roster unlocks, statistics and achievements |

**Legacy** (formerly Echoes) is earned at succession based on what the reign achieved. It is spent on the Legacy tree, which expands:

- Land capacity and plot configurations
- Policy flexibility
- Permanent bonuses
- Kingdom systems (the Exchange, the Warehouse and Caravan in the roster pool, and others)
- Progression depth, alongside breakthroughs

Design so that successions do not require replaying every game manually from the beginning: mastery rebuild and automation carry the familiar parts.

Achievements are trophies with a small Legacy reward. They no longer grant cross-game bonuses.

---

## 7. The Exchange, Caravan and Warehouse

### 7.1 Exchange (Kingdom system)

The Exchange converts one game's resource into another's. It is **unlocked later through Legacy**, not available in the first Kingdom.

1. **Rates are earned.** Converting into a game's resource unlocks only after reaching a milestone in that game.
2. **Rates start unfavourable**, following each game's scaling step, so converting a normal amount never skips ahead.
3. **Temporary investment** improves a rate for the current succession.
4. **Legacy** provides permanent trading improvements.
5. **Trading down** into an earlier economy can be generous.
6. **No arbitrary cap** on volume.

### 7.2 Caravan (mini-game)

An independent market-trading game with its own resources, merchant upgrades, routes and progression. Caravan progress improves the Exchange: timed market offers, better rates, more trading pairs, longer offer durations and better market access. Timed offers are a proposed mechanic to develop and balance, not a final specification.

### 7.3 Warehouse (mini-game)

An independent logistics game: workers collect objects, move them to the right storage, gain automation, and eventually optimise routing and throughput. It may grant optional Kingdom benefits, but it is **never** a mandatory processing step for other games' resources.

The Exchange, Caravan and Warehouse arrive through Legacy, after the first Kingdom is understood.

---

## 8. Automation and Player Attention

As mastery grows, the earlier portions of each game become substantially automated. A Kingdom running 12 games might have about four almost fully autonomous games, five needing occasional decisions, and three getting most of the player's attention. These are examples, not quotas.

- A mastered Blacksmith rebuilds its economy quickly, but a newly unlocked depth tier makes it an active focus again.
- Balancing is judged by active attention, not building count. Even in the final Kingdom, players should be able to focus on a few games while mature systems run.
- Each game exposes its **attention state** (autonomous, occasional, active) so the Kingdom view can show what needs the player, and so playtesting can measure attention.

---

## 9. Endgame: the Eternal Kingdom

The final Dynasty reward is a permanent Kingdom with:

- All 18 plots and every game operating at once
- Both sides of every policy
- Every Kingdom feature unlocked
- No further mandatory succession
- Every game able to reach its final depth and complete mastery
- All remaining projects and 100% completion goals

The player experiences all content in one Kingdom, without resetting or choosing permanently between exclusive systems. Its length depends on accumulated progress; by then many games are mastered and automated. No grind is added to hit a duration.

---

## 10. Technical Architecture

### 10.1 Stack

Rebuild the skeleton on current versions; nothing in the current gameplay code carries forward.

| Piece | Choice | Notes |
|---|---|---|
| Language | TypeScript | Shared definitions across 18 games, modifiers and saves |
| UI | React 19 | |
| Build | Vite 8 | |
| Tests | Vitest + React Testing Library | Replaces Jest and the separate Babel pipeline |
| State | Zustand 5 | One store per persistence scope (below) |
| Numbers | break_infinity.js 2.x, **engine-wide** | Changed from v0.1: with up to 18 economies each scaling beyond the last, all resource values use `Decimal` |
| Animation | motion (formerly framer-motion) | UI transitions in panels |
| Scenes | PixiJS v8 + `@pixi/react` 8 | Canvas scenes for games that benefit from them (see 10.7) |
| Styling | CSS modules + custom properties | Drops Bootstrap and Sass |
| Quality | ESLint, Prettier, GitHub Actions (tests + build) | |

### 10.2 Source layout

```
src/
  engine/        clock, fixed-step simulation, seeded RNG, actions, Decimal helpers,
                 number formatting, modifier registry, save/load, migrations, offline catch-up
  render/        SceneHost (PixiJS lifecycle) and small presentation helpers
  ui/            shared React components (resource readouts, buttons, upgrade lists, tooltips)
  meta/          dynasty store (permanent), reign store (one succession), succession logic
  kingdom/       land, policies, projects, Exchange interface (stubbed), Kingdom UI
  games/<id>/    one folder per mini-game: logic, content, panel and/or scene
  content/       Kingdom-level data: land configs, policy forks, projects, Legacy tree, roster
  shell/         app frame, navigation, settings, theming
```

### 10.3 Persistence scopes

| Scope | Store | Contents |
|---|---|---|
| **Dynasty** (permanent) | `dynasty` | Legacy, Legacy tree purchases, mastery per game, unlocked depth tiers, breakthroughs and partial funding, land capacity and configurations, policy flexibility, roster unlocks, Eternal flag, statistics |
| **Reign** (one succession) | `reign` | Monarch number, plot placements, policy choices, investments, project progress, each placed game's state (including its RNG state) |

Saves are one versioned blob with ordered migrations, plus export and import as text. Each game's state also carries its own version and migration, so a game can change its state shape without touching the others.

### 10.4 What the platform owns and what each game owns

| Platform (shared) | Each mini-game |
|---|---|
| Time: the clock, fixed steps, pause, speed changes | Its mechanics, rules and moment-to-moment interaction |
| Persistence, migrations, export and import | Its state shape and resources |
| Offline progress and background simulation | How it advances, including any fast-forward shortcut |
| Seeded random number generation | When and how it uses randomness |
| Modifiers: resolving Kingdom, policy, Legacy and mastery effects | Which modifier keys it reads and what they do |
| Mastery and depth records, and unlock conditions | What its mastery tracks and depth tiers mean |
| Number formatting and common UI components | Its own panel layout |
| Scene lifecycle and presentation helpers | Its own scene, art and effects |
| Kingdom placement, projects and succession | What it contributes to the Kingdom and how it rebuilds |

The platform never assumes what a game's mechanics are. Shared abstractions are added only once a real game needs them, and revisited when the second and third games that use them arrive.

### 10.5 Game module contract

Every mini-game exports one module. The contract is deliberately small: it covers only what the platform must call, and leaves mechanics to the game.

```ts
interface GameModule<S, A> {
  id: GameId;
  plotType: 'internal' | 'external';
  presentation: 'panel' | 'scene' | 'hybrid';
  manifest: GameManifest;          // depth tier ids, mastery track ids, modifier keys, contributed resources
  stateVersion: number;
  migrate?(old: unknown, fromVersion: number): S;

  init(ctx: GameContext): S;                               // state for a new reign, already rebuilt from mastery
  apply(state: S, action: A, ctx: GameContext): S;         // player or automation action
  step(state: S, ctx: GameContext): StepResult<S>;         // one fixed simulation step; may emit presentation events
  fastForward?(state: S, seconds: number, ctx: GameContext): S; // optional shortcut for long spans (10.6)
  summary(state: S, ctx: GameContext): GameSummary;        // mastery gained, attention state, Kingdom contributions

  Panel?: React.ComponentType<PanelProps<S, A>>;           // React interface (panel and hybrid games)
  Scene?: SceneModule<S, A>;                               // canvas scene (scene and hybrid games)
}
```

- `GameContext` gives the game its unlocked depth tiers, mastery levels, resolved modifiers, the step length and the random generator bound to its state.
- Mastery and depth are stored by the platform as plain records (track id to experience, list of unlocked tier ids). The game decides what they unlock; the platform only persists them, shows them in the Kingdom and checks them in unlock conditions.
- Games never import other games or the Kingdom.

### 10.6 Time and simulation

Simulation is independent of React, PixiJS and frame rate. It advances only through actions and elapsed game time, and rendering is never required for progress.

1. **One clock, fixed steps.** The platform clock runs the simulation in fixed steps (100 ms by default, configurable per game) from a timer, not from `requestAnimationFrame`, which stops in hidden tabs. Pause and speed changes live in the clock.
2. **Every placed game steps, watched or not.** The open game and background games run the same `step` code, so results are the same whether the player is watching, another game is open, or rendering runs at a reduced rate.
3. **Determinism.** Each game's random state lives in its saved state and advances only inside `apply` and `step`. Given the same starting state, actions and elapsed time, a game produces the same result however the elapsed time is split. Tests check this for every game by comparing an uninterrupted run against a run broken into chunks and a save-load in the middle.
4. **Fast-forward for long spans.** Offline catch-up and very long background spans replay fixed steps in batches. A game whose steps are expensive (thousands of entities) can provide `fastForward`, which must either be exact or match step-by-step results within a tolerance that its tests enforce. Automated, mastered games are where this matters most.
5. **Offline progress.** On load, elapsed real time (capped by the offline window, which Legacy can extend) is processed in chunks with a progress indicator, through the same code path.
6. **Presentation events.** `step` and `apply` may return events (for example `rockCracked`). They are delivered only to the open game's scene and never feed back into state; in the background they are dropped.
7. **Budget.** The clock measures simulation time per tick. If background games exceed the budget, it batches their steps on later ticks rather than skipping them. Moving simulation to a Web Worker is possible later because game logic is pure and serialisable, but it is not built until profiling shows a need.

### 10.7 Presentation styles

React stays responsible for application layout, navigation, the Kingdom, management screens and upgrades, with Motion for interface animation. Canvas rendering is available for games whose play benefits from it; no game is forced onto it.

| Style | Rendering | Likely games (decided in each game's spec) |
|---|---|---|
| **Panel** | React only | Blacksmith, Apothecary, Academy, Theatre |
| **Scene** | Canvas scene with a thin React HUD | Mines, Dungeons, Docks, The Walls, Arena, Warehouse, Farm |
| **Hybrid** | React layout with an embedded scene, or drag-and-drop over a scene | Armoury, possibly Menagerie |

**Renderer: PixiJS v8 with `@pixi/react` 8** (React 19 compatible), evaluated in M0 with a spike scene before Mines is built.

| | PixiJS | Phaser |
|---|---|---|
| What it is | 2D WebGL renderer: sprites, spritesheets, particles, pointer events | Full game framework: loop, scenes, physics, input, audio |
| Fits our simulation | Yes; it only draws, and the platform clock stays in charge | Its own loop and scene system would duplicate or fight the platform clock |
| React integration | First-party `@pixi/react` | Usually run alongside React rather than inside it |
| Weight | Smaller; we add only what games use | Larger; much of it would go unused |

Phaser would only be reconsidered if a game demonstrates a need PixiJS can't meet, such as substantial physics.

**Shared presentation helpers in `src/render/`**, each kept small:

| Capability | When it is built |
|---|---|
| `SceneHost`: create and destroy the renderer, resize, device pixel ratio, pause when hidden, release textures and listeners when switching games | M0 |
| Asset loading for sprites and spritesheets | M0 |
| Pointer and touch input turned into game actions | M0 |
| Animation sequences and feedback effects (frame animations, tweens, floating numbers, simple particles) | M1, for Mines |
| Positioning and movement with interpolation between simulation steps | M1, for Mines |
| Grid and tile layout | M1, for the Mines rock grid |
| Visual layers (background, entities, effects, HUD) | M1 |
| Pause, resume, speed changes and a reduced-motion setting that scenes and Motion both respect | M1 |
| Drag-and-drop placement | When the first game needs it (likely Armoury or Warehouse) |
| Path-following movement | When the first game needs it (likely Warehouse) |

No generic physics or entity-component system is built unless a real game demonstrates the need.

**Scene rules**

1. Scenes read game state and draw it; they never change state directly.
2. Clicks, drags and taps become typed actions (for example `mines/strike`) dispatched through the same path as a React button, so input is testable and automation can use the same actions.
3. Only the open game has a live scene. Background games have no renderer at all.
4. Scenes interpolate between simulation steps so motion looks smooth even at a low step rate.
5. Placeholder art (shapes, simple spritesheets) must be swappable for final art without touching logic.

### 10.8 Per-game design template

Each game gets its own design and implementation phase after the foundation is proven. Its spec covers:

1. The unique interaction and progression loop
2. The resource economy
3. Kingdom depth unlocks (tiers and what opens them)
4. Persistent mastery and automation
5. Visual and gameplay requirements, including presentation style
6. The offline simulation approach (pure stepping, or a fast-forward and how it is validated)
7. Progression and balancing targets
8. Kingdom contributions

---

## 11. Milestones

The strategy is foundation first: build the shared systems, prove they support two genuinely different mini-games, validate that the experience is fun, and only then design and implement further games individually, in small groups.

| Milestone | Scope | Proves |
|---|---|---|
| **M0 Foundation** | Repo cleanup and toolchain; shared simulation (clock, fixed steps, seeded RNG, actions, offline catch-up); persistence with migrations; modifiers; Kingdom definitions as data; game module contract; rendering integration (`SceneHost` with PixiJS); a throwaway test game used to exercise all of it | The platform builds, tests, saves, resumes and mounts both a panel and a scene. No real gameplay and no unused systems. |
| **M1 First playable** | Placeholder art and simplified mechanics. A minimal Kingdom where games occupy plots (2 internal + 1 external); **Blacksmith** as a traditional panel incremental; **Mines** as an animated scene with rocks to strike, mining feedback, resources and a skill tree whose upgrades visibly change the scene; basic projects, the Labour fork, mastery with automation and rebuild, succession with a tiny Legacy tree; one breakthrough that opens a Blacksmith depth tier; save, load and resume of everything; Exchange interface stubbed and hidden. An animated Kingdom view only if it doesn't delay the rest. | The complete early loop works and is genuinely playable. We validate the experience here before adding any other game. |
| **M2 onward: small groups** | Two or three games at a time, each from its own spec, with Legacy breadth (land capacity, policy flexibility) growing alongside. Shared abstractions are revisited whenever a new game exposes a real requirement. | Each group adds new kinds of play without rewriting the foundation. |
| **Trade layer** (within the groups) | Exchange (Legacy unlock), Caravan, Warehouse, Trade fork | Exchange stays non-trivialising; Caravan improves it; Warehouse stays optional |
| **Eternal Kingdom** | Final capacity, all policies, no mandatory succession, completion tracking | All content reachable in one Kingdom |

The 18-game target and the Eternal Kingdom shape the data model from M0 (plot types, capacity, policy flexibility as data), but none of those later systems are built until their milestone.

### 11.1 Smallest path to a playable M1

Each step is one reviewable pull request that leaves the app working.

| Step | Delivers | Done when |
|---|---|---|
| 1. Cleanup and toolchain | Placeholders and stray tooling removed; TypeScript, React 19, Vite 8, Vitest, ESLint, Prettier, CI; empty shell | CI is green on an app that renders a blank Kingdom screen |
| 2. Engine core | Clock with fixed steps, pause and speed; seeded RNG; actions; Decimal helpers and number formatting; modifier registry; save, load, migrations, export and import; offline catch-up | A throwaway counter game passes determinism tests (chunked vs uninterrupted vs save-load) |
| 3. Kingdom skeleton | Land configs and plot placement as data; dynasty and reign stores; game registry; placing the test game on a plot | A game can be placed, run in the background and resumed after reload |
| 4. Scene spike | `SceneHost` with PixiJS: mount, resize, pause, cleanup on switch; pointer input to actions; asset loading | Switching between a panel and a scene repeatedly leaks no renderer, textures or listeners |
| 5. Blacksmith tier 0 | Panel game: gather, smelt and craft chain with a bottleneck; mastery experience; first automation | Blacksmith is fun for about 15 minutes with placeholder UI |
| 6. Mines tier 0 | Scene game: rock grid, strike action, crack and break animation, ore drops, energy per run, skill tree with visible effects (stronger pick, more rocks, an auto-miner) | Mines plays on mouse and touch and keeps progressing in the background |
| 7. Kingdom loop | Plot selection UI, the Labour fork, 2–3 investment projects, the succession screen, a tiny Legacy tree (including the alternative land configuration) | A full reign can be played and passed on |
| 8. Mastery rebuild and depth | Mastery rebuild at reign start; one breakthrough funded across successions that opens Blacksmith's next tier | After two or three successions, Blacksmith rebuilds quickly and its new tier is the focus |
| 9. Resume and playtest pass | Offline progress for both games, save versioning test, reduced-motion setting, a first balance pass, optionally a simple Kingdom view | A fresh player can play several successions and close and reopen the app without losing anything |

The M0 cleanup removes the placeholder Linear and Exponential games, `.roo/`, `.roomodes`, `scripts/` (Apache httpd scripts), `.sonarcloud.properties` (unless still used) and the Babel and Jest configs, keeps the potion sprites, and rewrites `README.md` and `CLAUDE.md`.

---

## 12. Changes from v0.1

| v0.1 assumption | v0.2 decision | Why |
|---|---|---|
| 8 games with unrelated themes | Up to 18 games as buildings and places in one kingdom; 14 proposed, 4 open | One world, more genres, room to grow |
| Echoes and an Echo Shop | Legacy and a Legacy tree in the Dynasty | Succession is the single meta reset |
| Per-game prestige feeding a global currency | Succession resets reigns; games keep mastery | One reset rhythm instead of 18 |
| Achievements grant cross-game bonuses (bonus matrix) | Games connect only through Kingdom projects, policies and the Exchange; achievements are trophies | Keeps games independent and connections maintainable |
| Games unlock by achievement counts | Games enter the pool through Legacy or Kingdom milestones and are placed on limited land | Ties unlocks to the Kingdom |
| Each game is 1–3 hours of content | A succession is 1–3 hours; a game spans several depth eras | Separates mastery from depth |
| Games may "finish" through grinding | Depth opens only through breakthroughs and Legacy | Prevents early completion |
| Exchange available early (draft review) | Exchange is a later Legacy unlock, improved by Caravan | Avoids overwhelming the first Kingdom |
| Land policy option "one extra plot" (draft review) | Capacity is Legacy-only; Land fork changes flexibility or rewards automation | Avoids competing with Legacy capacity |
| Projects as temporary upgrades (draft review) | Breakthroughs (permanent) vs investments (per succession) | No rediscovering technology each reign |
| "Each zone has one game style" (draft review) | Only the Surrounds strictly signal a genre | Theatre, Warehouse and Menagerie broaden their zones |
| break_infinity only for big-number games | `Decimal` engine-wide | Scaling across up to 18 economies |
| React context with a reducer | Zustand stores per persistence scope | Matches the stack decision |
| First milestone included a basic Exchange (draft review) | Exchange stubbed and hidden in M1 | Exchange is a Legacy unlock |
| Every game is a React interface (v0.2 draft) | Panel, scene and hybrid presentation; PixiJS scenes where play benefits | Visual games need sprites, movement and effects |
| Background games use a separate aggregated simulation (v0.2 draft) | Every placed game runs the same fixed-step simulation; optional tested fast-forward for long spans | Results must match whether watched, backgrounded or offline |
| One-page specs for all games up front (v0.2 draft) | Foundation and two games first; each further game designed individually | Abstractions should be validated by real games |

---

## 13. Open Questions

- Placement and plot type for Caravan, and whether the Arena zone is internal.
- Specs for Theatre, Warehouse and Menagerie loops.
- The shape of the Legacy formula at succession (what a reign is scored on).
- How much mastery rebuild restores at each mastery level.
- Mechanics for the four open roster slots.
