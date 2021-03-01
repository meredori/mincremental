import React from "react";

class Incrementer extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="divButton noselect" onClick={() => this.props.increment(this.props.amount,this.props.index)}>
          <span>Increase by {this.props.amount.amount.toLocaleString()} </span>
          <span>Cost: {this.props.amount.cost.toLocaleString()}</span>
        </div>
      </div>
    );
  }
}

export default Incrementer;
