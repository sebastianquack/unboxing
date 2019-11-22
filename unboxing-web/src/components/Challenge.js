import React from 'react';
import styled from 'styled-components/macro';

import {
  SequenceControls,
  MultiChannelAudioPlayer,
  TrackSelector,
  Stage,
  ChallengeInfosAndVideos,
  ActionStates,
  Visualizer,
  Button,
  UIText,
  LocaleText,
  InfoBox
} from './'
import { breakpoints, colors } from '../config/globalStyles';
import { assembleTrackList } from '../helpers';

const filesUrl = "http://unboxing.sebquack.perseus.uberspace.de/files"

export class Challenge extends React.PureComponent {
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
    this.renderActionStuff = this.renderActionStuff.bind(this)

    this.updatePlaybackControlStatus("loading");
  }
 
  updatePlaybackControlStatus(playbackControlStatus) {
    //this.setState({playbackControlStatus})
    this.props.updatePlaybackControlStatus(playbackControlStatus);
  }

  updateSequenceStartedAt(sequenceStartedAt) {
    this.setState({sequenceStartedAt})
    console.log("sequence started at " + sequenceStartedAt + ", " + (Date.now()-sequenceStartedAt)/1000 + " seconds ago" )
  }

  populateStage() {
    console.log("populate");
    this.setState({
      activeTracks: this.tracks.map(()=>true) 
    })
  }

  toggleTrack(index) {
    const activeTracks = this.state.activeTracks.map( (item,i) => i === index ? !item : item );
    // console.log(index,this.state.activeTracks, activeTracks, Object.is(this.state.activeTracks, activeTracks));
    this.setState({activeTracks});
  }

  renderActionStuff = tracksWithActionStates  => [
    <VisualizerContainer key="visu">
      <Visualizer
        tracks={tracksWithActionStates}
        activeTracks={this.state.activeTracks} 
        duration={this.props.currentChallenge.sequence.custom_duration || this.props.currentChallenge.sequence.duration}
        playbackControlStatus={this.props.playbackControlStatus}
        sequenceStartedAt={this.state.sequenceStartedAt}
      />
    </VisualizerContainer>,
    <StageContainer key="stage">
      <Stage 
        tracks={tracksWithActionStates}
        activeTracks={this.state.activeTracks} 
        bpm={this.props.currentChallenge.sequence.bpm}
        toggleTrack={this.toggleTrack}
        populateStage={this.populateStage}
      />
    </StageContainer>
    ]

  render () {

    return <Container>
      
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

      {!this.props.challengeInfoOpen && 
        <InfoBox 
          staticString="challenge_info1" 
          dynamicString="dynamicInstruct"
          dynamicObj={this.props.currentChallenge.stages[0]}
        />
      }

      <FixedAtBottom>
        {/*<TrackSelector
          tracks={this.tracks}
          activeTracks={this.state.activeTracks}
          toggleTrack={this.toggleTrack}
        />*/}
        
        {!this.props.challengeInfoOpen && <Button
            style={{marginBottom: 40}}
            type={"up"}
            onClick={()=>this.props.setChallengeInfo(true)}
          />}

      </FixedAtBottom>

      <ChallengeInfosAndVideos 
        hide={!this.props.challengeInfoOpen}
        challenge={this.props.currentChallenge} 
        setVideoModalUrl={this.props.setVideoModalUrl}
        close={this.props.toggleChallengeInfo}
      />

      {/*!this.props.challengeInfoOpen && <Building src="/images/building.svg"/>*/}

      <ActionStates
        playbackControlStatus={this.props.playbackControlStatus}
        sequenceStartedAt={this.state.sequenceStartedAt}
        tracks={this.tracks}
        activeTracks={this.state.activeTracks} 
        render={ !this.props.challengeInfoOpen ? this.renderActionStuff : ()=>null }
        />

    </Container>
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  z-index:5;
  position: relative;
`

const VisualizerContainer = styled.div`
  /*background-color: rgba(0,255,0,0.5);*/
  flex: 0.5;
  z-index: -1 ;
  padding: 0 25px;
  @media (${breakpoints.large}) {
    padding: 0 50px;
  }  
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
  display: flex;
  justify-content: flex-end;
  width: 100%;
  box-sizing: border-box;
  z-index: 8;
  padding: 0 25px;
  @media (${breakpoints.large}) {
    padding: 0 50px;
  }
`

const FixedControls = styled.div`
  position: fixed;
  bottom: 40px;
  width: 200px;
  display: flex;
  justify-content: center;
  left: 50%;
  margin-left: -100px;
  z-index: 9;
`

const FixedTopRight = styled.div`
  position: fixed; 
  right: 0;
  width: 100%;
`

const Building = styled.img`
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: -1;
`

