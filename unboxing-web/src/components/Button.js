import React from 'react';
import styled from 'styled-components'

const types = {
  "round": "/images/blankRoundButton.png",
  "left": "/images/left_button.png",
  "right": "/images/right_button.png",
  "down": "/images/More.png",
  "up": "/images/Less.png",
  "close": "/images/Close.png",
  "menu": "/images/Menu.png",
  "menu-close": "/images/Close.png",
  "menu-section-close": "/images/Menu_close.png",
  "menu-section-open": "/images/Menu_open.png",
  "soft-square": "/images/buttonSoftsquare.svg"
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
        className={{...this.props.className}}
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
        {this.props.type === "soft-square" && <ButtonText>{this.props.children}</ButtonText>}

      </ButtonContainer>
    )
  }

}

function buttonDimension(key) {
  if(key == "round") return "50px";
  if(key == "menu-close" || key == "menu-section-close" || key == "menu-section-open") return "48px";
  if(key == "soft-square") return "100px";
  return "30px";
}

const ButtonContainer = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => buttonDimension(props.type)};
  height: ${props => buttonDimension(props.type)};
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
  height: auto;  
  user-select: none;
`

const ButtonText = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;  
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
