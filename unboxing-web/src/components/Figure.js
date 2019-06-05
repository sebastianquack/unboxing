import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const imgPaths = {
  left:   '/images/figurLinks.png',
  right:  '/images/figurRechts.png',
  center: '/images/figurFrontal.png'
} 

export class Figure extends React.PureComponent {
  constructor() {
    super()
  }

  render() {
    console.log("render figure")

    const instrument = this.props.instrument
    const direction = instrument.direction || "center"
    const xPos = Number.isInteger(instrument.xPos) ? instrument.xPos : xPercentageToPos(Math.random()*100) // xPos is between -100 and +100
    const yPos = Number.isInteger(instrument.yPos) ? instrument.yPos : yPercentageToPos(Math.random()*100) // yPos is between 0 and +100, starting from bottom (where the conductor is)
    
    const xPosPercentage = xPosToPercentage(xPos)
    const yPosPercentage = yPosToPercentage(yPos)
    const src = imgPaths[direction]
    return <Container 
        xPosPercentage={xPosPercentage} 
        yPosPercentage={yPosPercentage}
        active={this.props.active}
        title={this.props.trackName} 
      >
        <Img  
          src={src}
          title={this.props.trackName} 
        />
      </Container>
  }
}

Figure.propTypes = {
  instrument: PropTypes.object, //instrument object from config
  active: PropTypes.bool
};


const Container = styled.span`
  display: block;
  position: absolute;
  opacity: ${ props => props.active ? 1 : 0 };
  left: ${ props => props.xPosPercentage }%;
  bottom: ${ props => props.yPosPercentage  }%;
  width: calc(40px + 8vw);
  max-width: 16vw;
  height: auto;
  transform: translateX(-50%);
  transition: opacity 0.2s;
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
  width: calc(40px + 8vw);
  max-width: 16vw;
  height: auto;
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
