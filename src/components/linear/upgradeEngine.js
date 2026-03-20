// src/components/linear/upgradeEngine.js

function safeNumber(val, fallback = 0, floorOutput = true) {
  if (typeof val !== "number" || !isFinite(val) || isNaN(val)) {
    return floorOutput ? Math.floor(fallback) : fallback;
  }
  const result = val < 0 ? fallback : val;
  return floorOutput ? Math.floor(result) : result;
}

export const allUpgradeDefinitions = {
  spark_polish_brigade: {
    id: "spark_polish_brigade",
    name: "Lantern Polish Brigade",
    description: "Apprentices buff every gatherer's mirrors, adding +1 lumen per Spark Gatherer.",
    cost: safeNumber(45),
    effects: [{ targetId: "spark_gatherer", type: "FLAT_BONUS", value: 1 }],
    tier: 1,
    unlockConditions: { incrementerCount: { id: "spark_gatherer", count: 5 } },
  },
  spark_clockwork_sync: {
    id: "spark_clockwork_sync",
    name: "Clockwork Synchronizers",
    description: "Tiny gears keep gatherers in rhythm, multiplying their output by 15%.",
    cost: safeNumber(120),
    effects: [{ targetId: "spark_gatherer", type: "MULTIPLIER", value: 1.15 }],
    tier: 1,
    unlockConditions: { lifetimeLumens: 180 },
  },
  prism_facet_calibration: {
    id: "prism_facet_calibration",
    name: "Facet Calibration",
    description: "Prism Grinders receive calibrated guides, granting +3 lumens each.",
    cost: safeNumber(280),
    effects: [{ targetId: "prism_grinder", type: "FLAT_BONUS", value: 3 }],
    tier: 2,
    unlockConditions: { incrementerCount: { id: "prism_grinder", count: 3 } },
  },
  prism_phase_harmonics: {
    id: "prism_phase_harmonics",
    name: "Phase Harmonics",
    description: "Resonant chords align every prism, boosting grinders by 12%.",
    cost: safeNumber(520),
    effects: [{ targetId: "prism_grinder", type: "MULTIPLIER", value: 1.12 }],
    tier: 2,
    unlockConditions: { lifetimeLumens: 650 },
  },
  beam_seamstresses: {
    id: "beam_seamstresses",
    name: "Beam Seamstresses",
    description: "Splicers learn to stitch brighter seams, adding +6 lumens each.",
    cost: safeNumber(1500),
    effects: [{ targetId: "beam_splicer", type: "FLAT_BONUS", value: 6 }],
    tier: 3,
    unlockConditions: { incrementerCount: { id: "beam_splicer", count: 2 } },
  },
  aurora_flux_capacitor: {
    id: "aurora_flux_capacitor",
    name: "Aurora Flux Capacitor",
    description: "Forge channels stabilized to surge 10% brighter.",
    cost: safeNumber(4200),
    effects: [{ targetId: "aurora_forge", type: "MULTIPLIER", value: 1.1 }],
    tier: 4,
    unlockConditions: { lifetimeLumens: 2800 },
  },
  dawn_projector_magnifier: {
    id: "dawn_projector_magnifier",
    name: "Dawn Magnifiers",
    description: "Lens arrays add +24 lumens to every Dawn Projector.",
    cost: safeNumber(9800),
    effects: [{ targetId: "dawn_projector", type: "FLAT_BONUS", value: 24 }],
    tier: 5,
    unlockConditions: { lifetimeLumens: 7200 },
  },
  solstice_core_tempering: {
    id: "solstice_core_tempering",
    name: "Solstice Core Tempering",
    description: "Master smiths temper the engines, multiplying their yield by 8%.",
    cost: safeNumber(26500),
    effects: [{ targetId: "solstice_engine", type: "MULTIPLIER", value: 1.08 }],
    tier: 6,
    unlockConditions: { lifetimeLumens: 15500 },
  },
  workshop_consortium: {
    id: "workshop_consortium",
    name: "Luminous Consortium",
    description: "Guildmasters share schematics, raising all production by 5%.",
    cost: safeNumber(1800),
    effects: [{ targetId: "GLOBAL", type: "GLOBAL_MULTIPLIER", value: 1.05 }],
    tier: 0,
    unlockConditions: { lifetimeLumens: 1200 },
  },
  celestial_infusion: {
    id: "celestial_infusion",
    name: "Celestial Infusion",
    description: "A midnight ceremony infuses every station, granting another 7% to all output.",
    cost: safeNumber(7600),
    effects: [{ targetId: "GLOBAL", type: "GLOBAL_MULTIPLIER", value: 1.07 }],
    tier: 0,
    unlockConditions: { purchasedUpgrades: ["workshop_consortium"], lifetimeLumens: 5200 },
  },
};

export function getUpgradeDefinition(upgradeId) {
  if (allUpgradeDefinitions[upgradeId]) {
    return JSON.parse(JSON.stringify(allUpgradeDefinitions[upgradeId]));
  }
  return undefined;
}

export function getAllUpgradeDefinitions() {
  return JSON.parse(JSON.stringify(allUpgradeDefinitions));
}

export function getAvailableUpgrades(gameState) {
  const available = [];
  for (const id in allUpgradeDefinitions) {
    const definition = allUpgradeDefinitions[id];
    if (gameState.purchasedUpgrades && gameState.purchasedUpgrades.includes(id)) {
      if (gameState.settings?.showPurchased) {
        available.push({ ...definition, isAffordable: false });
      }
      continue;
    }

    let unlocked = true;
    if (definition.unlockConditions) {
      unlocked = checkUnlockConditions(definition.unlockConditions, gameState);
    }

    if (unlocked) {
      const displayDefinition = JSON.parse(JSON.stringify(definition));
      displayDefinition.isAffordable = gameState.score >= safeNumber(displayDefinition.cost);
      available.push(displayDefinition);
    }
  }
  return available;
}

function checkUnlockConditions(conditions, gameState) {
  if (!conditions) return true;

  if (conditions.score && safeNumber(gameState.score) < conditions.score) {
    return false;
  }

  if (
    conditions.lifetimeLumens &&
    safeNumber(gameState.statistics?.lifetimeLumens ?? gameState.score) < conditions.lifetimeLumens
  ) {
    return false;
  }

  if (conditions.purchasedUpgrades) {
    const purchased = new Set(gameState.purchasedUpgrades || []);
    if (!conditions.purchasedUpgrades.every((id) => purchased.has(id))) {
      return false;
    }
  }

  if (conditions.incrementerCount) {
    const { id, count } = conditions.incrementerCount;
    const incrementer = gameState.incrementers?.find((inc) => inc.id === id);
    if (!incrementer || safeNumber(incrementer.count) < count) {
      return false;
    }
  }

  return true;
}
