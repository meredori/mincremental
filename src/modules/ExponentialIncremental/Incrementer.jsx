import React from "react";

class Incrementer extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="divButton noselect" onClick={() => this.props.increment(this.props.amount,this.props.index)}>
          <span>Cost: {this.props.amount.cost.toLocaleString()}</span><br/>
          <span>Purchased: {this.props.amount.purchased.toLocaleString()}</span><br/>
          <span>Total: {this.props.amount.total.toLocaleString()}</span>
        </div>
      </div>
    );
  }
}

export default Incrementer;
