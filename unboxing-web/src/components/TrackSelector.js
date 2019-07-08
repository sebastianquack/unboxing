import React from 'react';
import styled from 'styled-components'

import { loadInstruments } from '../helpers';
import { UIText, LocaleText, HorizontalScrollContainer } from './'
import { breakpoints } from '../config/globalStyles'

const instruments = loadInstruments();

class InstrumentButton extends React.Component {

  render () { return(
      <InstrumentButtonContainer
        onClick={this.props.onToggle} 
        style={{
          opacity: this.props.active ? 0.5 : 1,
        }}
      >
        <Img 
          src={instruments[this.props.trackName] && instruments[this.props.trackName].image} 
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

export class TrackSelector extends React.PureComponent {
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
        onToggle={()=>this.props.toggleTrack(index)} 
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
  user-select: none;
  white-space: pre;
  background-image: url("/images/Rectangle 2.3.png");
  background-repeat: no-repeat;
  background-size: 100%;
  transition: opacity 0.1s;
  :hover {
    cursor: pointer;
  };
  min-width: 60px;
  @media (${breakpoints.large}) {
    min-width: 100px;
  }
`

const Img = styled.img`
  width: 90%;
  margin-top: 3%;
  margin-bottom: 16%;
  height: auto;
  user-select: none;
  border-radius: 50%;
`