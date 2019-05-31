import React from 'react';

export class Welcome extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.handleButtonPress = this.handleButtonPress.bind(this)
  }

  handleButtonPress(event) {
    this.props.navigateTo("challenges")
  }

  render () {
    return <div>
      Welcome
      <button onClick={this.handleButtonPress}>
        Let's play
      </button>
    </div>
  }
}
