import React from 'react';
import styled from 'styled-components';

import { loadInstruments } from '../helpers';
import { UIText, LocaleText, HorizontalScrollContainer } from './'

const instruments = loadInstruments();

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
        <label>
          <UIText style={{textAlign: "center", display: "inline-flex"}} styleKey="instrument-select">
            <LocaleText object={instruments[this.props.trackName]} field="name" />
          </UIText>
        </label>
      </div>
  )}
}

export class TrackSelector extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.handleTrackToggle = this.handleTrackToggle.bind(this);
  }

  handleTrackToggle(index) {
    let activeTracks = this.props.activeTracks;
    activeTracks[index] = !activeTracks[index];
    this.props.updateActiveTracks(activeTracks);
  }

  render () {  
    const selectors = this.props.tracks.map((track, index)=>
      <InstrumentButton
        key={index}
        trackName={track.trackName.replace("full-", "")}
        active={this.props.activeTracks[index]}
        onToggle={()=>this.handleTrackToggle(index)} 
      />
    );
    
    return(
      <FixedAtBottom>
        <HorizontalScrollContainer>
          {selectors}
        </HorizontalScrollContainer>
      </FixedAtBottom>
      
    )
      
  }
}

const FixedAtBottom = styled.div`
  position: fixed;
  bottom: 10px;
  width: 100%;
`