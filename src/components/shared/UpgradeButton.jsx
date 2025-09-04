// src/components/shared/UpgradeButton.jsx
import React from "react";
import Tooltip from "./Tooltip"; // Assuming Tooltip component is flexible
import "./upgrade.css";

// Props:
// - upgrade: The upgrade object, including { id, name, description, cost, effects, purchased (boolean) }
// - currentProduction: (Number) Current production of the affected incrementer/global.
// - newProduction: (Number) Projected production if this upgrade is purchased.
// - affectedName: (String) Name of the incrementer affected, or "All Incrementers".
// - onPurchase: function(upgradeId)
// - disabled: boolean (typically calculated based on cost and purchased status by parent)

const UpgradeButton = ({
  upgrade, // Includes .purchased status
  currentProduction,
  newProduction,
  affectedName, // New prop
  onPurchase,
  disabled, // Parent should manage this based on cost and upgrade.purchased
}) => {
  if (!upgrade || !upgrade.effects || upgrade.effects.length === 0) {
    return <button disabled>Invalid Upgrade Data</button>;
  }

  const effect = upgrade.effects[0]; // Assuming the first effect is primary for display

  // --- Direct Benefit Label ---
  let directBenefitLabel = "Effect Applied"; // Default for global or non-direct production changes
  const productionIncrease = newProduction - currentProduction;

  if (effect.targetId !== 'GLOBAL' && isFinite(productionIncrease) && productionIncrease !== 0) {
    const percentageIncrease = currentProduction > 0 ? (productionIncrease / currentProduction) * 100 : (newProduction > 0 ? Infinity : 0);
    directBenefitLabel = `${productionIncrease > 0 ? '+' : ''}${productionIncrease.toFixed(1)}/sec`;
    if (isFinite(percentageIncrease) && percentageIncrease !== 0 && Math.abs(percentageIncrease) > 0.1) { // Only show % if meaningful
        directBenefitLabel += ` (${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(1)}%)`;
    }
    directBenefitLabel += ` to ${affectedName}`;
  } else if (effect.targetId === 'GLOBAL') {
    if (effect.type === 'GLOBAL_MULTIPLIER') {
      directBenefitLabel = `x${Number(effect.value).toFixed(2)} to All Production`;
    }
  } else if (effect.type === 'FLAT_BONUS') {
    directBenefitLabel = `+${Number(effect.value).toFixed(1)} to ${affectedName} Base`;
  } else if (effect.type === 'MULTIPLIER') {
     directBenefitLabel = `x${Number(effect.value).toFixed(2)} to ${affectedName} Output`;
  }


  // --- Tooltip Content ---
  const tooltipContent = (
    <div className="upgrade-tooltip-details">
      <p><strong>{upgrade.name}</strong></p>
      <p>{upgrade.description}</p>
      {effect.targetId !== 'GLOBAL' && (
        <>
          <p>Affects: {affectedName}</p>
          <p>Current Output: {(currentProduction ?? 0).toFixed(1)}/sec</p>
          {!upgrade.purchased && <p>Projected Output: {(newProduction ?? 0).toFixed(1)}/sec</p>}
          {!upgrade.purchased && <p>Increase: {productionIncrease > 0 ? '+' : ''}{(productionIncrease ?? 0).toFixed(1)}/sec</p>}
        </>
      )}
      {effect.targetId === 'GLOBAL' && (
        <p>Affects: All Incrementers</p>
      )}
      {/* Specific effect details */}
      {effect.type === "SYNERGY_BONUS_PERCENT" && effect.sourceIncrementerId && (
        <p>Synergy with: {effect.sourceIncrementerId}</p>
      )}
      <p>Cost: {upgrade.cost}</p>
      {upgrade.purchased && <p><em>(Purchased)</em></p>}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <button
        onClick={() => onPurchase && onPurchase(upgrade.id)}
        disabled={disabled} // Parent now fully controls disabled state
        className={`upgrade-button ${upgrade.purchased ? " purchased" : ""}`}
      >
        <span className="upgrade-name">{upgrade.name}</span>
        <span className="upgrade-effect-direct">{directBenefitLabel}</span>
        <span className="upgrade-cost">Cost: {upgrade.cost}</span>
      </button>
    </Tooltip>
  );
};

export default UpgradeButton;