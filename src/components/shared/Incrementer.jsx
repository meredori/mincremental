import React from "react";
import "./incrementer.css";

class Incrementer extends React.Component {
  render() {
    const { amount, increment, index } = this.props;
    return (
      <div className="incrementer">
        <div className="incrementer-header">
          <h3>{amount.name || "Increment"}</h3>
          <p className="incrementer-desc">{amount.desc || ""}</p>
        </div>
        <div className="incrementer-stats">
          <div className="stat-row">
            <span className="stat-label">Owned:</span>
            <span className="stat-value">{amount.owned || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Rate per Unit:</span>
            <span className="stat-value">{amount.rate || 0}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Generation:</span>
            <span className="stat-value highlight">
              {((amount.owned || 0) * (amount.rate || 0)).toLocaleString()} / tick
            </span>
          </div>
        </div>
        <button
          className="increment-button noselect"
          onClick={() => increment(amount, index)}
        >
          Purchase for {amount.cost.toLocaleString()}
        </button>
      </div>
    );
  }
}

export default Incrementer;