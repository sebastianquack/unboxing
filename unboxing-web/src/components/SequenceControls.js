import React from 'react';

export class SequenceControls extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    return <div>
      <input 
        type="button" 
        value={this.props.playbackControlStatus === "playing" ? "pause" : "play"}
        onClick={()=>{this.props.handlePlayPause()}}
      />
      <input 
        type="button" 
        value="rewind"
        onClick={()=>{this.props.handleRewind()}}
      />
    </div>
  }
}
