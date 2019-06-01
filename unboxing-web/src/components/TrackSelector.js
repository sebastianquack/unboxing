import React from 'react';

import { loadInstruments } from '../helpers';

let instruments = loadInstruments();

class InstrumentButton extends React.Component {

  render () { return(
      <div
        onClick={this.props.onToggle} 
        style={{
          opacity: this.props.active ? 1 : 0.5,
          display: "inline-flex",
          flexDirection: "column",
          margin: 10,
          alignItems: "center",
          width: 100
        }}
      >
        <img 
          src={instruments[this.props.trackName].image} 
          style={{width:50, height: 50}}
          alt={this.props.trackName}
        />
        <label>{instruments[this.props.trackName].name_de}</label>
      </div>
  )}
}

export class TrackSelector extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {

    const selectors = this.props.tracks.map((track, index)=>
      <InstrumentButton
        key={index}
        trackName={track.trackName.replace("full-", "")}
        active={this.props.activeTracks[index]}
        onToggle={()=>this.props.handleTrackToggle(index)} 
      />
    );
    
    return <div>
      {selectors}
    </div>
  }
}
