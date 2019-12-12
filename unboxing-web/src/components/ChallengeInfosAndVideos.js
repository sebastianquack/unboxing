import React from 'react';
import styled from 'styled-components/macro';

import {LocaleText, withLanguage, UIText, VideoModal, HorizontalScrollContainer, SoftTextButton} from './';
import {serverUrl} from '../config/server.js';
import { breakpoints, colors } from '../config/globalStyles';

const ChallengeInfosAndVideos = withLanguage(class extends React.Component {
  constructor(props) {
    super(props)
    // console.log(props.challenge);

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
      stage.video_thumb ? <VideoContainer key={index}>
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
    if(videoContainers.length === 1 && !videoContainers[0]) videoContainers = null;

    return (
      <Container hide={this.props.hide}>
          <ContentContainer>

          <PlayButtonContainer>
            <SoftTextButton textWidth={100} style={{
              width: "100%", height: "100%",
            }} onClick={this.props.close}>
              <UIText styleKey="big-title-button"><LocaleText stringsKey="passage-play-button"/></UIText>
            </SoftTextButton>
          </PlayButtonContainer>   

          <WithLine>
            <UIText styleKey="challenge-supertitle">{movement}</UIText>
            <UIText styleKey="challenge-title">{bars}</UIText>
          </WithLine>
          
          <UIText styleKey="challenge-subtitle">{subtitle}</UIText>
          
        

          <UIText style={{marginTop: 10, marginBottom: 30}} styleKey="challenge-info-content">{text}</UIText>
        
        {videoContainers && <VideoThumbs>
            {videoContainers}
        </VideoThumbs>}

          

        
        </ContentContainer>
      </Container>
    )
  }
});

export { ChallengeInfosAndVideos }

const PlayButtonContainer = styled.div`
  
  float: right;
  width: 120px;
  height: 50px;
  z-index: 10;
  div span span {
    font-size: 14px;
    line-height: 18px;
  }

  @media ${breakpoints.medium} {
    position: absolute;
    top: auto;
    bottom: 50px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 190px;
    height: 100px;
    div span span {
      font-size: 20px;
      line-height: 24px;
    }
  }
`

const Container = styled.div`
  width: 100%;
  bottom: 0;
  position: fixed;
  z-index: 10;
  box-sizing: border-box;
  background-image: url("/images/overlaybg.svg");
  background-size: contain;
  background-repeat: no-repeat;
  /*background-color:red;*/
  background-position: center;
  max-width: 100vw;
  height: 56.25vw;
  max-height: 100vh;
  width: 177.7vh;
  margin:auto;
  overflow: hidden;
  align-self: center;

  transition: transform 1s;
  transform: translateY(${ props => props.hide ? "94%" : "calc(-50vh + 50% + 0.5rem)" });
`

const ContentContainer = styled.div`
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  margin-left: 8%;
  margin-right: 8%;
  height: 82%;
  margin-top: 4.5%;
  /*background-color:rgba(0,0,255,0.5);*/
  overflow-x: hidden;
  overflow-y: auto;
`

const InfoIcon = styled.img`
  position: absolute;
  top: 4px;
  height: 13px;
  right: 10px;
  @media ${breakpoints.large} {
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
  @media ${breakpoints.large} {
    margin-right: 45px;
  }
`

const InfoItem = styled.div`
  text-align: right;
  @media ${breakpoints.large} {
    max-width: 66%;  
  }

`
const VideoThumbs = styled.div`
  margin-top: 40px; 
  margin-bottom: 20px;
  padding-right: 10px; 
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
`

const VideoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`

const VideoCaption = styled.span`
  width: 150px;
  margin: 10px;
`

const VideoThumb = styled.img`
  width: 150px;
  height: 93px;
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
    @media ${breakpoints.large} {
      left: -26px;
    width: 5px;
    }
  }
  margin-bottom: 1em;
  margin-left: 26px;
`
