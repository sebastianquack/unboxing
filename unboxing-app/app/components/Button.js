import React, { Component } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions, colors} from '../../config/globalStyles';
import UIText from './UIText'

import buttonPlayImg from '../../assets/img/button.png'
import buttonHomeImg from '../../assets/img/homebutton.png'
import buttonChangeImg from '../../assets/img/changeButtonNew.png'
import buttonWideImg from '../../assets/img/wideButton.png'
import blankRoundButtonImg from '../../assets/img/blankRoundButton.png'

import muteButtonImg from '../../assets/img/mute_on.png'
import muteButtonImgOff from '../../assets/img/mute_off.png'

import walkIcon from '../../assets/img/Walk.png'
import playIcon from '../../assets/img/Play.png'
import backIcon from '../../assets/img/Back.png'
import walkLeft from '../../assets/img/WalkLeft.png'

const buttons = {
  "home": buttonHomeImg,
  "change": buttonChangeImg,
  "wide": buttonWideImg,
  "check-in": blankRoundButtonImg,
  "play": blankRoundButtonImg,
  "leave": blankRoundButtonImg,
  "mute": blankRoundButtonImg,
}


class Button extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const type = this.props.type || Object.keys(buttons)[0]

    const textStyle = (type == "wide") ? 
      // text styles for wide button
      {
        color: colors.turquoise
      } 
      : 
      // text styles for other buttons
      {
        color: "#777"
      };

    const textPosition = (type == "wide") ? 
      {
        top: -63
      }
      : 
      {

      };

    let buttonStyle = {};
    if(type == "mute") {
      buttonStyle = {
        width: 60,
        height: 60,
      }
    }

    return <View style={this.props.style}><TouchableOpacity onPress={this.props.onPress}> 
      <Image source={buttons[type]} style={buttonStyle}/>
      {type == "check-in" &&
          <Image 
            style={{position: "absolute", top: 47, left: 49}}
            source={walkIcon} 
          />
      }
      {type == "play" &&
          <Image 
            style={{position: "absolute", top: 47, left: 49}}
            source={playIcon} 
          />
      }
      {type == "leave" &&
          <Image 
            style={{position: "absolute", top: 47, left: 49}}
            source={walkLeft} 
          />
      }
      {type == "mute" &&
          <Image 
            style={{position: "absolute", top: 15, left: 15, width: 30, height: 30}}
            source={this.props.muted ? muteButtonImg : muteButtonImgOff} 
          />
      }
      <View style={{...textPosition, flexDirection: "row", justifyContent: "center"}}>
        {this.props.back && <Image style={{width: 19, height: 19, marginTop: 5, marginRight: 8}} source={backIcon}/>}
        <UIText caps wide strong align="center" style={textStyle}>{this.props.text}</UIText>
      </View>
    </TouchableOpacity></View>
  }
}

Button.propTypes = {
  type: PropTypes.oneOf(Object.keys(buttons)),
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default Button;
