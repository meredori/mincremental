// src/store/globalStore.js
// Zustand store for cross-game meta-progression state.
// Per the design doc: global state lives at mincremental:global.
// ascensionRank is DERIVED (not stored) — always computed from prestigeCounts.

import { create } from 'zustand';
import { loadGlobalState, saveGlobalState } from '../utils/saveSystem.js';

export const INITIAL_GLOBAL_STATE = {
  echoes: 0,
  totalEchoesEarned: 0,
  achievements: [],        // array of earned achievement ids
  prestigeCounts: {},      // { gameId: count } — authoritative prestige record
  echoShopPurchases: [],   // array of purchased shop item ids
  unlockedGames: ['clockwork'],
  version: 1,
};

// Derived: never stored, always computed
export const deriveAscensionRank = (state) =>
  Object.values(state.prestigeCounts).reduce((sum, n) => sum + n, 0);

// Echo multiplier from shop purchases
const getEchoMultiplier = (echoShopPurchases) =>
  echoShopPurchases.includes('echoing-legacy') ? 1.25 : 1.0;

const useGlobalStore = create((set, get) => ({
  ...INITIAL_GLOBAL_STATE,

  // Hydrate from localStorage — call once on app mount
  loadFromSave: () => {
    const saved = loadGlobalState();
    if (saved && saved.version === INITIAL_GLOBAL_STATE.version) {
      set({ ...INITIAL_GLOBAL_STATE, ...saved });
    }
  },

  // Idempotent: silently skips if achievement already earned
  awardAchievement: (id) => {
    const { achievements } = get();
    if (achievements.includes(id)) return;
    const next = { achievements: [...achievements, id] };
    set(next);
    saveGlobalState({ ...get(), ...next });
  },

  // Records prestige for a game and awards scaled Echoes
  prestige: (gameId, baseEchoValue) => {
    const state = get();
    const multiplier = getEchoMultiplier(state.echoShopPurchases);
    const earned = Math.floor(baseEchoValue * multiplier);
    const next = {
      prestigeCounts: {
        ...state.prestigeCounts,
        [gameId]: (state.prestigeCounts[gameId] || 0) + 1,
      },
      echoes: state.echoes + earned,
      totalEchoesEarned: state.totalEchoesEarned + earned,
    };
    set(next);
    saveGlobalState({ ...state, ...next });
  },

  // Returns false if cannot afford or already purchased
  purchaseEchoShopItem: (itemId, cost) => {
    const state = get();
    if (state.echoes < cost) return false;
    if (state.echoShopPurchases.includes(itemId)) return false;
    const next = {
      echoes: state.echoes - cost,
      echoShopPurchases: [...state.echoShopPurchases, itemId],
    };
    set(next);
    saveGlobalState({ ...state, ...next });
    return true;
  },

  // Unlock a game by id (no-op if already unlocked)
  unlockGame: (gameId) => {
    const { unlockedGames } = get();
    if (unlockedGames.includes(gameId)) return;
    const next = { unlockedGames: [...unlockedGames, gameId] };
    set(next);
    saveGlobalState({ ...get(), ...next });
  },

  // TEST ONLY — reset to initial state without touching localStorage
  _resetForTesting: () => set({ ...INITIAL_GLOBAL_STATE }),
}));

export default useGlobalStore;
