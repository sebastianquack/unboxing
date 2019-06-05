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
    const xPos = Number.isInteger(instrument.xPos) ? instrument.xPos: (Math.random()-0.5)*200 // xPos is between -100 and +100
    const yPos = Number.isInteger(instrument.yPos) ? instrument.yPos: Math.random()*100 // yPos is between 0 and +100, starting from bottom (where the conductor is)
    
    const xPosPercentage = 100 * ((xPos / 200) + 0.5)
    const yPosPercentage = yPos
    const src = imgPaths[direction]
    console.log(xPos, xPosPercentage)
    return <Img 
      xPosPercentage={xPosPercentage} 
      yPosPercentage={yPosPercentage}
      active={this.props.active}
      src={src}
      title={this.props.instrument.name_de}
    />
  }
}

Figure.propTypes = {
  instrument: PropTypes.object, //instrument object from config
  active: PropTypes.bool
};


const Img = styled.img`
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
    content: attr(title) " ";
  }
`