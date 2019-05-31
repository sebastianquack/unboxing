import React from 'react';

import {
  SequenceControls,
  MultiChannelAudioPlayer,
} from './'

import { formatChallengeTitle, findFullSoundfiles } from '../helpers';

const filesUrl = "http://unboxing.sebquack.perseus.uberspace.de/files"

export class Challenge extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      playbackControlStatus: "init" // playing - paused
    }
    this.files = findFullSoundfiles(props.currentChallenge, filesUrl);
  }

  render () {
    return <div>
      <h1>{formatChallengeTitle(this.props.currentChallenge)}</h1>
      
      <SequenceControls
        playbackControlStatus={this.state.playbackControlStatus}
        handlePlayPause={()=>{
          if(this.state.playbackControlStatus !== "playing") {
            this.setState({playbackControlStatus: "playing"})
          } else {
            this.setState({playbackControlStatus: "paused"})
          }
        }}
        handleRewind={()=>{
          this.setState({playbackControlStatus: "init"})
        }}
      />
      
      <MultiChannelAudioPlayer 
        playbackControlStatus={this.state.playbackControlStatus}
        files={this.files}
      />

    </div>
  }
}
