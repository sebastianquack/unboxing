import React from 'react';
import styled from 'styled-components';

import { loadInstruments } from '../helpers';
import { Figure } from './'

const sidePadding = '10vw';
const topPadding = '15%';
const bottomPadding = '0px';

const instruments = loadInstruments();

export class Stage extends React.PureComponent {
  constructor() {
    super()
  }

  render() {
    const figures = this.props.tracks.map((track, index)=>
      <Figure
        key={index}
        instrument={instruments[track.trackName.replace("full-", "")]}
        active={this.props.activeTracks[index]}
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
`

const FiguresContainer = styled.div`
  position: relative;
  /*background-color: red;*/
  box-sizing: border-box;
  margin: auto;
  top: ${topPadding};
  height: calc(100% - ${topPadding} - ${bottomPadding});
  min-height: (50%);
  width: calc(100% - ${sidePadding});
  max-width: calc(100vw - ${sidePadding});
`