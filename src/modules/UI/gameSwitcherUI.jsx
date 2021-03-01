import React from "react";
import LinearIncrementalUI from "./linearIncrementalUI.jsx";
import ExponentialIncrementalUI from "./exponentialIncrementalUI.jsx";

class GameSwitcherUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = { game: "" };
    this.switchGame = this.switchGame.bind(this);
  }
  switchGame(i){
      this.setState({game: i});
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <h1>Select Game</h1>
          
        </div>
        <div className="row">
        <ul className="menu">
              <li><a className={this.state.game == "<LinearIncrementalUI />" ? 'activegame' : 'notactive'} onClick={() => this.switchGame(<LinearIncrementalUI />)}>Linear Timer</a></li>
              <li><a onClick={() => this.switchGame(<ExponentialIncrementalUI />)}>Exponential Timer</a></li>
          </ul>
        </div>
        <div className="row">
        {this.state.game}
        </div>
      </div>
    );
  }
}
export default GameSwitcherUI;
