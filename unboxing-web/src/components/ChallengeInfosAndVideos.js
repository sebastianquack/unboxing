import React from 'react';
import styled from 'styled-components';

import {LocaleText, LanguageContext} from './';
import {serverUrl} from '../config/server.js';

export class ChallengeInfosAndVideos extends React.Component {
  constructor(props) {
    super(props)
    console.log(props.challenge);
  }

  renderVideoThumbs(language) {
    return (this.props.challenge.stages.map((stage, index)=> 
      <VideoThumb 
        key={index} src={serverUrl + "/files/video/" + stage.video_thumb}
        onClick={()=>{console.log("load video " + stage["video_" + language])}}
      />)
    )
  }

  render() {

    const header = <LocaleText object={this.props.challenge.stages[0]} field="header"/> 
    const text = <LocaleText object={this.props.challenge.stages[0]} field="text"/>

    return <LanguageContext.Consumer>
      {language => 
        <Container>
          {header} {text} {this.renderVideoThumbs(language)}
        </Container>
      }
    </LanguageContext.Consumer>
  }
}

const Container = styled.div`
  /*background-color: rgba(0,255,255,0.5);*/
  width: 100%;
  height: 100%;
`

const VideoThumb = styled.img`
  width: 150px;
  :hover {
    cursor: pointer;
  }
`