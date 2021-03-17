import React from "react";
import LinearIncrementalUI from "../../linear/ui/linearIncrementalUI.jsx";
import ExponentialIncrementalUI from "../../exponential/ui/exponentialIncrementalUI.jsx";
import Footer from "../footer/footer.jsx";
import './gameswitcher.scss';

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
              <li className="menu_item"><a className={this.state.name == "Linear" ? "menu_item-link active" : "menu_item-link"} onClick={() => this.switchGame(<LinearIncrementalUI />,"Linear")}>Linear Timer</a></li>
              <li className="menu_item"><a className={this.state.name == "Exponential" ? "menu_item-link active" : "menu_item-link"} onClick={() => this.switchGame(<ExponentialIncrementalUI />,"Exponential")}>Exponential Timer</a></li>
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
