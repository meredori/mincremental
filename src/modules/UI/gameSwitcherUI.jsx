import React from "react";
import LinearIncrementalUI from "./linearIncrementalUI.jsx";
import ExponentialIncrementalUI from "./exponentialIncrementalUI.jsx";
import Footer from "./footer.jsx";

class GameSwitcherUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = { game: "", name: "" };
    this.switchGame = this.switchGame.bind(this);
  }
  switchGame(i,n){
      this.setState({game: i, name: n});
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <h1>Select Game</h1>
          
        </div>
        <div className="row">
        <ul className="menu">
              <li className="menu_item"><a className={this.state.name == "Linear" ? "active" : ""} onClick={() => this.switchGame(<LinearIncrementalUI />,"Linear")}>Linear Timer</a></li>
              <li className="menu_item"><a className={this.state.name == "Exponential" ? "active" : ""} onClick={() => this.switchGame(<ExponentialIncrementalUI />,"Exponential")}>Exponential Timer</a></li>
          </ul>
        </div>
        <div className="row">
        {this.state.game}
        </div>
        <Footer />
      </div>
    );
  }
}
export default GameSwitcherUI;
