import React from 'react';

import {
  MainScreen,
  StatusBar,
} from './'

export class BaseContainer extends React.Component {

  render() {
    return(
      <div>
        <StatusBar 
          {...this.props}
        />
        <MainScreen 
          {...this.props}
        />
      </div>
    )
  }
}
