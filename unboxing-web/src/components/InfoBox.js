import React from 'react';
import styled from 'styled-components/macro'

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
        <InfoLine>
          <img src="/images/info_icon.png"/>
          <UIText styleKey="bottom-left-info">
              <LocaleText stringsKey="info"/>            
          </UIText>
        </InfoLine>
      </InfoBoxContainer>
    );
  }
}

const InfoBoxContainer = styled.div`
  position: absolute;
  z-index: 10;
  left: 5%;
  bottom: 40px;
  width: 300px;
`

const InfoBoxContent = styled.div`
  border-left: 2px solid ${ colors.turquoise };
  padding-left: 10px;
  margin-bottom: 20px;
`

const InfoLine = styled.div`
  display: flex;
  align-items: center;
`
