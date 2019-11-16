import React from 'react';
import styled from 'styled-components';

import {LocaleText, withLanguage, UIText, VideoModal, HorizontalScrollContainer, SoftTextButton} from './';
import {serverUrl} from '../config/server.js';
import { breakpoints, colors } from '../config/globalStyles';

const ChallengeInfosAndVideos = withLanguage(class extends React.Component {
  constructor(props) {
    super(props)
    console.log(props.challenge);

    this.state = {
      videoUrl: null
    }
  }

  render() {
    if(!this.props.challenge) return null;

    
    const movement = <LocaleText object={this.props.challenge.sequence} field="title" />
    const bars = <LocaleText object={this.props.challenge.sequence} field="subtitle" />
    
    const subtitle = <LocaleText object={this.props.challenge.stages[0]} field="header"/> 
    const text = <LocaleText object={this.props.challenge.stages[0]} field="text"/>
    let videoContainers = this.props.challenge.stages.map((stage, index)=>
      stage.video_thumb ? <VideoContainer>
        <VideoThumb 
          key={index} src={serverUrl + "/files/video/" + stage.video_thumb}
          onClick={()=>{
            this.props.setVideoModalUrl(serverUrl + "/files/video/" + stage["video_" + this.props.language]);
          }}
        /> 
        <VideoCaption><LocaleText object={stage} field="video_caption"/></VideoCaption>
        </VideoContainer>
      : null
    );
    if(videoContainers.length == 1 && !videoContainers[0]) videoContainers = null;

    return (
      <Container>
          <ContentContainer>

          <WithLine>
            <UIText styleKey="challenge-supertitle">{movement}</UIText>
            <UIText styleKey="challenge-title">{bars}</UIText>
          </WithLine>
          
          <UIText styleKey="challenge-subtitle">{subtitle}</UIText>
          <UIText style={{marginTop: 10, marginBottom: 30}} styleKey="challenge-info-content">{text}</UIText>
        
        {videoContainers && <VideoThumbs>
            {videoContainers}
        </VideoThumbs>}

        <SoftTextButton style={{marginTop: 50, width: 170, height: 100}} onClick={this.props.close}>
          <LocaleText stringsKey="passage-play-button"/>
        </SoftTextButton>   

        </ContentContainer>
      
      </Container>
    )
  }
});

export { ChallengeInfosAndVideos }

const Container = styled.div`
  width: 100%;
  min-height: 93vh;
  bottom: 0;
  position: absolute;
  z-index: 10;
  box-sizing: border-box;
  right: 0;
  padding: 20px;
  padding-top: 40px;
  background-image: url("/images/overlaybg.svg");
  background-size: cover;
`

const ContentContainer = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 2em;
`

const InfoIcon = styled.img`
  position: absolute;
  top: 4px;
  height: 13px;
  right: 10px;
  @media (${breakpoints.large}) {
    right: 25px;
  }
`

const InfoContainer = styled.div`
  border-right: #00AFA1 1px solid;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  margin-right: 25px;
  padding-right: 5px;
  padding-left: 10px;
  @media (${breakpoints.large}) {
    margin-right: 45px;
  }
`

const InfoItem = styled.div`
  text-align: right;
  @media (${breakpoints.large}) {
    max-width: 66%;  
  }

`
const VideoThumbs = styled.div`
  margin: 20px; 
  padding-right: 10px; 
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

const VideoContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start; 
`

const VideoCaption = styled.div`
  width: 200px;
  margin: 10px;
`

const VideoThumb = styled.img`
  width: 150px;
  height: 93px;
  margin-left: 10px;
  :hover {
    cursor: pointer;
  }
`

const WithLine = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
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
  margin-bottom: 1em;
  margin-left: 26px;
`
