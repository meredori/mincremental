import React from 'react';
class IncrementingCounter extends React.Component {
  constructor(props){
    super(props);
    this.state = { count: 0 };
    this.incrementCount = this.incrementCount.bind(this);
  }

  incrementCount(){
    this.setState(state => ({count: state.count + 1}));
  }
  render() {
    return (
      <div className="container">
        <div className="flexrow">
          <h1 className="incrementing-label">Counter for {this.props.name}</h1>
        </div>
        <div className="flexrow">
        {this.state.count}
        </div>
        <div className="flexrow">
          <div className="incrementing-button noselect" onClick={this.incrementCount}>
            Click Me
            </div>
        </div>
      </div>
    );
  }
}
export default IncrementingCounter;