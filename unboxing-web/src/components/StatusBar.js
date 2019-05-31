import React from 'react';

export class StatusBar extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    return <div>
      Status Bar
      {this.props.navigationState === "challenge" &&
      <input 
        type="button" 
        value="<"
        onClick={()=>{this.props.navigateTo("challenges")}}
      />}
    </div>
  }
}
