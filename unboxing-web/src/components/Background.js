import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { breakpoints, colors } from '../config/globalStyles'

export class Background extends React.Component {
  constructor() {
    super()
    this.state = {}
  }


  render () {
    const {color, flow} = this.props

    return <Container >
      <Gradient color={color} />
    </Container>
  }
}

Background.propTypes = {
  color: PropTypes.oneOf(["active", "passive", "none"]),
  flow: PropTypes.bool
};



const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Gradient = styled.div`
  background: ${ props => {
    if (props.color == "active") return "linear-gradient(180deg, rgba(223, 75, 71, 0) -0.56%, #DF4B47 76.62%, #FFCE51 100.67%)";
    else if (props.color == "passive") return "linear-gradient(180deg, #000000 -0.56%, #13293C 37.73%, #02AA9E 100.67%)";
    else return "none" 
  }};
  height: 55%;
  width: 100%;
  bottom: 0;
  position: absolute;
`