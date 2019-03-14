import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';
import UIText from './UIText'

class StatusBar extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <View style={{
        width: "100%",
        flexDirection: "column"
      }}>
      <View className="firstSection" style={{
          flexDirection: "column" 
        }}>
        <UIText size="m" em caps wide >{this.props.title}</UIText>
        <UIText size="s" em caps>{this.props.description}</UIText>
      </View>

    </View>
  }
}

StatusBar.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export default StatusBar;
