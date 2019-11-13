import React from 'react';
import styled from 'styled-components';

import { UIText, LocaleText, Button, DataContext, withLanguage } from './'
import { breakpoints, colors } from '../config/globalStyles'

export class Welcome extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.close = this.close.bind(this);

  }

  componentDidMount = () => {
    let explanations = this.props.data.content.strings["side-explanation_de"];
    if(explanations) {
      console.log("max descriptions", explanations.split("/").length);
      this.maxExplanations = explanations.split("/").length;
      this.setState({explanationIndex: 0});
      this.explanationsInterval = setInterval(()=>{
        this.setState({explanationIndex: this.state.explanationIndex < this.maxExplanations - 1 ? 
          this.state.explanationIndex + 1 : 0})
      }, 5000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.explanationsInterval);
  }

  close() {
    this.props.navigateTo("challenges")
  }

  render () {
    
    return(
    [
      
      <LeftContainer onClick={this.close}>
        <WithLine>
          <UIText styleKey="big-title-top">
            <LocaleText stringsKey="main-supertitle"/>
          </UIText>
          <UIText styleKey="big-title-main">
            <LocaleText stringsKey="main-title"/>
          </UIText>
        </WithLine>
        <FixedWidth>
          <UIText styleKey="big-title-subtitle">
            <LocaleText stringsKey="main-subtitle"/>
          </UIText>   
          <UIText style={{marginTop: 20}} styleKey="big-title-explanation">
            <LocaleText stringsKey="main-explanation"/>
          </UIText>   
        </FixedWidth>
        <Button style={{marginTop: 50}} type="soft-square" onClick={this.close}>
          <LocaleText stringsKey="main-start-button"/></Button>   
      </LeftContainer>,
      
      <RightContainer>
        <Video autoPlay loop muted>
          <source src="/video/web_intro_1.mp4" type="video/mp4"/>
        </Video>  
        <UIText style={{marginTop: 20}} styleKey="big-title-side-explanation">
          <LocaleText stringsKey="side-explanation" index={this.state.explanationIndex}/>            
        </UIText>   
      </RightContainer>
    ]
    )
  }
}

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 15vh;
  left: 15vw;
  z-index: 1;
`

const RightContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  right: 5vw;
  top: 15vh;
  z-index: 0;
`

const Video = styled.video`
  width: 300px;
`

const WithLine = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 300px;
  &::after {
    content: "";
    background-color: ${ colors.turquoise };
    height: 95.25%;
    position: absolute;
    left: -22px;
    width: 4px;
    @media (${breakpoints.large}) {
      left: -26px;
    width: 5px;
    }
  }
  *:first-child {
    position: relative;
    top: -0.5ex;
  }
  *:last-child {
    position: relative;
    /*top: 0.25ex;*/
    left: -0.14ex;
  }
  margin-bottom: 1em;
`

const FixedWidth = styled.div`
  width: 300px;
  @media (${breakpoints.large}) {
    width: 400px;
  }
`
