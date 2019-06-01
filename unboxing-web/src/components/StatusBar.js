import React from 'react';

import {UIText} from './'

export class StatusBar extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    return <div>
      <UIText styleKey="statusbar-title"> Status Bar </UIText>
      <UIText styleKey="statusbar-subtitle"> Status Bar Subtitle</UIText>
      {this.props.navigationState === "challenge" &&
      <input 
        type="button" 
        value="<"
        onClick={()=>{this.props.navigateTo("challenges")}}
      />}
    </div>
  }
}
