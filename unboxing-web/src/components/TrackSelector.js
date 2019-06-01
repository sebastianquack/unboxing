import React from 'react';

export class TrackSelector extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {

    const selectors = this.props.tracks.map((track, index)=>
      <div key={index}>
        <label>{track.trackName}</label>
        <input
          type="checkbox"
          checked={this.props.activeTracks[index]}
          onChange={()=>this.props.handleTrackToggle(index)} 
        />
      </div>
    );
    
    return <div>
      {selectors}
    </div>
  }
}
