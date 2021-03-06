import React from "react";
import Scoreboard from "../LinearIncremental/scoreboard.jsx";
import Incrementer from "../LinearIncremental/Incrementer.jsx";

class LinearIncrementalUI extends React.Component {
    constructor(props){
        super(props);
        //score is resources, increment is the buttons, tick is the amount per tick and timer is how long each tick is in ms
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
        //decrease score by cost, increase tick by amount, increase cost by formula
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
      <div className="game container">
        <div className="row">
          <h2>Linear Tick</h2>
        </div>
        <Scoreboard score={this.state.score} title="Resources" />
        <Scoreboard score={this.state.tick} title="Per Tick" />
        {this.state.increment.map((state,index) =>
            <Incrementer key={index} increment={this.incrementScore} amount={this.state.increment[index]} index={index} />
        )}
      </div>
    );
  }
}
export default LinearIncrementalUI;
