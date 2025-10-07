const STORAGE_PREFIX = "mincremental";

const getStorageKey = (gameId) => `${STORAGE_PREFIX}:${gameId}`;

export const loadGameState = (gameId, fallback = null) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(gameId));
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to load game state", gameId, error);
    return fallback;
  }
};

export const saveGameState = (gameId, state) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(gameId), JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save game state", gameId, error);
  }
};

export const resetGameState = (gameId) => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(gameId));
  } catch (error) {
    console.warn("Failed to reset game state", gameId, error);
  }
};
