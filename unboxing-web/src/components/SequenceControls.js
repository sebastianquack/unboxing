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
      this.props.updateControlStatus("playing")
    } else {
      this.props.updateControlStatus("paused")
    }
  }
  
  handleRewind() {
    this.props.updateControlStatus("ready");
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
