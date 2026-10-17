# Mincremental — Design Document

> **Vision:** One kingdom, many games. Each mini-game is a building inside the walls or a place in the lands around them, and each is a complete game with its own loop, resources, upgrades and mastery. The Kingdom sits above them as the only layer that connects them. Generations of monarchs (successions) build a Dynasty whose Legacy steadily widens what the Kingdom can do, until the final Eternal Kingdom runs every game at once and lets the player reach 100% of the content without another reset.

*Document version: 0.2. Supersedes v0.1 (the 8-game suite with Echoes and cross-game achievement bonuses). Section 12 lists what changed and why.*

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
- Each game gets a one-page spec (loop, resources, depth tiers, mastery tracks, automation plan) before it is implemented.

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
| Animation | motion (formerly framer-motion) | |
| Styling | CSS modules + custom properties | Drops Bootstrap and Sass |
| Quality | ESLint, Prettier, GitHub Actions (tests + build) | |

### 10.2 Source layout

```
src/
  engine/        tick loop, offline catch-up, Decimal helpers, modifier registry, save + migrations
  meta/          dynasty store (permanent), reign store (succession-scoped), succession logic
  kingdom/       land, policies, projects, exchange (stubbed until unlocked), Kingdom UI
  games/<id>/    one folder per mini-game: definition, logic, UI
  content/       data: land configs, policy forks, projects, legacy tree, depth tiers, roster
  shell/         app frame, navigation, theming
```

### 10.3 Persistence scopes

| Scope | Store | Contents |
|---|---|---|
| **Dynasty** (permanent) | `dynasty` | Legacy, Legacy tree purchases, mastery per game and tier, unlocked depth tiers, breakthroughs and partial funding, land capacity and configurations, policy flexibility, roster unlocks, Eternal flag, statistics |
| **Reign** (one succession) | `reign` | Monarch number, plot placements, policy choices, investments, project progress, temporary Exchange investments, each placed game's economy state |

Saves are one versioned blob with ordered migrations, plus export and import as text.

### 10.4 Game contract

Every mini-game implements one interface, so the Kingdom, succession, offline progress and automation work the same way for all of them:

```ts
interface GameDefinition<S> {
  id: GameId;
  zone: ZoneId;
  plotType: 'internal' | 'external';
  depthTiers: DepthTier[];            // tier 0 plus tiers unlocked by breakthroughs or Legacy
  masteryTracks: MasteryTrack[];      // per tier: XP sources, levels and what each level grants
  modifiers: ModifierKey[];           // named modifiers this game reads, e.g. 'blacksmith.speed'
  createState(ctx: GameContext): S;   // fresh economy for a new reign
  rebuild(state: S, ctx: GameContext): S;          // fast reconstruction from mastery
  tick(state: S, dt: number, ctx: GameContext): S; // active simulation
  simulate(state: S, seconds: number, ctx: GameContext): S; // offline and background catch-up
  attention(state: S, ctx: GameContext): 'autonomous' | 'occasional' | 'active';
  contributions(state: S): ResourceBundle;         // resources available to Kingdom projects
  Component: React.ComponentType<GameProps<S>>;
}
```

`GameContext` carries the game's unlocked depth, mastery levels and resolved modifiers. Games never import other games.

### 10.5 Modifiers and content as data

- Projects, policies, Legacy nodes, mastery levels and depth tiers all emit **modifiers**: `{ key, op, value, source }`.
- The modifier registry resolves them per game each tick. Games read only their own keys.
- Land configurations, policy forks, projects, the Legacy tree and the roster are plain TypeScript data in `src/content/`, validated by types and unit tests. Adding a game or a land configuration is a data change.

### 10.6 Background simulation

With many games running, only the open game ticks at full rate. The others run through `simulate` at a coarse interval, and offline time is applied the same way. Autonomous games must be cheap to simulate.

---

## 11. Milestones

Each milestone ends in something playable or verifiable. Games are added in small batches, each with its one-page spec first.

| Milestone | Scope | Proves |
|---|---|---|
| **M0 Foundation** | Repo cleanup, TypeScript/React 19/Vite 8/Vitest, lint and CI, shell, engine (tick, Decimal, modifier registry, versioned saves), game contract types, content schemas | The platform builds, tests and saves. No gameplay. |
| **M1 First playable** | Kingdom with basic land (2 internal + 1 external), the Labour fork and a few projects; Blacksmith and Mines at tier 0 plus one tier each; mastery with automation and rebuild; succession with a small Legacy tree (including the alternative land configuration); one breakthrough that opens Blacksmith mithril, funded from Blacksmith and Mines; Exchange interface stubbed and hidden | A player can progress in Blacksmith or Mines, earn mastery, succeed, rebuild faster, and unlock genuinely new content through the Kingdom |
| **M2 Dynasty breadth** | Larger Legacy tree (capacity tiers, policy flexibility), Learning and Land forks, two or three more games, offline progress, attention indicators | Land and policy constraints loosen over successions; attention stays manageable |
| **M3 Trade layer** | Exchange (Legacy unlock), Caravan, Warehouse, Trade fork | Exchange stays non-trivialising; Caravan improves it; Warehouse is optional |
| **M4 Roster growth** | Remaining proposed games in batches; open slots filled only when mechanics are found | The data-driven Kingdom scales without rewrites |
| **M5 Eternal Kingdom** | Final capacity, all policies, no mandatory succession, completion tracking | All content reachable in one Kingdom |

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

---

## 13. Open Questions

- Placement and plot type for Caravan, and whether the Arena zone is internal.
- Specs for Theatre, Warehouse and Menagerie loops.
- The shape of the Legacy formula at succession (what a reign is scored on).
- How much mastery rebuild restores at each mastery level.
- Mechanics for the four open roster slots.
