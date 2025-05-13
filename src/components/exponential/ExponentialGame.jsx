import React from "react";
import Scoreboard from "../shared/Scoreboard.jsx";
import Incrementer from "../shared/Incrementer.jsx";
import "./exponential.css";

class ExponentialGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      score: 1,
      increment: [{ cost: 1, amount: 1, total: 0 }],
      timer: 2000
    };
    this.incrementScore = this.incrementScore.bind(this);
  }
  componentDidMount() {
    this.interval = setInterval(
      () => {
        this.setState({ score: this.state.score + this.state.increment[0].total });
        var increment = this.state.increment;
        this.state.increment.map(
          (state, index) => {
            if(index > 0){
                (increment[index - 1].total += increment[index].amount*increment[index].total);
            }
            else {
                this.setState({tick: this.state.tick + increment[index].total*increment[index].amount});
            }
          }
        );
        this.setState({ increment: increment});
      },
      this.state.timer
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  incrementScore(x, i) {
    if (this.state.score >= x.cost) {
      var score = this.state.score - x.cost;
      var increment = this.state.increment;
      if (increment[i].total == 0) {
        increment.push({ cost: x.cost * 10, amount: 1, total: 0 });
      }
      increment[i].cost = Math.ceil(increment[i].cost * 1.2);
      increment[i].total += increment[i].amount;
      this.setState(state => ({ increment: increment }));
      this.setState(state => ({ score: score }));
    }
  }
  render() {
    return (
      <div className="game-exponential">
        <h2>Exponential Ticker</h2>
        <Scoreboard score={this.state.score} title="Resources" />
        {this.state.increment.map((state, index) => (
          <Incrementer
            key={index}
            increment={this.incrementScore}
            amount={this.state.increment[index]}
            index={index}
          />
        ))}
      </div>
    );
  }
}

export default ExponentialGame;