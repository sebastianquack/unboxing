import React from 'react';

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
        <span>loading...</span>
      }
      
      {this.props.playbackControlStatus !== "loading" &&
        <input 
          type="button" 
          value={this.props.playbackControlStatus === "playing" ? "pause" : "play"}
          onClick={()=>{this.handlePlayPause()}}
        />
      }

      {this.props.playbackControlStatus !== "loading" &&
        <input 
          type="button" 
          value="rewind"
          onClick={()=>{this.handleRewind()}}
        />
      }
    </div>
  }
}
