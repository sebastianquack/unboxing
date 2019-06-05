import React from 'react';
import styled from 'styled-components'

const types = {
  "round": "/images/blankRoundButton.png",
  "left": "/images/left_button.png",
  "right": "/images/right_button.png",
  "down": "/images/More.png",
  "up": "/images/Less.png",
  "close": "/images/Close.png",
}

const icons = {
  "pause": "/images/Pause.png",
  "play": "/images/Play.png",
  "rewind": "/images/rewind.png"
}

export class Button extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {

    return (
      <ButtonContainer
        onClick={this.props.onClick}
        style={{...this.props.style}}
        type={this.props.type}
      > 
        <ButtonImage 
          src={types[this.props.type]}
          alt={this.props.type}
        />
        {this.props.type === "round" && <ButtonIcon 
          src={icons[this.props.icon]}
          alt={this.props.icon}
        />}

      </ButtonContainer>
    )
  }


}


const ButtonContainer = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => props.type === "round" ? "50px" : "30px"};
  height: ${props => props.type === "round" ? "50px" : "30px"};
  :hover {
    cursor: pointer;
  }
  :active {
    opacity: 0.5;
  }
  user-select: none;
`

const ButtonImage = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;  
  user-select: none;
`

const ButtonIcon = styled.img`
  position: absolute;
  left: 33%;
  top: 33%;
  width: 33%;
  height: 33%;  
  user-select: none;
`
