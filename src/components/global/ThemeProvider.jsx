import { useEffect, useMemo } from "react";

const DEFAULT_PALETTE = {
  primary: "#ff6b6b",
  secondary: "#4ecdc4",
  accent: "#ffe66d",
  background: "#fff5f7",
  text: "#2d3436",
  "text-muted": "#59677d",
  "text-strong": "#1a2233",
  surface: "#ffffff",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const THEME_PREFIX = "--color-";

function ThemeProvider({ palette, children }) {
  const activePalette = useMemo(() => ({
    ...DEFAULT_PALETTE,
    ...(palette || {}),
  }), [palette]);

  useEffect(() => {
    const root = document.documentElement;

    Object.entries(activePalette).forEach(([token, value]) => {
      root.style.setProperty(`${THEME_PREFIX}${token}`, value);
    });

    return () => {
      Object.keys(activePalette).forEach((token) => {
        root.style.removeProperty(`${THEME_PREFIX}${token}`);
      });
    };
  }, [activePalette]);

  return children;
}

export default ThemeProvider;
