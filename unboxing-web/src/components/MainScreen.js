import React from 'react';

import {
  Welcome,
  Challenges,
  Challenge
} from './'

export class MainScreen extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    let main = null
    switch (this.props.navigationState) {
      case "welcome": 
        main = <Welcome {...this.props} />; 
        break;
      case "challenges": 
        main = <Challenges {...this.props} />; 
        break;
      case "challenge": 
        main = <Challenge {...this.props} />; 
        break;
      default: 
        main = <span>no screen called "{this.props.navigationState}"</span>
    }

    return main
  }
}
