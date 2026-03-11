// src/components/clockwork/ClockworkGame.jsx
// The Clockwork — cascading dimension idle game (PoC).
// Reads meta bonuses from the global store on init and after prestige.
// Dispatches prestige and achievement events to the global store.

import React, { useState, useEffect, useCallback } from 'react';
import useGlobalStore from '../../store/globalStore.js';
import { getMetaBonuses, applyEchoShopBonuses } from '../../meta/metaBonuses.js';
import {
  initGame,
  gameTick,
  purchaseDimension,
  performPrestige,
  canPrestige,
  getPointsPerSecond,
  formatNumber,
  INFINITY_THRESHOLD,
  DIMENSION_CONFIGS,
} from './clockworkLogic.js';
import { loadGameState, saveGameState } from '../../utils/saveSystem.js';
import './clockwork.css';

const GAME_ID = 'clockwork';
const TICK_MS = 1000;

// Achievement trigger ids emitted by this game
const ACHIEVEMENT_FIRST_PRESTIGE = 'cw-infinity';

// Required top-level fields on a saved Clockwork state object
const REQUIRED_SAVE_KEYS = ['points', 'infinityCount', 'infinityMultiplier', 'dimensions'];
// Required fields on each dimension entry
const REQUIRED_DIM_KEYS = ['id', 'count', 'purchased', 'baseCost', 'baseProduction'];
const EXPECTED_DIM_IDS = DIMENSION_CONFIGS.map((c) => c.id);

function isFiniteNumber(v) {
  return typeof v === 'number' && isFinite(v) && !isNaN(v);
}

function isValidDimension(dim, expectedId) {
  return (
    dim &&
    typeof dim === 'object' &&
    REQUIRED_DIM_KEYS.every((k) => k in dim) &&
    dim.id === expectedId &&
    isFiniteNumber(dim.count) &&
    isFiniteNumber(dim.purchased) &&
    isFiniteNumber(dim.baseCost) &&
    isFiniteNumber(dim.baseProduction)
  );
}

function isValidSave(saved) {
  return (
    saved &&
    typeof saved === 'object' &&
    REQUIRED_SAVE_KEYS.every((k) => k in saved) &&
    isFiniteNumber(saved.points) &&
    isFiniteNumber(saved.infinityCount) &&
    Array.isArray(saved.dimensions) &&
    saved.dimensions.length === DIMENSION_CONFIGS.length &&
    saved.dimensions.every((dim, i) => isValidDimension(dim, EXPECTED_DIM_IDS[i]))
  );
}

function buildMetaBonuses(globalState) {
  const base = getMetaBonuses(GAME_ID, globalState.achievements);
  return applyEchoShopBonuses(base, GAME_ID, globalState);
}

function ClockworkGame() {
  const awardAchievement = useGlobalStore((s) => s.awardAchievement);
  const prestigeGlobal = useGlobalStore((s) => s.prestige);

  // Initialise with meta bonuses and any saved local state
  const [gameState, setGameState] = useState(() => {
    const metaBonuses = buildMetaBonuses(useGlobalStore.getState());
    const saved = loadGameState(GAME_ID);
    if (isValidSave(saved)) {
      return {
        ...saved,
        metaProductionMultiplier: metaBonuses.productionMultiplier,
      };
    }
    return initGame(metaBonuses, 0);
  });

  const [hydrated, setHydrated] = useState(false);

  // Hydration guard — prevent saving on first render
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Persist local state on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveGameState(GAME_ID, gameState);
  }, [gameState, hydrated]);

  // Game tick loop
  useEffect(() => {
    const id = setInterval(() => {
      setGameState((prev) => gameTick(prev));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const handleBuyDimension = useCallback((dimId) => {
    setGameState((prev) => purchaseDimension(prev, dimId));
  }, []);

  const handlePrestige = useCallback(() => {
    if (!canPrestige(gameState)) return;

    // Build fresh meta bonuses for the new run
    const freshGlobal = useGlobalStore.getState();
    const metaBonuses = buildMetaBonuses(freshGlobal);

    const { newState, echoValue } = performPrestige(gameState, metaBonuses);

    // Scale echo payout by achievement-based extra prestige currency bonus.
    // echoing-legacy shop multiplier is applied inside the global store prestige action.
    const adjustedEchoValue = Math.max(
      1,
      Math.floor(echoValue * (1 + metaBonuses.extraPrestigeCurrency)),
    );

    prestigeGlobal(GAME_ID, adjustedEchoValue);

    // Award first-prestige achievement if this is the first Infinity
    if (gameState.infinityCount === 0) {
      awardAchievement(ACHIEVEMENT_FIRST_PRESTIGE);
    }

    setGameState(newState);
  }, [gameState, prestigeGlobal, awardAchievement]);

  const pps = getPointsPerSecond(gameState);
  const prestigeReady = canPrestige(gameState);

  return (
    <div className="clockwork-game">
      <h2 className="clockwork-title">⚙ The Clockwork</h2>

      {/* Score panel */}
      <div className="clockwork-score-panel">
        <span className="clockwork-score-value">{formatNumber(gameState.points)}</span>
        <span className="clockwork-score-label">Points</span>
        <span className="clockwork-pps">+{formatNumber(pps)} / sec</span>
      </div>

      {/* Infinity prestige */}
      <div className="clockwork-prestige-row">
        <button
          className="clockwork-infinity-btn cartoon-button"
          disabled={!prestigeReady}
          onClick={handlePrestige}
        >
          ∞ Infinity
        </button>
        <span className="clockwork-infinity-info">
          {prestigeReady
            ? `Ready! Resets dimensions · Earns Echoes · ×${(gameState.infinityMultiplier + 0.5).toFixed(1)} next run`
            : `Need ${formatNumber(INFINITY_THRESHOLD)} pts · ${formatNumber(INFINITY_THRESHOLD - gameState.points)} remaining`}
        </span>
      </div>

      {/* Dimension cards */}
      <div className="clockwork-dimensions">
        {gameState.dimensions.map((dim, i) => {
          const affordable = gameState.points >= dim.currentCost;
          const producesLabel =
            i === 0
              ? `Produces ${formatNumber(dim.baseProduction)} pt/sec each`
              : `Generates ${formatNumber(dim.baseProduction)} Dim ${i} /sec each`;

          return (
            <div key={dim.id} className="clockwork-dim-card">
              <div className="clockwork-dim-info">
                <span className="clockwork-dim-name">{dim.name}</span>
                <span className="clockwork-dim-subtext">{producesLabel}</span>
              </div>
              <span className="clockwork-dim-count">
                {formatNumber(dim.count)}
                {dim.purchased > 0 && (
                  <span style={{ fontSize: '0.75em', opacity: 0.6 }}> ({dim.purchased} bought)</span>
                )}
              </span>
              <div className="clockwork-dim-buy">
                <button
                  className="cartoon-button"
                  disabled={!affordable}
                  onClick={() => handleBuyDimension(dim.id)}
                  style={{ width: '100%' }}
                >
                  Buy · {formatNumber(dim.currentCost)} pts
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta info strip */}
      <div className="clockwork-meta-strip">
        <span>∞ Multiplier: ×{gameState.infinityMultiplier.toFixed(1)}</span>
        <span>Meta bonus: ×{gameState.metaProductionMultiplier.toFixed(2)}</span>
        <span>Infinities: {gameState.infinityCount}</span>
      </div>
    </div>
  );
}

export default ClockworkGame;
