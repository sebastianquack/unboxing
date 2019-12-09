import React from 'react';
import styled from 'styled-components/macro'

import { InfoBox } from './';
import { breakpoints, colors } from '../config/globalStyles'

export class Challenges extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render () {

    return <InfoBoxContainer><InfoBox 
      dynamicString="challenges_info1"
      data={this.props.data}
    /></InfoBoxContainer>

  }
}

const InfoBoxContainer = styled.div`
  display: none;
  @media ${breakpoints.large} {
      display: block;
  }
`
