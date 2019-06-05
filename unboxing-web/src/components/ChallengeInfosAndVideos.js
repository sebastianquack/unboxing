import React from 'react';
import styled from 'styled-components';

import {LocaleText, withLanguage, UIText, VideoModal} from './';
import {serverUrl} from '../config/server.js';

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

    const header = <LocaleText object={this.props.challenge.stages[0]} field="header"/> 
    const text = <LocaleText object={this.props.challenge.stages[0]} field="text"/>
    const videoThumbs = this.props.challenge.stages.map((stage, index)=>
      <VideoThumb 
        key={index} src={serverUrl + "/files/video/" + stage.video_thumb}
        onClick={()=>{
          this.props.setVideoModalUrl(serverUrl + "/files/video/" + stage["video_" + this.props.language]);
        }}
      />
    );

    return (
      <Container>
        <InfoIcon src="/images/triangle.png"/>
        <InfoContainer>
          <InfoItem><UIText styleKey="challenge-info-header">{header}</UIText></InfoItem>
          <InfoItem><UIText styleKey="challenge-info-content">{text}</UIText></InfoItem>
        </InfoContainer>
        <VideoThumbs>
          {videoThumbs}
        </VideoThumbs>
      </Container>
    )
  }
});

export { ChallengeInfosAndVideos }

const Container = styled.div`
  /*background-color: rgba(0,255,255,0.5);*/
  width: 100%;
  height: 100%;
`

const InfoIcon = styled.img`
  position: absolute;
  top: 4px;
  right: 20px;
  height: 13px;
`

const InfoContainer = styled.div`
  margin-right: 36px;
  padding-right: 5px;
  border-right: #00AFA1 1px solid;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const InfoItem = styled.div`
  

`
const VideoThumbs = styled.div`
  margin: 20px;  
`

const VideoThumb = styled.img`
  width: 150px;
  margin-left: 10px;
  :hover {
    cursor: pointer;
  }
`