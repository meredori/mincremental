import React from "react";
import Scoreboard from "../ExponentialIncremental/scoreboard.jsx";
import Incrementer from "../ExponentialIncremental/Incrementer.jsx";

class ExponentialIncrementalUI extends React.Component {
  constructor(props) {
    super(props);
    //score is resources, increment is the buttons, tick is the amount per tick and timer is how long each tick is in ms
    this.state = {
      score: 1,
      increment: [{ cost: 1, amount: 1, total: 0, purchased: 0 }],
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
    //decrease score by cost, increase tick by amount, increase cost by formula
    if (this.state.score >= x.cost) {
      var score = this.state.score - x.cost;
      var increment = this.state.increment;
      if (increment[i].total == 0) {
        increment.push({ cost: x.cost * 10, amount: 1, total: 0, purchased: 0 });
      }     
      if (increment[i].purchased % 10 == 0 && increment[i].purchased != 0){
        increment[i].amount = increment[i].amount * 10;      
      }
      increment[i].total += increment[i].amount;
      increment[i].purchased += 1;
      increment[i].cost = Math.ceil((increment[i].cost * (1.05 ** increment[i].purchased)));

      this.setState(state => ({ increment: increment }));
      this.setState(state => ({ score: score }));
    }
  }
  render() {
    return (
      <div className="game container">
        <div className="row">
          <h2>Exponential Tick</h2>
        </div>
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
export default ExponentialIncrementalUI;
