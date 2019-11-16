import React from 'react';
import styled from 'styled-components'

import { LocaleText, UIText } from './';
import { formatChallengeTitle } from '../helpers';
import { breakpoints, colors } from '../config/globalStyles';

export class Challenges extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render () {

    return <ChallegesInfoBox>
      <UIText styleKey="bottom-left-explanation">
        <LocaleText stringsKey="challenges-explanation-1"/>            
      </UIText>
      <UIText styleKey="bottom-left-explanation">
        <LocaleText stringsKey="challenges-explanation-2"/>            
      </UIText>      
    </ChallegesInfoBox>
  }
}

const ChallegesInfoBox = styled.div`
  position: absolute;
  border-left: 2px solid ${ colors.turquoise };
  padding-left: 5px;
  z-index: 100;
  left: 5%;
  bottom: 15%;
`