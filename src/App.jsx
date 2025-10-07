// src/App.jsx
import React, { useState, useCallback, useMemo, lazy, Suspense } from "react";
import GlobalHeader from "./components/global/GlobalHeader.jsx";
import GameSelector from "./components/gameselector/GameSelector.jsx";
import GlobalFooter from "./components/global/GlobalFooter.jsx";
import ThemeProvider from "./components/global/ThemeProvider.jsx";
import { APP_VERSION } from "./version.js";
import { getAvailableGames, getGameById } from "./gameRegistry/index.js";
import "./App.css";

const initialUser = { avatarUrl: "", username: "Guest", level: null };

function App() {
  const [user] = useState(initialUser);
  const games = useMemo(() => getAvailableGames(), []);
  const [currentView, setCurrentView] = useState("selector");
  const [selectedGameId, setSelectedGameId] = useState(null);

  const handleSelectGame = useCallback((gameId) => {
    setSelectedGameId(gameId);
    setCurrentView("game");
  }, []);

  const handleGoBackToSelector = useCallback(() => {
    setSelectedGameId(null);
    setCurrentView("selector");
  }, []);

  const selectedGame = useMemo(() => {
    if (!selectedGameId) {
      return null;
    }
    return getGameById(selectedGameId);
  }, [selectedGameId]);

  const ActiveGameComponent = useMemo(() => {
    if (!selectedGame) {
      return null;
    }
    return lazy(selectedGame.loadComponent);
  }, [selectedGame]);

  return (
    <ThemeProvider palette={selectedGame?.palette}>
      <div className="app-container">
        <GlobalHeader
          user={user}
          onBack={currentView === "game" ? handleGoBackToSelector : () => {}}
          showBackButton={currentView === "game"}
        />
        <main className="app-main-content">
          {currentView === "selector" ? (
            <GameSelector
              games={games}
              onSelect={handleSelectGame}
            />
          ) : selectedGame && ActiveGameComponent ? (
            <Suspense fallback={<div className="game-loading">Loading game...</div>}>
              <ActiveGameComponent />
            </Suspense>
          ) : (
            <div className="game-not-found">
              <h2>Game not found</h2>
              <button onClick={handleGoBackToSelector} className="back-button">
                Back to Game Selector
              </button>
            </div>
          )}
        </main>
        <GlobalFooter
          version={APP_VERSION}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
