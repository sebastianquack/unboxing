import React from 'react';
import styled from 'styled-components/macro';

import { UIText, LocaleText, Button, DataContext, withLanguage, SoftTextButton } from './'
import { breakpoints, colors, dimensions } from '../config/globalStyles'

export class Welcome extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.close = this.close.bind(this);

  }

  componentDidMount = () => {
    let explanations = this.props.data.content.strings["side-explanation_de"];
    if(explanations) {
      //console.log("max descriptions", explanations.split("/").length);
      this.maxExplanations = explanations.split("/").length;
      this.setState({explanationIndex: 0});
      this.explanationsInterval = setInterval(()=>{
        this.setState({explanationIndex: this.state.explanationIndex < this.maxExplanations - 1 ? 
          this.state.explanationIndex + 1 : 0})
      }, 7000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.explanationsInterval);
  }

  close() {
    this.props.navigateTo("challenges")
  }

  render () {

    console.log(this.props.vw)
    
    return(
    [
      
      <LeftContainer key={1} onClick={this.close}>
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
          <UIText styleKey="big-title-explanation">
            <LocaleText stringsKey="main-explanation"/>
          </UIText>   
        </FixedWidth>
        <PlayButtonContainer>
          <SoftTextButton style={{width: 150, height: 100}} onClick={this.close}>
            <UIText styleKey="big-title-button"><LocaleText stringsKey="main-start-button"/></UIText>
          </SoftTextButton>   
        </PlayButtonContainer>
        <UIText styleKey="compatibility-notice">
          <LocaleText stringsKey="compatibility-notice"/>
        </UIText>   
      </LeftContainer>,
      
      <RightContainer key={2} >
        { this.props.vw > dimensions.large.minWidthPx &&
          <Video autoPlay loop muted>
            <source src="/video/web_intro_1.mp4" type="video/mp4"/>
          </Video>
        }
        {/*<KeyVisualImg/>*/}
        <UIText style={{position: "relative", top: -200, marginLeft: "auto", marginTop: 20, width: 300}} styleKey="big-title-side-explanation">
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
  top: 20vh;
  left: 15vw;
  z-index: 1;
  @media ${breakpoints.large} {
    top: 15vh;
  }
`

const PlayButtonContainer = styled.div`
  margin-top: 0px;
  @media ${breakpoints.large} {
    margin-top: 50px; 
  }
`

const RightContainer = styled.div`
  display: none;
  @media ${breakpoints.large} {
    display: flex;
    position: absolute;  
    flex-direction: column;
    right: 5vw;
    top: 0vh;
    z-index: 0;
    mix-blend-mode: lighten;
  }
`

const KeyVisualImg = styled.div`
  width: 100px;
  height: 100px;
  mix-blend-mode: lighten;
  background-image: url("/images/key_Visual_composing.png");
  background-size: cover;
`

const Video = styled.video`
  height: 100vh;
  mix-blend-mode: lighten;
`

const WithLine = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  @media ${breakpoints.large} {
    width: 400px;
  }
  &::after {
    content: "";
    background-color: ${ colors.turquoise };
    height: 95.25%;
    position: absolute;
    left: -22px;
    width: 2px;
    @media ${breakpoints.large} {
      left: -26px;
      width: 5px;
      width: 4px;
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
  width: 100%;
  @media ${breakpoints.large} {
    width: 400px;
  }

`
