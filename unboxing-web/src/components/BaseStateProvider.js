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
    this.navigateToChallenge = this.navigateToChallenge.bind(this)
  }

  handleNavigation(target) {
    if (this.navigationStates.indexOf(target) === -1 ) {
      console.warn("no route to " + target + " exists"); return;
    }
    this.setState({
      navigationState: target
    })
  }

  navigateToChallenge(currentChallenge) {
    this.setState({currentChallenge});
    this.handleNavigation("challenge");
  }

  render () {
    return React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        navigationState: this.state.navigationState,
        currentChallenge: this.state.currentChallenge,
        navigateTo: this.handleNavigation,
        navigateToChallenge: this.navigateToChallenge
      });
    });
  }
}
