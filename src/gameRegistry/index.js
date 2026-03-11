// src/gameRegistry/index.js
// Game registry — metadata, palette, lazy import, and unlock conditions.
// Each entry follows the shape defined in the design doc (Section 1).

const gameRegistry = [
  {
    id: 'clockwork',
    title: 'The Clockwork',
    blurb: 'Cascading dimensions feed each other. Watch an abstract machine accelerate.',
    loadComponent: () => import('../components/clockwork/ClockworkGame.jsx'),
    palette: {
      primary: '#00d4ff',
      secondary: '#4488cc',
      accent: '#00d4ff',
      background: '#0a0e1a',
      text: '#c8e8f8',
      surface: '#111827',
      shadow: 'rgba(0, 212, 255, 0.2)',
    },
    unlocks: {
      available: true,
      condition: null, // always available
    },
    metaContributions: {
      prestigeCurrencyPerReset: 10,
      achievementIds: ['cw-dim4', 'cw-infinity'],
    },
  },
  {
    id: 'exp',
    title: 'Exponential Incremental',
    blurb: 'Reach for the stars, one exponent at a time!',
    loadComponent: () => import('../components/exponential/ExponentialGame.jsx'),
    palette: {
      primary: '#4f8cff',
      secondary: '#6c7bff',
      accent: '#ffe66d',
      background: '#eef2ff',
      text: '#0b1b3c',
      surface: '#ffffff',
      shadow: 'rgba(79, 140, 255, 0.25)',
    },
    unlocks: {
      available: true,
      condition: null,
    },
    metaContributions: {
      prestigeCurrencyPerReset: 0,
      achievementIds: [],
    },
  },
  {
    id: 'lin',
    title: 'Linear Incremental',
    blurb: 'Slow and steady wins the race. Click your way to victory.',
    loadComponent: () => import('../components/linear/LinearGame.jsx'),
    palette: {
      primary: '#ffb347',
      secondary: '#ff6b6b',
      accent: '#4ecdc4',
      background: '#fff4e6',
      text: '#2d1e0f',
      surface: '#ffffff',
      shadow: 'rgba(255, 107, 107, 0.2)',
    },
    unlocks: {
      available: true,
      condition: null,
    },
    metaContributions: {
      prestigeCurrencyPerReset: 0,
      achievementIds: [],
    },
  },
];

// Returns games that should appear in the selector.
// In the future this will filter against globalState.unlockedGames for
// games with non-null unlock conditions.
export const getAvailableGames = () =>
  gameRegistry.filter((game) => game.unlocks?.available !== false);

export const getGameById = (gameId) =>
  gameRegistry.find((game) => game.id === gameId) ?? null;

export default gameRegistry;
