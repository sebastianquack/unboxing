import React from 'react';
import styled from 'styled-components'

import { loadInstruments } from '../helpers';
import { UIText, LocaleText, HorizontalScrollContainer } from './'

const instruments = loadInstruments();

class InstrumentButton extends React.Component {

  render () { return(
      <InstrumentButtonContainer
        onClick={this.props.onToggle} 
        style={{
          opacity: this.props.active ? 1 : 0.5,
        }}
      >
        <img 
          src={instruments[this.props.trackName].image} 
          style={{width:75, height: 75, userSelect: "none"}}
          alt={this.props.trackName}
        />
        <label>
          <UIText style={{textAlign: "center", display: "inline-flex"}} styleKey="instrument-select">
            <LocaleText object={instruments[this.props.trackName]} field="name" />
          </UIText>
        </label>
      </InstrumentButtonContainer>
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
        <HorizontalScrollContainer>
          {selectors}
        </HorizontalScrollContainer>
    )
      
  }
}

const InstrumentButtonContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin: 10px;
  align-items: center;
  min-width: 100px;
  user-select: none;
  :hover {
    cursor: pointer;
  };
`