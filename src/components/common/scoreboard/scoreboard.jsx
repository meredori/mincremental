import React from 'react';

class Scoreboard extends React.Component {
  render() {
    return (<div className="row">
    <span>{this.props.title}:</span>
    <span>{this.props.score.toLocaleString()}</span>
    </div>);
  }
};

export default Scoreboard;
