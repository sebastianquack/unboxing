import React from 'react';
import styled from 'styled-components';

import {LocaleText, withLanguage, UIText, VideoModal, HorizontalScrollContainer} from './';
import {serverUrl} from '../config/server.js';
import { breakpoints } from '../config/globalStyles';

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
    let videoThumbs = this.props.challenge.stages.map((stage, index)=>
      stage.video_thumb ? <VideoThumb 
        key={index} src={serverUrl + "/files/video/" + stage.video_thumb}
        onClick={()=>{
          this.props.setVideoModalUrl(serverUrl + "/files/video/" + stage["video_" + this.props.language]);
        }}
      /> : null
    );
    if(videoThumbs.length == 1 && !videoThumbs[0]) videoThumbs = null;

    return (
      <Container>
        <Shadow/>
        <InfoIcon src="/images/triangle.png"/>
        <InfoContainer>
          <InfoItem><UIText styleKey="challenge-info-header">{header}</UIText></InfoItem>
          <InfoItem style={{marginTop: "5px"}}><UIText styleKey="challenge-info-content">{text}</UIText></InfoItem>
        </InfoContainer>
        {videoThumbs && <VideoThumbs>
          <HorizontalScrollContainer noButtons justifyRight>
            {videoThumbs}
          </HorizontalScrollContainer>
        </VideoThumbs>}
      </Container>
    )
  }
});

export { ChallengeInfosAndVideos }

const Shadow = styled.div`
  position: fixed;
  width: 200%;
  height: 100%;
  left: 0%;  
  top: -50%;
  background: radial-gradient(black 25%, transparent);
`

const Container = styled.div`
  width: 100%;
  position: absolute;
  right: 0;
  padding-bottom: 20px;
  padding-left: 20px;
  @media (${breakpoints.large}) {
    width: 50%;
  }


  /*
  mask-mode: luminance;
  mask-image: linear-gradient(to left, white 66%, rgb(1,1,1,0.5), transparent);
  background-image: linear-gradient(to bottom, black 66%, rgb(0,0,0,0.5), transparent);*/
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
  justify-content: flex-end;
`

const VideoThumb = styled.img`
  width: 150px;
  margin-left: 10px;
  :hover {
    cursor: pointer;
  }
`