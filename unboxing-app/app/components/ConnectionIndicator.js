import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';
import UIText from './UIText'

import connectionsIcon from '../../assets/img/Label-Icon.png'

class ConnectionIndicator extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <View style={{
        flexDirection: "column",
        alignItems: "center",
        width: 93,
        marginRight: 20
      }}>
        <Image
            source={connectionsIcon} 
          />  
        <UIText style={{
          top: -35, 
          color: "#F3DFD4"
        }} size="m" strong em>{this.props.current} / {this.props.max}</UIText>
    </View>
  }
}

ConnectionIndicator.propTypes = {
  current: PropTypes.number,
  max: PropTypes.number,
};

export default ConnectionIndicator;
