// Linear game logic module for state management and progression

/**
 * Gets the initial state for upgrades by tier
 */
function getUpgradesForTier(tierId, tierName, baseCost) {
  return [
    {
      id: `${tierId}_speed1`,
      name: `Speedy ${tierName} I`,
      desc: `Your ${tierName}s work 50% faster!`,
      cost: baseCost * 10,
      purchased: false,
      affects: tierId,
      multiplier: 1.5,
      type: "production"
    },
    {
      id: `${tierId}_efficiency1`, 
      name: `Efficient ${tierName} I`,
      desc: `Your ${tierName}s cost 25% less!`,
      cost: baseCost * 15,
      purchased: false,
      affects: tierId,
      multiplier: 0.75,
      type: "cost"
    }
  ];
}

function toRomanNumeral(num) {
  const romanNumerals = [
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];

  let result = '';
  for (let { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

/**
 * Returns the initial state for the linear incremental game.
 */
export function getInitialState() {
  const tier1 = {
    id: "tier1",
    cost: 1,
    owned: 0,
    rate: 1,
    name: "Thingamabob",
    desc: "A curious little gadget that does... something.",
  };

  return {
    score: 1,
    increment: [tier1],
    upgrades: [
      ...getUpgradesForTier("tier1", "Thingamabob", tier1.cost)
    ],
    timer: 1000,
  };
}

/**
 * Get the total multiplier for an increment from upgrades
 */
export function getMultiplier(state, tierId, type = "production") {
  if (!state?.upgrades) return 1;
  
  return state.upgrades
    .filter(u => u?.purchased && u?.affects === tierId && u?.type === type)
    .reduce((total, upgrade) => total * (upgrade?.multiplier || 1), 1);
}

function createNextTier(upgrade, tierNum) {
  // Don't create next tier if at limit
  if (tierNum >= 10) return null;

  const nextTierNum = tierNum + 1;
  const baseNameParts = upgrade.name.split(' ');
  // Remove the roman numeral from the end
  baseNameParts.pop();
  const baseName = baseNameParts.join(' ');

  return {
    ...upgrade,
    id: `${upgrade.affects}_${upgrade.type}${nextTierNum}`,
    name: `${baseName} ${toRomanNumeral(nextTierNum)}`,
    cost: Math.ceil(upgrade.cost * 5),
    purchased: false,
    multiplier: 1 + (upgrade.multiplier - 1) * 1.5
  };
}

/**
 * Handle upgrade purchase
 */
export function handleUpgrade(state, upgradeId) {
  if (!upgradeId || !state.upgrades) return state;

  const upgrade = state.upgrades.find(u => u.id === upgradeId);
  if (!upgrade || upgrade.purchased || state.score < upgrade.cost) {
    return state;
  }

  let score = state.score - upgrade.cost;
  let upgrades = state.upgrades.map(u => ({...u}));
  
  // Mark the upgrade as purchased
  const purchased = upgrades.find(u => u.id === upgradeId);
  if (purchased) {
    purchased.purchased = true;
  }

  // Get the tier number from the ID
  const tierMatch = upgradeId.match(/\d+$/);
  const tierNum = tierMatch ? parseInt(tierMatch[0]) : 1;

  // Create next tier upgrade
  const nextTier = createNextTier(upgrade, tierNum);
  if (nextTier) {
    upgrades.push(nextTier);
  }

  return {
    ...state,
    score,
    upgrades
  };
}

/**
 * Handles incrementer click logic and returns the new state.
 */
export function handleIncrement(state, x, i) {
  if (!state?.increment || !x) return state;

  // Apply cost reduction multiplier
  const effectiveCost = x.cost * getMultiplier(state, x.id, "cost");
  
  if (state.score < effectiveCost) return state;

  let score = state.score - effectiveCost;
  let increment = state.increment.map(obj => ({ ...obj }));

  // Unlock new tier only if previous tier's owned reaches 10
  if (
    increment.length < 10 &&
    i === increment.length - 1 &&
    (increment[i].owned + 1) >= 10
  ) {
    const tierNames = [
      "Whosit",
      "Whatsit",
      "Doohickey",
      "Gizmo",
      "Widget",
      "Contraption",
      "Gubbins",
      "Doodad",
      "Thingummy",
      "Thingamajig"
    ];
    const tierDescs = [
      "Unlocks mysterious powers.",
      "Does something even stranger.",
      "No one knows what this does.",
      "It spins! Or maybe it hums.",
      "Definitely useful for... something.",
      "A marvel of questionable engineering.",
      "Adds a dash of chaos.",
      "Looks important. Is it?",
      "The ultimate in incremental nonsense.",
      "You made it this far?!"
    ];
    const tier = increment.length % tierNames.length;
    
    // Each new tier: higher cost, higher rate
    const baseCost = increment[i].cost * 10;
    const baseRate = increment[i].rate * 2;
    const newTier = {
      id: `tier${increment.length + 1}`,
      cost: baseCost,
      owned: 0,
      rate: baseRate,
      name: tierNames[tier],
      desc: tierDescs[tier],
    };
    increment.push(newTier);

    // Add upgrades for new tier
    state.upgrades.push(...getUpgradesForTier(newTier.id, tierNames[tier], baseCost));
  }

  increment[i].cost = Math.floor(increment[i].cost * 1.2);
  increment[i].owned += 1;

  return {
    ...state,
    score,
    increment,
  };
}

/**
 * Handles tick update (auto-increment).
 */
export function handleTick(state) {
  if (!state?.increment) return state;

  // Each tier generates: owned * rate * multiplier per tick
  const totalGain = Math.floor(state.increment.reduce((sum, inc) => {
    if (!inc) return sum;
    const multiplier = getMultiplier(state, inc.id);
    return sum + (inc.owned || 0) * (inc.rate || 0) * multiplier;
  }, 0));

  return {
    ...state,
    score: Math.floor((state.score || 0) + totalGain),
  };
}