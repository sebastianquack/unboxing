import React from 'react';
import styled from 'styled-components';

import { LocaleText, UIText } from './';
import { loadInstruments } from '../helpers';
import { colors } from '../config/globalStyles'

const instruments = loadInstruments();

export class Visualizer extends React.PureComponent {
  constructor() {
    super()
  }

  render() {
    return <Container> 
      <TracksContainer> 
      { this.props.tracks.map( track => (
        <Track key={track.trackName}>
          <Instrument styleKey="visualizer-instrument">
            <LocaleText object={instruments[track.trackName.replace("full-", "")]} field="name" />
          </Instrument>
          <ItemsTrack>
            { track.items.map( item =>  
              <Item 
                key={item._id}
                start={item.startTime}
                duration={item.duration}
                sequenceDuration={this.props.duration}
              />
            )}
          </ItemsTrack>
        </Track>
        ))
      }
      </TracksContainer>
      <Cursor 
        show={this.props.playbackControlStatus==="playing"}
      />
    </Container>
  }
}

const trackHeaderWidth = "100px"

const Container = styled.div`
  /*background-color: rgba(255,25,255,0.4);*/
  height: 100%;
  position: relative;
`

const TracksContainer = styled.ol`
  /*background-color: rgba(255,25,255,0.4);*/
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Track = styled.li`
  display: flex;
  flex: 1;
  padding: 0.5vh 0;
  box-sizing: border-width;
`

const Instrument = styled(UIText)`
  display: block;
  opacity: 0.4;
  width: ${ trackHeaderWidth }; /* make this lower if you want to overlap with items */
  overflow: visible;
  white-space: nowrap;
`

const ItemsTrack = styled.ol`
  flex:1;
  border: solid 0 rgba(255,255,255,0.4);
  position: relative;
  border-top-width: 1px;
  border-bottom-width: 1px;
  /*${Track}:first-child &{
    border-top-width: 1px;
  }*/
`
const Item = styled.li`
  border-radius: 4px;
  position: absolute;
  border: solid white 1px;
  height: 100%;
  left: ${ props => 100 * props.start/props.sequenceDuration }%;
  width: ${ props => 100 * props.duration/props.sequenceDuration }%;
`

const Cursor = styled.div`
  display: ${ props => props.show ? "block" : "none"};
  width: 3px;
  height: 100%;
  background-color: ${ colors.turquoise };
  position: absolute;
  left: ${ trackHeaderWidth };
  top:0;
`