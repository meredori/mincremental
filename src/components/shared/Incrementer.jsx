import React from "react";
import "./incrementer.css";

class Incrementer extends React.Component {
  render() {
    const { amount, increment, index } = this.props;
    return (
      <div className="incrementer">
        <button
          className="increment-button noselect"
          onClick={() => increment(amount, index)}
        >
          {"total" in amount ? (
            <span>Total: {amount.total.toLocaleString()}</span>
          ) : (
            <span>Increase by {amount.amount}</span>
          )}
          <span className="cost">Cost: {amount.cost.toLocaleString()}</span>
        </button>
      </div>
    );
  }
}

export default Incrementer;