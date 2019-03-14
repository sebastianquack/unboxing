import React, { Component } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

import frameImg from '../../assets/img/frame.png'
import frameSecondaryImg from '../../assets/img/frameSecondary.png'

const primaryScreenWidth = Math.floor(dimensions.screenWidth * 0.91)
const primaryScreenLeft = Math.floor((dimensions.screenWidth - primaryScreenWidth) / 2)
const primaryScreenHeight = Math.floor(dimensions.screenHeight * 0.59)
const primaryScreenTop = Math.floor(dimensions.screenHeight * 0.035)

const secondaryScreenWidth = Math.floor(dimensions.screenWidth * 0.25)
const secondaryScreenLeft = Math.floor((dimensions.screenWidth - secondaryScreenWidth) / 2)
const secondaryScreenHeight = Math.floor(dimensions.screenHeight * 0.235)
const secondaryScreenTop = Math.floor(dimensions.screenHeight * 0.571)

class ScreenContainer extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderPrimaryScreen = this.renderPrimaryScreen.bind(this)
    this.renderSecondaryScreen = this.renderSecondaryScreen.bind(this)
  }

  renderPrimaryScreen() {
    if (!this.props.primaryScreen) return null

    return <View style={{
        position: 'absolute',
        left:   primaryScreenLeft,
        width:  primaryScreenWidth,
        height: primaryScreenHeight,
        top:    primaryScreenTop,
        zIndex: 10,
      }}>
      {this.props.primaryScreen}
    </View>
  }

  renderSecondaryScreen() {
    if (!this.props.secondaryScreen) return null

    return <View style={{
        position: 'absolute',
        left:   secondaryScreenLeft,
        width:  secondaryScreenWidth,
        height: secondaryScreenHeight,
        top:    secondaryScreenTop,
        backgroundColor: "#000",
        zIndex: 11,
      }}>
      {this.props.secondaryScreen}
    </View>
  }

  render() {
    const source = this.props.secondaryScreen ? frameSecondaryImg : frameImg
    return (
      <View style={{
        backgroundColor: '#333'
      }}>
        <Image
          source={source}
          style={{
            width: dimensions.screenWidth, 
            height: dimensions.screenHeight,
            zIndex: 50
          }}
        />
        {this.renderPrimaryScreen()}
        {this.renderSecondaryScreen()}
      </View>
    );
  }
}

ScreenContainer.propTypes = {
  primaryScreen: PropTypes.node,
  secondaryScreen: PropTypes.node,
  buttonLeft: PropTypes.node,
  buttonRight: PropTypes.node,
};

export default ScreenContainer;
