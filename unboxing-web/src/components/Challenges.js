import React from 'react';
import styled from 'styled-components'

import { LocaleText, UIText } from './';
import { formatChallengeTitle } from '../helpers';

export class Challenges extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    const challengeButtons = this.props.data ? this.props.data.challenges.map((challenge, index)=>
      <ChallengeButton 
        key={challenge._id}
        onClick={()=>{this.props.navigateToChallenge(challenge._id)}}
      >
        <ChallengeButtonNumber>
          <UIText styleKey="challenge-select-title" >{index + 1}</UIText>
        </ChallengeButtonNumber>  
        
        <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={challenge.sequence} field="title"/>
          </UIText>
        </ChallengeButtonSubtitle>
        
        <ChallengeButtonSubtitle>
          <UIText styleKey="challenge-select-subtitle" >
            <LocaleText object={challenge.sequence} field="subtitle"/>
          </UIText>
        </ChallengeButtonSubtitle>
      </ChallengeButton>
    ) : null;

    return <div>
      {challengeButtons}
    </div>
  }
}

const ChallengeButton = styled.div`
  :hover {
    cursor: pointer;
  }
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 186px;
  margin: 20px;
  float: left;
`

const ChallengeButtonNumber = styled.div`
  background-image: url(/images/PassageButtonBg.png);
  background-size: contain;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ChallengeButtonSubtitle = styled.div`
  display: flex;
  justify-content: center;
`


