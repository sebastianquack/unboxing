import React from 'react';
import styled from 'styled-components/macro'

import { InfoBox } from './';

export class Challenges extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render () {

    return <InfoBox 
      dynamicString="challenges_info1"
      data={this.props.data}
    />

  }
}
