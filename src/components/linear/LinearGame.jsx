import React from "react";
import Scoreboard from "../shared/Scoreboard.jsx";
import Incrementer from "../shared/Incrementer.jsx";
import "./linear.css";

class LinearGame extends React.Component {
    constructor(props){
        super(props);
        this.state = {score :1, increment: [{cost:1,amount:1}], tick:0, timer:1000};
        this.incrementScore = this.incrementScore.bind(this);
    }
    componentDidMount() {
        this.interval = setInterval(() => this.setState({ score: this.state.score + this.state.tick }), this.state.timer);
      }
      componentWillUnmount() {
        clearInterval(this.interval);
      }
    incrementScore(x,i){
        if(this.state.score >= x.cost){
            var score = this.state.score - x.cost          
            var increment = this.state.increment;
            if(this.state.tick == 0 || (i !=0 && increment[i-1].amount == 1)){
                increment.push({cost: x.cost * 10, amount: 1});
            }
            increment[i].cost = Math.ceil(increment[i].cost * 1.2);
            if(i == 0){
                this.setState(state => ({tick: this.state.tick + x.amount}));
            }
            else {                                            
                increment[i-1].amount += x.amount;
            }            
            this.setState(state => ({increment: increment}));  
            this.setState(state => ({score: score}));
        }
    }
  render() {
    return (
      <div className="game-linear">
        <h2>Linear Ticker</h2>
        <Scoreboard score={this.state.score} title="Resources" />
        <Scoreboard score={this.state.tick} title="Per Tick" />
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

export default LinearGame;