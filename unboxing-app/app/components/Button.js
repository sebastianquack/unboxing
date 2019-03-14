import React, { Component } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';
import UIText from './UIText'

import buttonPlayImg from '../../assets/img/button.png'
import buttonHomeImg from '../../assets/img/homebutton.png'
import buttonChangeImg from '../../assets/img/changebutton.png'

const buttons = {
  "play": buttonPlayImg,
  "home": buttonHomeImg,
  "change": buttonChangeImg
}

class Button extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const type = this.props.type || Object.keys(buttons)[0]
    return <TouchableOpacity onPress={this.props.onPress}>
      <Image source={buttons[type]} />
      <UIText caps wide strong align="center" style={{color: "#777"}}>{this.props.text}</UIText>
    </TouchableOpacity>
  }
}

Button.propTypes = {
  type: PropTypes.oneOf(Object.keys(buttons)),
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default Button;
