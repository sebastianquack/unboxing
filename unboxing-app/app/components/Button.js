import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

import buttonImg from '../../assets/img/button.png'

class Button extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <TouchableOpacity onPress={this.props.onPress}>
      <Image source={buttonImg} />
      <Text style={{color: "white", textAlign:"center"}}>{this.props.text}</Text>
    </TouchableOpacity>
  }
}

Button.propTypes = {
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default Button;
