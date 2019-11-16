import React from 'react';
import styled from 'styled-components'

import { UIText, LocaleText, LanguageSelector, Button } from './'
import { breakpoints, colors } from '../config/globalStyles'

export class InfoBox extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    return(
      <InfoBoxContainer>
        <InfoBoxContent>
          <UIText styleKey="bottom-left-explanation">
            <LocaleText stringsKey={this.props.string1}/>            
          </UIText>
          <UIText styleKey="bottom-left-explanation">
            <LocaleText stringsKey={this.props.string2}/>            
          </UIText>
        </InfoBoxContent>
        <img src="/images/info_icon.png"/>
      </InfoBoxContainer>
    );
  }
}

const InfoBoxContainer = styled.div`
  position: absolute;
  z-index: 10;
  left: 5%;
  bottom: 40px;
`

const InfoBoxContent = styled.div`
  border-left: 2px solid ${ colors.turquoise };
  padding-left: 5px;
  margin-bottom: 10px;
`
