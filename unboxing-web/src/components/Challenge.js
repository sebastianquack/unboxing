import React from 'react';

import {
  SequenceControls,
  MultiChannelAudioPlayer,
  TrackSelector
} from './'

import { formatChallengeTitle, assembleTrackList } from '../helpers';

const filesUrl = "http://unboxing.sebquack.perseus.uberspace.de/files"

export class Challenge extends React.Component {
  constructor(props) {
    super(props)
  
    this.tracks = assembleTrackList(props.currentChallenge, filesUrl);
    
    this.state = {
      playbackControlStatus: "loading", // ready - playing - paused
      activeTracks: this.tracks.map(()=>true),
    }
  }

  render () {
    return <div>
      <h1>{formatChallengeTitle(this.props.currentChallenge)}</h1>
      
      <SequenceControls
        playbackControlStatus={this.state.playbackControlStatus}
        updatePlaybackControlStatus={(playbackControlStatus)=>this.setState({playbackControlStatus})}
      />
      
      <MultiChannelAudioPlayer 
        playbackControlStatus={this.state.playbackControlStatus}
        updatePlaybackControlStatus={(playbackControlStatus)=>this.setState({playbackControlStatus})}
        tracks={this.tracks}
        activeTracks={this.state.activeTracks}
      />

      <TrackSelector
        tracks={this.tracks}
        activeTracks={this.state.activeTracks}
        updateActiveTracks={(activeTracks)=>this.setState({activeTracks})}
      />

    </div>
  }
}
