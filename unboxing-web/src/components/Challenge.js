import React from 'react';
import styled from 'styled-components';

import {
  SequenceControls,
  MultiChannelAudioPlayer,
  TrackSelector,
  Stage,
  ChallengeInfosAndVideos,
  ActionStates
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
      activeTracks: this.tracks.map(()=>false),
      loadingStatus: 0
    }

    this.updatePlaybackControlStatus = this.updatePlaybackControlStatus.bind(this)
    this.updateSequenceStartedAt = this.updateSequenceStartedAt.bind(this)
    this.populateStage = this.populateStage.bind(this)
    this.toggleTrack = this.toggleTrack.bind(this)

    this.updatePlaybackControlStatus("loading");
  }
 
  updatePlaybackControlStatus(playbackControlStatus) {
    //this.setState({playbackControlStatus})
    this.props.updatePlaybackControlStatus(playbackControlStatus);
  }

  updateSequenceStartedAt(sequenceStartedAt) {
    this.setState({sequenceStartedAt})
    // console.log("sequence started at " + sequenceStartedAt + ", " + (Date.now()-sequenceStartedAt)/1000 + " seconds ago" )
  }

  populateStage() {
    this.setState({
      activeTracks: this.tracks.map(()=>true) 
    })
  }

  toggleTrack(index) {
    let activeTracks = this.state.activeTracks;
    activeTracks[index] = !activeTracks[index];
    this.setState({activeTracks: activeTracks});
  }

  render () {

    return <Container>
      
      {this.props.challengeInfoOpen && 
      <FixedTopRight>
        <ChallengeInfosAndVideos challenge={this.props.currentChallenge} setVideoModalUrl={this.props.setVideoModalUrl}/>
      </FixedTopRight>
      }

      <FixedControls>
        <SequenceControls
          showControls={this.state.activeTracks.filter((t)=>t).length > 0}
          playbackControlStatus={this.props.playbackControlStatus}
          loadingStatus={this.state.loadingStatus}
          updatePlaybackControlStatus={this.updatePlaybackControlStatus}
        />
      </FixedControls>

      {<MultiChannelAudioPlayer 
        playbackControlStatus={this.props.playbackControlStatus}
        updatePlaybackControlStatus={this.updatePlaybackControlStatus}
        updateLoadingStatus={(loadingStatus)=>this.setState({loadingStatus})}
        updateSequenceStartedAt={this.updateSequenceStartedAt}
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

      <VisualizerContainer />

      <StageContainer>
        <ActionStates
            playbackControlStatus={this.props.playbackControlStatus}
            sequenceStartedAt={this.state.sequenceStartedAt}
            tracks={this.tracks}
          >
          <Stage 
            activeTracks={this.state.activeTracks} 
            bpm={this.props.currentChallenge.sequence.bpm}
            populateStage={this.populateStage}
            toggleTrack={this.toggleTrack}
          />
        </ActionStates>
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
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 99;
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
  width: 100%;
`
