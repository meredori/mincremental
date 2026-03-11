// src/meta/echoShop.js
// Echo Shop item definitions. Effects here describe intent; actual application
// is handled by getMetaBonuses / applyEchoShopBonuses or per-game logic.

export const ECHO_SHOP_ITEMS = [
  {
    id: 'head-start',
    name: 'Head Start',
    description: 'All games begin with 10% of first-tier resources already owned.',
    cost: 5,
    repeatable: false,
    effect: { type: 'STARTING_RESOURCE', value: 0.1 },
  },
  {
    id: 'resilient',
    name: 'Resilient',
    description: 'Offline progress calculated up to 4 hours instead of 1.',
    cost: 15,
    repeatable: false,
    effect: { type: 'OFFLINE_DURATION', value: 4 },
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Each game you have prestiged gives all other games +2% production.',
    cost: 25,
    repeatable: false,
    effect: { type: 'POLYMATH_BONUS', value: 0.02 },
  },
  {
    id: 'echoing-legacy',
    name: 'Echoing Legacy',
    description: 'Prestige earns 25% more Echoes globally.',
    cost: 50,
    repeatable: false,
    effect: { type: 'ECHO_MULTIPLIER', value: 1.25 },
  },
  {
    id: 'quick-study',
    name: 'Quick Study',
    description: 'Upgrade unlock conditions require 20% less progress.',
    cost: 30,
    repeatable: false,
    effect: { type: 'UNLOCK_THRESHOLD', value: 0.8 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: "All games start with their first upgrade pre-purchased.",
    cost: 100,
    repeatable: false,
    effect: { type: 'UNLOCK_UPGRADE', value: 'first' },
  },
];

export const getEchoShopItemById = (id) =>
  ECHO_SHOP_ITEMS.find((item) => item.id === id) ?? null;

export const isItemPurchased = (itemId, echoShopPurchases) =>
  echoShopPurchases.includes(itemId);

export const canAffordItem = (item, echoes, echoShopPurchases) => {
  if (!item.repeatable && isItemPurchased(item.id, echoShopPurchases)) return false;
  return echoes >= item.cost;
};
