import React from 'react';
import styled from 'styled-components';

import { UIText } from './'
import { breakpoints, colors } from '../config/globalStyles'

export class Welcome extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.handleButtonPress = this.handleButtonPress.bind(this)
  }

  handleButtonPress(event) {
    this.props.navigateTo("challenges")
  }

  render () {
    return <Container>
      <WithLine>
        <UIText styleKey="big-title-top">
          Mahler Chamber Orchestra
        </UIText>
        <UIText styleKey="big-title-main">
          Mozart<br />
          Momentum
        </UIText>
      </WithLine>
      <FixedWidth>
        <UIText styleKey="big-title-subtitle">
          Eine visuelle und akkustische Reise durch Mozarts Werk.
        </UIText>   
      </FixedWidth>   
      <button onClick={this.handleButtonPress}>
        Let's play
      </button>
    </Container>
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 15vh;
  left: 15vw;
`

const WithLine = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  &::after {
    content: "";
    background-color: ${ colors.turquoise };
    height: 95.25%;
    position: absolute;
    left: -22px;
    width: 4px;
    @media (${breakpoints.large}) {
      left: -26px;
    width: 5px;
    }
  }
  *:first-child {
    position: relative;
    top: -0.5ex;
  }
  *:last-child {
    position: relative;
    /*top: 0.25ex;*/
    left: -0.14ex;
  }
  margin-bottom: 1em;
`

const FixedWidth = styled.div`
  width: 300px;
  @media (${breakpoints.large}) {
    width: 400px;
  }
`
