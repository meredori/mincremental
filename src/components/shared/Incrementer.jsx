import React from "react";
import "./incrementer.css"; // REQ-ISSUE-3: Styles might need adjustment here or in linear.css / upgrade.css
import Tooltip from "./Tooltip"; // REQ-ISSUE-8: Import Tooltip

function Incrementer(props) {
  const {
    id,
    name,
    description,
    count,
    currentCost,
    individualProductionValue,
    totalProductionFromType,
    onPurchase,
    score, // For disabling purchase button
    tooltipContent, // REQ-ISSUE-8: New prop for tooltip content
  } = props;

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(id);
    }
  };

  const incrementerCardContent = (
    <div className="incrementer-details"> {/* Added a wrapper for content if Tooltip wraps this */}
      <div className="incrementer-header">
        <h3>{name || "Incrementer Name"}</h3>
        <p className="incrementer-desc">{description || "Description not available."}</p>
      </div>
      <div className="incrementer-stats">
        <div className="stat-row">
          <span className="stat-label">Owned:</span>
          <span className="stat-value">{count}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Value (per unit):</span>
          <span className="stat-value effect-display">{individualProductionValue}/sec</span>
        </div>
        {count > 0 && (
          <div className="stat-row">
            <span className="stat-label">Total from {name}s:</span>
            <span className="stat-value effect-display highlight">{totalProductionFromType}/sec</span>
          </div>
        )}
        <div className="stat-row">
          <span className="stat-label">Cost for next:</span>
          <span className="stat-value">{currentCost}</span>
        </div>
      </div>
      <button
        className="increment-button noselect"
        onClick={handlePurchase}
        disabled={score < currentCost}
      >
        Purchase for {currentCost}
      </button>
    </div>
  );

  // REQ-ISSUE-8: Wrap the entire card content with Tooltip if tooltipContent is provided
  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent}>
        <div className="incrementer">
          {incrementerCardContent}
        </div>
      </Tooltip>
    );
  }

  // Fallback if no tooltip content (though it should always be provided now)
  return (
    <div className="incrementer">
      {incrementerCardContent}
    </div>
  );
}

export default Incrementer;