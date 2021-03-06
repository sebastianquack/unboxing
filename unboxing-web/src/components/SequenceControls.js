import React from 'react';

import { Button } from './';

export class SequenceControls extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
  }

  handlePlayPause() {
    if(this.props.playbackControlStatus !== "playing") {
      this.props.updatePlaybackControlStatus("playing")
    } else {
      this.props.updatePlaybackControlStatus("paused")
    }
  }
  
  handleRewind() {
    this.props.updatePlaybackControlStatus("ready");
  }

  render () {
    return <div>
      {this.props.playbackControlStatus === "loading" &&
        <span>{this.props.loadingStatus != "0" ? this.props.loadingStatus : ""}</span>
      }
      
      {this.props.playbackControlStatus !== "loading" && (this.props.showControls || this.props.playbackControlStatus === "playing") &&
        <Button 
          type="round" 
          icon={this.props.playbackControlStatus === "playing" ? "pause" : "play"}
          onClick={()=>{this.handlePlayPause()}}
        />
      }

      {this.props.playbackControlStatus !== "loading" && (this.props.showControls || this.props.playbackControlStatus === "playing") && this.props.playbackControlStatus !== "ready" &&
        <Button 
          type="round" 
          icon="rewind"
          onClick={()=>{this.handleRewind()}}
        />
      }
    </div>
  }
}
