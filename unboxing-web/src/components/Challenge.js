import React from 'react';
import styled from 'styled-components';

import {
  SequenceControls,
  MultiChannelAudioPlayer,
  TrackSelector,
  Stage,
  ChallengeInfosAndVideos,
} from './'
import { breakpoints } from '../config/globalStyles';
import { assembleTrackList } from '../helpers';

const filesUrl = "http://unboxing.sebquack.perseus.uberspace.de/files"

export class Challenge extends React.Component {
  constructor(props) {
    super(props)
  
    this.tracks = this.props.currentChallenge ? assembleTrackList(this.props.currentChallenge, filesUrl) : [];

    console.log(this.props.currentChallenge);
    console.log(this.tracks);
      
    this.state = {
      playbackControlStatus: "loading", // ready - playing - paused
      activeTracks: this.tracks.map(()=>true),
      loadingStatus: 0
    }
  }
 
  render () {

    return <Container>
      
      {this.props.challengeInfoOpen && 
      <FixedTopRight>
        <ChallengeInfosAndVideos challenge={this.props.currentChallenge}/>
      </FixedTopRight>
      }

      <FixedControls>
        <SequenceControls
          playbackControlStatus={this.state.playbackControlStatus}
          loadingStatus={this.state.loadingStatus}
          updatePlaybackControlStatus={(playbackControlStatus)=>this.setState({playbackControlStatus})}
        />
      </FixedControls>

      {<MultiChannelAudioPlayer 
        playbackControlStatus={this.state.playbackControlStatus}
        updatePlaybackControlStatus={(playbackControlStatus)=>this.setState({playbackControlStatus})}
        updateLoadingStatus={(loadingStatus)=>this.setState({loadingStatus})}
        tracks={this.tracks}
        activeTracks={this.state.activeTracks}
      />}

      <FixedAtBottom>
        <TrackSelector
          tracks={this.tracks}
          activeTracks={this.state.activeTracks}
          updateActiveTracks={(activeTracks)=>this.setState({activeTracks: [...activeTracks]})} // immutable update for PureComponent
        />
      </FixedAtBottom>

      <VisualizerContainer>
        visu
      </VisualizerContainer>

      <StageContainer>
        <Stage 
          tracks={this.tracks}
          activeTracks={this.state.activeTracks} 
        />
      </StageContainer>

    </Container>
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const VisualizerContainer = styled.div`
  /*background-color: rgba(0,255,0,0.5);*/
  flex: 0.5;
`

const StageContainer = styled.div`
  /*background-color: rgba(0,255,255,0.5);*/
  flex: 0.5;
  margin-bottom: 15vh;
  margin-left: -5vw;
  margin-right: -5vw;
  @media (${breakpoints.large}) {
    margin-left: 10vw;
    margin-right: 10vw;    
  }
`

const FixedAtBottom = styled.div`
  position: fixed;
  bottom: 10px;
  width: 100%;
  box-sizing: border-box;
  z-index: 2;
  padding: 0 25px;
  @media (${breakpoints.large}) {
    padding: 0 50px;
  }
`

const FixedControls = styled.div`
  position: fixed;
  bottom: 50%;
  right: 20px;
`

const FixedTopRight = styled.div`
  position: fixed; 
  right: 0;
`
