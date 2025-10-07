const gameRegistry = [
  {
    id: "exp",
    title: "Exponential Incremental",
    blurb: "Reach for the stars, one exponent at a time!",
    loadComponent: () => import("../components/exponential/ExponentialGame.jsx"),
    palette: {
      primary: "#4f8cff",
      secondary: "#6c7bff",
      accent: "#ffe66d",
      background: "#eef2ff",
      text: "#0b1b3c",
      surface: "#ffffff",
      shadow: "rgba(79, 140, 255, 0.25)",
    },
    unlocks: {
      available: true,
    },
  },
  {
    id: "lin",
    title: "Linear Incremental",
    blurb: "Slow and steady wins the race. Click your way to victory.",
    loadComponent: () => import("../components/linear/LinearGame.jsx"),
    palette: {
      primary: "#ffb347",
      secondary: "#ff6b6b",
      accent: "#4ecdc4",
      background: "#fff4e6",
      text: "#2d1e0f",
      surface: "#ffffff",
      shadow: "rgba(255, 107, 107, 0.2)",
    },
    unlocks: {
      available: true,
    },
  },
];

export const getAvailableGames = () => gameRegistry.filter((game) => game.unlocks?.available !== false);

export const getGameById = (gameId) => gameRegistry.find((game) => game.id === gameId) || null;

export default gameRegistry;
