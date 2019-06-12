import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import PropTypes from 'prop-types';

import { breakpoints } from '../config/globalStyles'

const imgPaths = {
  idle: {
    left:   '/images/figurLinks.png',
    right:  '/images/figurRechts.png',
    center: '/images/figurFrontal.png'
  },
  play: {
    left:   '/images/figurLinks.png',
    right:  '/images/figurRechts.png',
    center: '/images/figurFrontal.png'
  }
} 

export class Figure extends React.PureComponent {
  constructor() {
    super()
  }

  render() {

    const instrument = this.props.instrument
    if(!instrument) return null
      
    const direction = instrument.direction || "center"
    const xPos = Number.isInteger(instrument.xPos) ? instrument.xPos : xPercentageToPos(Math.random()*100) // xPos is between -100 and +100
    const yPos = Number.isInteger(instrument.yPos) ? instrument.yPos : yPercentageToPos(Math.random()*100) // yPos is between 0 and +100, starting from bottom (where the conductor is)

    const xPosPercentage = xPosToPercentage(xPos)
    const yPosPercentage = yPosToPercentage(yPos)
    const src = imgPaths[this.props.action || "idle"][direction]
    return <Container 
        xPosPercentage={xPosPercentage} 
        yPosPercentage={yPosPercentage}
        active={this.props.active}
        title={this.props.trackName + "/" + this.props.action}
      >
        <Img  
          src={src}
          title={this.props.trackName}
          action={this.props.action}
          bpm={this.props.bpm}
        />
      </Container>
  }
}

Figure.propTypes = {
  instrument: PropTypes.object, //instrument object from config
  active: PropTypes.bool
};

const playAnim = keyframes`
  0% {
    transform: translateY(0%);
  }

  25% {
    transform: translateY(5%);
  }

  75% {
    transform: translateY(-5%);
  }

  100% {
    transform: translateY:(0%);
  }

`;

const Container = styled.span`
  display: block;
  position: absolute;
  opacity: ${ props => props.active ? 1 : 0 };
  left: ${ props => props.xPosPercentage }%;
  bottom: ${ props => props.yPosPercentage  }%;
  z-index: ${ props => 100-Math.floor(props.yPosPercentage) };
  transform: translateX(-50%);
  transition: opacity 0.2s;
  width: calc(50px + 10vw);
  max-width: 14vw;
  @media (${breakpoints.large}) {
    width: calc(30px + 7vw);
    max-width: 12vw;
  }
  ::after{
    content: attr(title);
    color: #444;
    position: absolute;
    top: 10%;
    left: -10%;
    text-align: left;
    width: 100%;
    font-size: 11px;
    transform: rotateZ(-90deg);
  }
`

const Img = styled.img`
  display: block;
  width: inherit;
  max-width: inherit;
  height: auto;
  filter:  ${ props => props.action === "idle" ? "grayscale(50%)" : "none" };
  animation: ${ props => props.action === "idle" ? "none" : css`${ playAnim } ${ 120 / props.bpm }s linear infinite` };
  /*transition: translate 0.2s;*/
`

const xPosToPercentage = function(xPos) {
  return 100 * ((xPos / 200) + 0.5)
}

const yPosToPercentage = function(yPos) {
  return yPos
}

const xPercentageToPos = function(xPerc) {
  return (xPerc * 2) - 100
}

const yPercentageToPos = function(yPerc) {
  return yPerc
}
