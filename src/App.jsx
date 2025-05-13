// src/App.jsx
import React, { useState, useCallback } from "react";
import GlobalHeader from "./components/global/GlobalHeader.jsx";
import GameSelector from "./components/gameselector/GameSelector.jsx";
import GlobalFooter from "./components/global/GlobalFooter.jsx";
import ExponentialIncrementalUI from "./components/exponential/exponentialIncrementalUI.jsx";
import LinearIncrementalUI from "./components/linear/linearIncrementalUI.jsx";
import './App.css'; // Optional: for global app styles
import './styles/exponential.css'; // Exponential game styles

// Example data (replace with real data/integration)
const initialUser = { avatarUrl: "", username: "Guest", level: null };
const initialGames = [
  { id: "exp", name: "Exponential Incremental", description: "Reach for the stars, one exponent at a time!", imageUrl: "https://via.placeholder.com/250x150/4f8cff/FFFFFF?text=EXP+Game", accentColor: "#4f8cff" },
  { id: "lin", name: "Linear Incremental", description: "Slow and steady wins the race. Click your way to victory.", imageUrl: "https://via.placeholder.com/250x150/ffb347/FFFFFF?text=LIN+Game", accentColor: "#ffb347" },
  { id: "cosmic", name: "Cosmic Racer X", description: "Race through asteroid fields and nebulae.", imageUrl: "https://via.placeholder.com/250x150/FF00FF/0D0D0D?text=Cosmic+Racer", accentColor: "#FF00FF" },
  { id: "pixel", name: "Pixel Dungeon Quest", description: "Explore dangerous dungeons in glorious pixel art.", imageUrl: "https://via.placeholder.com/250x150/00FFFF/0D0D0D?text=Pixel+Dungeon", accentColor: "#00FFFF" },
];

function App() {
  const [user] = useState(initialUser);
  const [games] = useState(initialGames);
  const [currentView, setCurrentView] = useState("selector"); // 'selector' or 'game'
  const [selectedGameId, setSelectedGameId] = useState(null);

  const handleSelectGame = useCallback((gameId) => {
    setSelectedGameId(gameId);
    setCurrentView("game");
  }, []);

  const handleGoBackToSelector = useCallback(() => {
    setSelectedGameId(null);
    setCurrentView("selector");
  }, []);

  // Helper to render the correct game component
  const renderGame = () => {
    if (selectedGameId === "exp") {
      return <ExponentialIncrementalUI />;
    } else if (selectedGameId === "lin") {
      return <LinearIncrementalUI />;
    } else {
      return (
        <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 200px)' }}>
          <h2>Game not found</h2>
          <button onClick={handleGoBackToSelector} style={{ padding: '10px 20px', fontSize: '1em', cursor: 'pointer' }}>
            Back to Game Selector
          </button>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      <GlobalHeader
        user={user}
        onBack={currentView === 'game' ? handleGoBackToSelector : () => {}}
        showBackButton={currentView === 'game'}
      />
      <main className="app-main-content">
        {currentView === "selector" ? (
          <GameSelector
            games={games}
            onSelect={handleSelectGame}
          />
        ) : (
          renderGame()
        )}
      </main>
      <GlobalFooter
        version="1.0.1"
        links={[
          { label: "GitHub", href: "https://github.com/" },
          { label: "Docs", href: "#" },
          { label: "Support", href: "#support" }
        ]}
      />
    </div>
  );
}

export default App;