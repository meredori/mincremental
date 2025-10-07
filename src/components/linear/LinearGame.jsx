import React, { useState, useEffect, useCallback } from "react";
import "./linear.css";
import "./layouts/layouts.css";

import {
  initializeGame,
  rehydrateGameState,
  purchaseIncrementer as purchaseIncrementerLogic,
  applyUpgrade as applyUpgradeLogic,
  updateGameTick as updateGameTickLogic,
  castLight as castLightLogic,
} from "./linearGameLogic.js";

import {
  getAllUpgradeDefinitions,
  getAvailableUpgrades,
} from "./upgradeEngine.js";

import Incrementer from "../shared/Incrementer";
import UpgradeButton from "../shared/UpgradeButton";
import Tooltip from "../shared/Tooltip";
import { loadGameState, saveGameState } from "../../utils/saveSystem.js";

const allUpgradeDefs = getAllUpgradeDefinitions();
const LINEAR_GAME_ID = "linear";

function LinearGame() {
  const [gameState, setGameState] = useState(() => initializeGame());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedState = loadGameState(LINEAR_GAME_ID);
    if (savedState) {
      setGameState(rehydrateGameState(savedState));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    saveGameState(LINEAR_GAME_ID, gameState);
  }, [gameState, isHydrated]);

  const handleCastLight = useCallback(() => {
    setGameState((prevGameState) => castLightLogic({ ...prevGameState }));
  }, []);

  const handlePurchaseIncrementer = useCallback((incrementerId) => {
    setGameState((prevGameState) => purchaseIncrementerLogic({ ...prevGameState }, incrementerId));
  }, []);

  const handlePurchaseUpgrade = useCallback((upgradeId) => {
    setGameState((prevGameState) => applyUpgradeLogic({ ...prevGameState }, upgradeId, allUpgradeDefs));
  }, []);

  const toggleShowPurchased = useCallback(() => {
    setGameState((prevGameState) => ({
      ...prevGameState,
      settings: {
        ...prevGameState.settings,
        showPurchased: !prevGameState.settings.showPurchased,
      },
    }));
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState((prevGameState) => updateGameTickLogic({ ...prevGameState }));
    }, 1000);

    return () => clearInterval(gameLoop);
  }, []);

  const availableUpgradesToDisplay = getAvailableUpgrades(gameState);
  const manualLumensPerCast = gameState.metadata?.manualLumensPerCast ?? 1;
  const unlockedIncrementers = gameState.incrementers.filter((inc) => inc.isUnlocked);
  const lockedIncrementers = gameState.incrementers.filter((inc) => !inc.isUnlocked);

  const getIncrementerTooltipDetails = (incrementer) => {
    if (!incrementer) return null;

    return (
      <div className="incrementer-tooltip-details">
        <div className="tooltip-heading">{incrementer.name}</div>
        <p className="tooltip-lore">{incrementer.lore}</p>
        <div className="tooltip-stat">Base Flow: {incrementer.baseValue} lumens/sec</div>
        <div className="tooltip-stat">Flat Bonus: +{incrementer.upgrades.flatBonus}/sec</div>
        <div className="tooltip-stat">Multiplier: x{incrementer.upgrades.multiplier.toFixed(2)}</div>
        <div className="tooltip-stat highlight">Per Artisan: {incrementer.individualProductionValue}/sec</div>
        {incrementer.count > 0 && (
          <div className="tooltip-stat">Total Output: {incrementer.totalProductionFromType}/sec</div>
        )}
      </div>
    );
  };

  const renderUpgradeCard = (upgradeDefinition) => {
    const isPurchased = gameState.purchasedUpgrades.includes(upgradeDefinition.id);
    const effect = upgradeDefinition.effects[0];

    let affectedName = "All Artisans";
    let currentProduction = gameState.totalPerSecond;
    let projectedProduction = currentProduction;

    if (effect.targetId !== "GLOBAL") {
      const targetInc = gameState.incrementers.find((inc) => inc.id === effect.targetId);
      if (targetInc) {
        affectedName = targetInc.name;
        currentProduction = targetInc.totalProductionFromType;

        const simulatedInc = JSON.parse(JSON.stringify(targetInc));
        if (!simulatedInc.isUnlocked) {
          simulatedInc.isUnlocked = true;
        }

        if (effect.type === "FLAT_BONUS") {
          simulatedInc.upgrades.flatBonus += effect.value;
        } else if (effect.type === "MULTIPLIER") {
          simulatedInc.upgrades.multiplier = parseFloat(
            (simulatedInc.upgrades.multiplier * effect.value).toFixed(4)
          );
        } else if (effect.type === "SET_BASE_VALUE") {
          simulatedInc.baseValue = Math.floor(effect.value);
        }

        const perUnit = Math.floor(
          (Math.floor(simulatedInc.baseValue) + Math.floor(simulatedInc.upgrades.flatBonus)) *
            simulatedInc.upgrades.multiplier
        );
        projectedProduction = Math.floor(perUnit * simulatedInc.count);
      } else {
        currentProduction = 0;
        projectedProduction = 0;
      }
    } else if (effect.type === "GLOBAL_MULTIPLIER") {
      projectedProduction = Math.floor(gameState.totalPerSecond * effect.value);
    }

    return (
      <div key={upgradeDefinition.id} className={`upgrade-card ${isPurchased ? "purchased" : ""}`}>
        <UpgradeButton
          upgrade={{ ...upgradeDefinition, purchased: isPurchased }}
          currentProduction={currentProduction}
          newProduction={projectedProduction}
          affectedName={affectedName}
          onPurchase={() => handlePurchaseUpgrade(upgradeDefinition.id)}
          disabled={gameState.score < upgradeDefinition.cost || isPurchased}
        />
      </div>
    );
  };

  return (
    <div className="glimmerglass-experience layout-dashboard">
      <header className="glimmerglass-header">
        <div className="header-titles">
          <h2>Glimmerglass Workshop</h2>
          <p>Harvest sleeping light from the bay and refit it into gleaming lumenflow.</p>
        </div>
        <button className="cast-light" onClick={handleCastLight}>
          Cast Light (+{manualLumensPerCast})
        </button>
      </header>

      <section className="glimmerglass-metrics">
        <div className="metric-card">
          <span className="metric-label">Lumens Banked</span>
          <span className="metric-value">{gameState.score}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Lumenflow</span>
          <span className="metric-value">{gameState.totalPerSecond}/sec</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Lifetime Harvest</span>
          <span className="metric-value">{gameState.statistics?.lifetimeLumens ?? 0}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Artisans at Work</span>
          <span className="metric-value">
            {unlockedIncrementers.reduce((sum, inc) => sum + inc.count, 0)}
          </span>
        </div>
      </section>

      <div className="glimmerglass-body">
        <section className="glimmerglass-production">
          <div className="section-heading">
            <h3>Workshop Artisans</h3>
            <p>Your unlocked crews continue shaping lumens every second.</p>
          </div>
          <div className="tiers-grid">
            {unlockedIncrementers.map((inc) => (
              <Incrementer
                key={inc.id}
                id={inc.id}
                name={inc.name}
                description={inc.description}
                count={inc.count}
                currentCost={inc.currentCost}
                individualProductionValue={inc.individualProductionValue}
                totalProductionFromType={inc.totalProductionFromType}
                onPurchase={handlePurchaseIncrementer}
                score={gameState.score}
                tooltipContent={getIncrementerTooltipDetails(inc)}
              />
            ))}
            {unlockedIncrementers.length === 0 && (
              <div className="empty-state">
                Cast light to awaken your first Spark Gatherers.
              </div>
            )}
          </div>

          {lockedIncrementers.length > 0 && (
            <div className="locked-tiers">
              <h4>Awaiting Their Moment</h4>
              <div className="locked-grid">
                {lockedIncrementers.map((inc) => (
                  <Tooltip
                    key={inc.id}
                    content={
                      <div className="locked-tooltip">
                        <strong>{inc.name}</strong>
                        <p>{inc.lore}</p>
                      </div>
                    }
                  >
                    <div className="locked-card">
                      <div className="locked-name">{inc.name}</div>
                      <p className="locked-description">{inc.description}</p>
                      <p className="locked-threshold">
                        Unlocks at {inc.unlockThreshold} lifetime lumens
                      </p>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="glimmerglass-upgrades">
          <div className="upgrades-header">
            <div>
              <h3>Workshop Milestones</h3>
              <p>Invest lumens to refine your artisans and forge brighter processes.</p>
            </div>
            <label className="show-purchased">
              <input
                type="checkbox"
                checked={gameState.settings.showPurchased}
                onChange={toggleShowPurchased}
              />
              Show Claimed
            </label>
          </div>
          <div className="upgrades-flex">
            {availableUpgradesToDisplay
              .filter(
                (upgrade) =>
                  gameState.settings.showPurchased || !gameState.purchasedUpgrades.includes(upgrade.id)
              )
              .map(renderUpgradeCard)}
            {availableUpgradesToDisplay.length === 0 && (
              <div className="empty-state">No workshop breakthroughs available yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default LinearGame;
