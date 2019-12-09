import React from 'react';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

import { breakpoints, colors } from '../config/globalStyles'

export class Background extends React.PureComponent {
  constructor() {
    super()
    this.state = {}
    this.previousColor = null;
  }


  render () {
    const {color, flow} = this.props

    this.previousColor = color

    return <Container >
      {flow && <BackgroundVideo autoPlay loop={true}>
        <source src="/images/Mozartfeld_Loop.mp4" type="video/mp4"/>
      </BackgroundVideo>}
      
      <GradientActive show={color === "active"} />
      <GradientPassive show={color === "passive"} />
      <GradientComplementaryBlackout show={color === "blackout"} />
    </Container>
  }
}

Background.propTypes = {
  color: PropTypes.oneOf(["active", "passive", "none", "blackout"]),
  flow: PropTypes.bool
};

const timing_in = "cubic-bezier(0.390, 0.575, 0.565, 1.000)";
const timing_out = "cubic-bezier(0.345, 0.005, 0.720, 0.585)";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`

const BackgroundVideo = styled.video`
  width: 100%;
  height: 100%;
  transform: scale(1.1);
  object-fit: cover;
`

const GradientActive = styled.div`
  transition: all 0.2s ease-in-out;
  background: linear-gradient(180deg, rgba(223, 75, 71, 0) -0.56%, #DF4B47 76.62%, #FFCE51 100.67%);
  opacity: ${ props => props.show ? 1 : 0 };
  height: 55%;
  width: 100%;
  bottom: 0;
  position: absolute;
`

const GradientPassive = styled.div`  
  transition: all 0.2s ease-in-out;
  background: linear-gradient(180deg, #000000 -0.56%, #13293C 37.73%, #02AA9E 100.67%);
  opacity: ${ props => props.show ? 1 : 0 };
  height: 55%;
  width: 100%;
  bottom: 0;
  position: absolute;
`

const GradientComplementaryBlackout = styled.div`
  background: linear-gradient(180deg,#000 0%, #000e 53%,#0000 100%);
  opacity: ${ props => props.show ? 1 : 0 };
  height: 63%;
  width: 100%;
  top: 0;
  position: absolute;
`