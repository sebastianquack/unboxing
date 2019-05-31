import React from 'react';

export class BaseStateProvider extends React.Component {
  constructor() {
    super()
    this.state = {
      navigationState: "welcome",
    }
    this.navigationStates = [
      "welcome",
      "challenges",
      "challenge"
    ]
    this.handleNavigation = this.handleNavigation.bind(this)
  }

  handleNavigation(target) {
    if (this.navigationStates.indexOf(target) === -1 ) {
      console.warn("no route to " + target + " exists"); return;
    }
    this.setState({
      navigationState: target
    })
  }

  render () {
    return React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        navigationState: this.state.navigationState,
        navigateTo: this.handleNavigation
      });
    });
  }
}
