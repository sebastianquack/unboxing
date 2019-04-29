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

import walkIcon from '../../assets/img/Walk.png'
import playIcon from '../../assets/img/Play.png'

const buttons = {
  "home": buttonHomeImg,
  "change": buttonChangeImg,
  "wide": buttonWideImg,
  "check-in": blankRoundButtonImg,
  "play": blankRoundButtonImg,
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

    return <TouchableOpacity onPress={this.props.onPress}>
      <Image source={buttons[type]} />
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
      <View style={textPosition}>
        <UIText backIcon={this.props.back} caps wide strong align="center" style={textStyle}>{this.props.text}</UIText>
      </View>
    </TouchableOpacity>
  }
}

Button.propTypes = {
  type: PropTypes.oneOf(Object.keys(buttons)),
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default Button;
