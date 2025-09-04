# Linear Incrementer Upgrades Spec

## Tier 1: Clicker  
- Name: "Finger of Fate"  
  Effect: "Production x2 at 10 purchased"  
  // TEST: Clicker production doubles at 10 owned

- Name: "Momentum Builder"  
  Effect: "+5% production per Tier 2 incrementer owned"  
  // TEST: Clicker gains 5% per Tier 2 incrementer

- Name: "Idle Surge"  
  Effect: "Production x3 while idle for 60s"  
  // TEST: Clicker triples output after 60s idle

- Name: "Synergy Spark"  
  Effect: "+1% production per unique upgrade unlocked"  
  // TEST: Clicker gains 1% per unique upgrade

---

## Tier 2: Generator  
- Name: "Gear Up"  
  Effect: "Production x2 at 15 purchased"  
  // TEST: Generator production doubles at 15 owned

- Name: "Linear Link"  
  Effect: "+10% production per Tier 1 incrementer owned"  
  // TEST: Generator gains 10% per Tier 1 incrementer

- Name: "Chain Reaction"  
  Effect: "Production x2 when Tier 3 is unlocked"  
  // TEST: Generator doubles output when Tier 3 unlocked

- Name: "Upgrade Cascade"  
  Effect: "+2% production per upgrade purchased (all tiers)"  
  // TEST: Generator gains 2% per upgrade purchased

---

## Tier 3: Factory  
- Name: "Assembly Line"  
  Effect: "Production x2 at 20 purchased"  
  // TEST: Factory production doubles at 20 owned

- Name: "Industrial Synergy"  
  Effect: "+8% production per Tier 2 incrementer owned"  
  // TEST: Factory gains 8% per Tier 2 incrementer

- Name: "Overdrive Protocol"  
  Effect: "Production x3 for 30s after manual activation"  
  // TEST: Factory triples output for 30s after activation

- Name: "Efficiency Matrix"  
  Effect: "+1% production per 100 total incrementers owned"  
  // TEST: Factory gains 1% per 100 incrementers

---

## Tier 4: Reactor  
- Name: "Fusion Core"  
  Effect: "Production x2 at 10 purchased"  
  // TEST: Reactor production doubles at 10 owned

- Name: "Power Feedback"  
  Effect: "+12% production per Tier 3 incrementer owned"  
  // TEST: Reactor gains 12% per Tier 3 incrementer

- Name: "Critical Mass"  
  Effect: "Production x4 when all lower tiers have at least 25 owned"  
  // TEST: Reactor quadruples output when all lower tiers ≥25

- Name: "Synergetic Pulse"  
  Effect: "+3% production per unique synergy upgrade unlocked"  
  // TEST: Reactor gains 3% per unique synergy upgrade

---

## Tier 5: Singularity  
- Name: "Event Horizon"  
  Effect: "Production x2 at 5 purchased"  
  // TEST: Singularity production doubles at 5 owned

- Name: "Temporal Echo"  
  Effect: "+20% production per Tier 4 incrementer owned"  
  // TEST: Singularity gains 20% per Tier 4 incrementer

- Name: "Infinity Loop"  
  Effect: "Production x5 when all upgrades for all tiers are unlocked"  
  // TEST: Singularity quintuples output when all upgrades unlocked

- Name: "Universal Synergy"  
  Effect: "+1% production per incrementer owned (all tiers)"  
  // TEST: Singularity gains 1% per incrementer owned

---

## Notes  
- All effects are multiplicative.  
- Synergy upgrades interact across tiers.  
- Each upgrade is unique and modular.  
- TDD anchors included for each effect.