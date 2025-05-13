import React from "react";
import "./scoreboard.css";

class Scoreboard extends React.Component {
  render() {
    return (
      <div className="scoreboard-row">
        <span>{this.props.title}</span>
        <span>{this.props.score.toLocaleString()}</span>
      </div>
    );
  }
}

export default Scoreboard;