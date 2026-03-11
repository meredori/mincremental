// src/meta/metaBonuses.js
// Aggregates achievement bonuses targeting a specific game.
// Called by each game on init: getMetaBonuses(gameId, globalState.achievements)

import { ACHIEVEMENTS, BONUS_TYPES } from './achievements.js';

export const DEFAULT_META_BONUSES = {
  productionMultiplier: 1.0,
  costReduction: 0.0,       // 0.0 = no reduction, 0.5 = 50% off
  startingResources: 0,
  offlineMultiplier: 1.0,
  extraPrestigeCurrency: 0.0,
  tickRateBonus: 0.0,
  unlockedUpgrades: [],     // upgrade ids unlocked by achievements
};

/**
 * Returns an aggregated bonus object for the given game.
 * @param {string} gameId - The canonical game id (e.g. 'clockwork')
 * @param {string[]} earnedAchievementIds - Array of earned achievement ids from global state
 * @returns {object} Aggregated bonuses (never mutates DEFAULT_META_BONUSES)
 */
export function getMetaBonuses(gameId, earnedAchievementIds = []) {
  const bonuses = {
    ...DEFAULT_META_BONUSES,
    unlockedUpgrades: [],
  };

  for (const id of earnedAchievementIds) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (!achievement) continue;

    // Only apply if this achievement targets the requested game or all games
    if (achievement.bonusTarget !== gameId && achievement.bonusTarget !== 'all') continue;

    const { type, value } = achievement.bonus;

    switch (type) {
      case BONUS_TYPES.PRODUCTION_MULTIPLIER:
        bonuses.productionMultiplier *= value;
        break;
      case BONUS_TYPES.COST_REDUCTION:
        bonuses.costReduction = Math.min(bonuses.costReduction + value, 0.9); // cap at 90%
        break;
      case BONUS_TYPES.STARTING_RESOURCE:
        bonuses.startingResources += value;
        break;
      case BONUS_TYPES.OFFLINE_MULTIPLIER:
        bonuses.offlineMultiplier *= value;
        break;
      case BONUS_TYPES.EXTRA_PRESTIGE_CURRENCY:
        bonuses.extraPrestigeCurrency += value;
        break;
      case BONUS_TYPES.TICK_RATE_BONUS:
        bonuses.tickRateBonus += value;
        break;
      case BONUS_TYPES.UNLOCK_UPGRADE:
        if (!bonuses.unlockedUpgrades.includes(value)) {
          bonuses.unlockedUpgrades = [...bonuses.unlockedUpgrades, value];
        }
        break;
      default:
        break;
    }
  }

  return bonuses;
}

/**
 * Applies Echo Shop purchases that have a production effect.
 * 'polymath' gives +2% per prestiged game for all other games.
 * @param {object} baseBonuses - Output of getMetaBonuses
 * @param {string} gameId
 * @param {object} globalState - Full global state (for prestigeCounts and echoShopPurchases)
 * @returns {object} Bonuses with Echo Shop effects applied
 */
export function applyEchoShopBonuses(baseBonuses, gameId, globalState) {
  const { echoShopPurchases = [], prestigeCounts = {} } = globalState;
  let productionMultiplier = baseBonuses.productionMultiplier;

  if (echoShopPurchases.includes('polymath')) {
    // +2% per game the player has prestiged (excluding current game)
    const prestigedOtherGames = Object.entries(prestigeCounts).filter(
      ([id, count]) => id !== gameId && count > 0,
    ).length;
    productionMultiplier *= 1 + prestigedOtherGames * 0.02;
  }

  return { ...baseBonuses, productionMultiplier };
}
