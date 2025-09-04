import React, { useState, useEffect, useCallback } from "react";
import "./linear.css"; // REQ-ISSUE-3: Styles might need adjustment
import "./layouts/layouts.css";

import {
  initializeGame,
  purchaseIncrementer as purchaseIncrementerLogic,
  applyUpgrade as applyUpgradeLogic,
  updateGameTick as updateGameTickLogic,
} from "./linearGameLogic.js";

import {
  getAllUpgradeDefinitions, // To pass to applyUpgradeLogic
  getAvailableUpgrades,     // To list upgrades for purchase
} from "./upgradeEngine.js";

import Incrementer from "../shared/Incrementer";
import UpgradeButton from "../shared/UpgradeButton";
import Tooltip from "../shared/Tooltip"; // Import Tooltip for use if needed directly here, or ensure Incrementer uses it

const allUpgradeDefs = getAllUpgradeDefinitions();

function LinearGame() {
  const [gameState, setGameState] = useState(() => initializeGame());

  const handlePurchaseIncrementer = useCallback((incrementerId) => {
    setGameState(prevGameState => purchaseIncrementerLogic({ ...prevGameState }, incrementerId));
  }, []);

  const handlePurchaseUpgrade = useCallback((upgradeId) => {
    setGameState(prevGameState => applyUpgradeLogic({ ...prevGameState }, upgradeId, allUpgradeDefs));
  }, []);

  const toggleShowPurchased = useCallback(() => {
    setGameState(prevGameState => ({
      ...prevGameState,
      settings: {
        ...prevGameState.settings,
        showPurchased: !prevGameState.settings.showPurchased,
      },
    }));
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prevGameState => updateGameTickLogic({ ...prevGameState }));
    }, 1000); 

    return () => clearInterval(gameLoop);
  }, []);

  const availableUpgradesToDisplay = getAvailableUpgrades(gameState);

  // REQ-ISSUE-8: Helper function for incrementer tooltip details
  const getIncrementerTooltipDetails = (incrementer) => {
    if (!incrementer) return null;
    // Ensure numbers are displayed nicely, toFixed(1) for multiplier/bonus if not whole.
    // linearGameLogic already floors most values, but raw bonus/multiplier might be decimal.
    const flatBonus = parseFloat(incrementer.upgrades.flatBonus).toFixed(1);
    const multiplier = parseFloat(incrementer.upgrades.multiplier).toFixed(2);

    return (
      <div className="incrementer-tooltip-details">
        <div><strong>{incrementer.name} Production Breakdown:</strong></div>
        <div>Base Value: {incrementer.baseValue}/sec</div>
        <div>Flat Bonus: +{flatBonus}/sec</div>
        <div>Multiplier: x{multiplier}</div>
        <div><strong>Final Value (per unit): {incrementer.individualProductionValue}/sec</strong></div>
        {incrementer.count > 0 && <div>Total from {incrementer.count} units: {incrementer.totalProductionFromType}/sec</div>}
      </div>
    );
  };

  return (
    <div className="game-linear layout-dashboard">
      <div className="dashboard-header">
        <h2>Linear Ticker</h2>
        <div className="dashboard-metrics">
          <div className="metric-card">
            <span className="metric-label">Total Score</span>
            <span className="metric-value">{gameState.score}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total Per Second</span>
            <span className="metric-value">{gameState.totalPerSecond}/sec</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Producers Owned</span>
            <span className="metric-value">
              {gameState.incrementers.reduce((sum, inc) => sum + inc.count, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-production">
          <h3>Incrementers</h3>
          <div className="tiers-grid dashboard-style">
            {gameState.incrementers.map((inc) => (
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
                // REQ-ISSUE-8: Pass tooltip content
                tooltipContent={getIncrementerTooltipDetails(inc)}
              />
            ))}
          </div>
        </div>

        <div className="dashboard-upgrades">
          <div className="upgrades-header">
            <h3>Upgrades</h3>
            <label className="show-purchased">
              <input
                type="checkbox"
                checked={gameState.settings.showPurchased}
                onChange={toggleShowPurchased}
              />
              Show Purchased
            </label>
          </div>
          <div className="upgrades-flex">
            {availableUpgradesToDisplay
              .filter(upgrade => gameState.settings.showPurchased || !gameState.purchasedUpgrades.includes(upgrade.id))
              .map((upgradeDefinition) => {
                const isPurchased = gameState.purchasedUpgrades.includes(upgradeDefinition.id);
                const currentUpgradeDef = { ...upgradeDefinition, purchased: isPurchased };

                const effect = currentUpgradeDef.effects[0];

                let currentProdCalc = 0;
                let newProdCalc = 0;
                let affectedTargetName = effect.targetId;

                if (effect.targetId !== 'GLOBAL') {
                  const targetInc = gameState.incrementers.find(inc => inc.id === effect.targetId);
                  if (targetInc) {
                    affectedTargetName = targetInc.name;
                    currentProdCalc = targetInc.individualProductionValue;

                    const baseValue = targetInc.baseValue;
                    let tempFlatBonus = targetInc.upgrades.flatBonus;
                    let tempMultiplier = targetInc.upgrades.multiplier;
                    const globalMultiplier = gameState.totalGlobalMultiplierEffect || 1;

                    if (effect.type === 'FLAT_BONUS') {
                      tempFlatBonus += effect.value;
                    } else if (effect.type === 'MULTIPLIER') {
                      tempMultiplier *= effect.value;
                    }
                    
                    const projectedBaseWithFlat = baseValue + tempFlatBonus;
                    newProdCalc = Math.floor(projectedBaseWithFlat * tempMultiplier * globalMultiplier);
                  }
                } else {
                  affectedTargetName = "All Incrementers";
                  currentProdCalc = 0;
                  newProdCalc = 0;
                }
                
                // Note: The effectDescription and upgradeTooltipContent variables below are not directly
                // used by the UpgradeButton component itself, as it has its own internal tooltip logic.
                // This logic is kept in case it's used for other display purposes within LinearGame.jsx.
                let effectDescriptionForDisplay = "";
                if (currentUpgradeDef.effects && currentUpgradeDef.effects.length > 0) {
                    const firstEffect = currentUpgradeDef.effects[0];
                    const effectValueDisplay = typeof firstEffect.value === 'number' ? firstEffect.value.toFixed(2) : firstEffect.value;
                    if (firstEffect.type === "FLAT_BONUS") {
                        effectDescriptionForDisplay = `+${effectValueDisplay} to ${firstEffect.targetId} base effectiveness.`;
                    } else if (firstEffect.type === "MULTIPLIER") {
                        effectDescriptionForDisplay = `x${effectValueDisplay} to ${firstEffect.targetId} output.`;
                    } else if (firstEffect.type === "GLOBAL_MULTIPLIER") {
                        effectDescriptionForDisplay = `x${effectValueDisplay} to all incrementers.`;
                    }
                }
                // const localTooltipContent = ( ... ); // This is not passed to UpgradeButton

                return (
                  <div key={currentUpgradeDef.id} className={`upgrade-card ${isPurchased ? 'purchased' : ''}`}>
                    <UpgradeButton
                      upgrade={currentUpgradeDef} // Now includes .purchased status
                      currentProduction={currentProdCalc}
                      newProduction={newProdCalc}
                      affectedName={affectedTargetName} // New prop for UpgradeButton
                      onPurchase={() => handlePurchaseUpgrade(currentUpgradeDef.id)}
                      disabled={gameState.score < currentUpgradeDef.cost || isPurchased}
                      // Removed non-standard props like 'isPurchased' (now part of 'upgrade' object)
                      // and 'tooltipContent' (UpgradeButton has its own).
                    />
                  </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinearGame;