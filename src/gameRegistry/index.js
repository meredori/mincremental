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
      "text-muted": "#4f5d75",
      "text-strong": "#08132b",
      surface: "#ffffff",
      shadow: "rgba(79, 140, 255, 0.25)",
    },
    unlocks: {
      available: true,
    },
  },
  {
    id: "lin",
    title: "Glimmerglass Workshop",
    blurb: "Reawaken the harbor's lightworks and bend the bay's glow to your will.",
    loadComponent: () => import("../components/linear/LinearGame.jsx"),
    palette: {
      primary: "#6ad1ff",
      secondary: "#c7a3ff",
      accent: "#ffe87b",
      background: "#0f1b33",
      text: "#e2f4ff",
      "text-muted": "#a9c7ff",
      "text-strong": "#0b1b3c",
      surface: "#15243f",
      shadow: "rgba(106, 209, 255, 0.25)",
    },
    unlocks: {
      available: true,
    },
  },
];

export const getAvailableGames = () => gameRegistry.filter((game) => game.unlocks?.available !== false);

export const getGameById = (gameId) => gameRegistry.find((game) => game.id === gameId) || null;

export default gameRegistry;
