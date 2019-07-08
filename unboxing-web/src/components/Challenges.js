import React from 'react';
import styled from 'styled-components'

import { LocaleText, UIText } from './';
import { formatChallengeTitle } from '../helpers';
import { breakpoints } from '../config/globalStyles';

export class Challenges extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      offsets: this.props.data.challenges.map(()=>{
        return {top: Math.random() * 40 - 20, left: Math.random() * 40 - 20}
      })
    }
  }

  render () {
    const challengeButtons = this.props.data ? this.props.data.challenges.map((challenge, index)=>
      <ChallengeButton 
        key={challenge._id}
        onClick={()=>{this.props.navigateToChallenge(challenge._id)}}
        offset={this.state.offsets[index]}
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

    return <ButtonContainer>
      {challengeButtons}
    </ButtonContainer>
  }
}

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  padding-top: 5vh;
  @media (${breakpoints.large}) {
    padding: 40px;
    padding-top: 1vh;
  }

`

const ChallengeButton = styled.div`
  :hover {
    cursor: pointer;
  }
  min-width: 20%;
  align-items: center;
  display: flex;
  flex-direction: column;

  margin: 10px;
  margin-bottom: 30px;

  @media (${breakpoints.large}) {
    min-width: 20%;
    margin: 20px;
    margin-bottom: 4vh;
    top: ${props=>props.offset.top + "px"};
  }

  left: ${props=>props.offset.left + "px"};
  position: relative;
`

const ChallengeButtonNumber = styled.div`
  background-image: url(/images/PassageButtonBg.png);
  background-size: contain;
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  display: flex;
  margin-bottom: 5px;
`

const ChallengeButtonSubtitle = styled.div`
  justify-content: center;
  
  @media (${breakpoints.large}) {
    display: flex;
  }
`


