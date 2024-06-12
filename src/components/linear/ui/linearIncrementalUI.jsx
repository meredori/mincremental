import React from "react";
import Scoreboard from "../../common/scoreboard/scoreboard.jsx";
import Incrementer from "../../common/incrementer/Incrementer.jsx";

class LinearIncrementalUI extends React.Component {
    constructor(props){
        super(props);
        //score is resources, increment is the buttons, tick is the amount per tick and timer is how long each tick is in ms
        this.state = {score :1, increment: [{cost:1,total:1, purchased: 0 }], tick:0, timer:1000};
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
            if (this.state.tick == 0 || increment[i].purchased == 0){
                increment.push({cost: x.cost * 10, total: 10 ** (i+1), purchased: 0 });
            }
            increment[i].cost = Math.ceil((increment[i].cost * ((1.02 + i/10) ** (increment[i].purchased+1))));
            increment[i].purchased += 1;
            this.setState(state => ({tick: this.state.tick + x.total}));
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
