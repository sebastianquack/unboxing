import React from 'react';
import styled from 'styled-components';

import { loadInstruments } from '../helpers';
import { Figure } from './'

const sidePadding = '10vw';
const topPadding = '15%';
const bottomPadding = '0px';

const instruments = loadInstruments();

export class Stage extends React.PureComponent {

  render() {

    const tracksInstruments = this.props.tracks.map((track, index)=> ({
      key: index,
      instrument: instruments[track.trackName.replace("full-", "")],
      trackName: track.trackName.replace("full-", ""),
      active: this.props.activeTracks[index],
      action: track.action
    }))

    const figures = tracksInstruments.map( item =>
      <Figure
        key={item.key}
        instrument={item.instrument}
        trackName = {item.trackName}
        active={item.active}
        action={item.action}
        bpm={this.props.bpm}
      />
    );
    return <Container>
      <FiguresContainer>
        { figures }
      </FiguresContainer>
    </Container>
  }
}

const Container = styled.div`
  border-radius: 50%;
  background-color: black;
  width: 100%;
  height: 100%;
  position: relative;
`

const FiguresContainer = styled.div`
  position: relative;
  /*background-color: red;*/
  box-sizing: border-box;
  margin: auto;
  top: ${topPadding};
  height: calc(100% - ${topPadding} - ${bottomPadding});
  min-height: 50%;
  width: calc(100% - ${sidePadding});
  max-width: calc(100vw - ${sidePadding});
`