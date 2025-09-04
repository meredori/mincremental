import React from "react";
import "./upgrade.css";

class Upgrade extends React.Component {
  render() {
    const { upgrade, onClick } = this.props;
    return (
      <div className={`upgrade ${upgrade.purchased ? 'purchased' : ''}`}>
        <div className="upgrade-info">
          <h4>{upgrade.name}</h4>
          <p>{upgrade.desc}</p>
        </div>
        <button
          className="upgrade-button"
          onClick={() => onClick(upgrade.id)}
          disabled={upgrade.purchased}
        >
          {upgrade.purchased ? 'Purchased' : `Buy for ${upgrade.cost.toLocaleString()}`}
        </button>
      </div>
    );
  }
}

export default Upgrade;