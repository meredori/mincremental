import React from "react";

class Incrementer extends React.Component {  render() {
    return (
      <div className="incrementer">
        <button 
          className="increment-button noselect" 
          onClick={() => this.props.increment(this.props.amount, this.props.index)}
        >
          <span>Total: {this.props.amount.total.toLocaleString()}</span>
          <span className="cost">Cost: {this.props.amount.cost.toLocaleString()}</span>
        </button>
      </div>
    );
  }
}

export default Incrementer;
