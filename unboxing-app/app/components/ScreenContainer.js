import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
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

const statusBarWidth = Math.floor(dimensions.screenWidth * 0.8)
const statusBarLeft = Math.floor((dimensions.screenWidth - statusBarWidth) / 2)
const statusBarTop = Math.floor(dimensions.screenHeight * 0.05)

const buttonLeftLeft = Math.floor(dimensions.screenWidth * 0.1)
const buttonLeftTop = Math.floor(dimensions.screenHeight * 0.7)

const buttonMidLeft = Math.floor(dimensions.screenWidth * 0.4355)
const buttonMidTop = Math.floor(dimensions.screenHeight * 0.76)

const buttonRightLeft = Math.floor(dimensions.screenWidth * 0.7)
const buttonRightTop = Math.floor(dimensions.screenHeight * 0.7)

class ScreenContainer extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderPrimaryScreen = this.renderPrimaryScreen.bind(this)
    this.renderSecondaryScreen = this.renderSecondaryScreen.bind(this)
    this.renderButtonLeft = this.renderButtonLeft.bind(this)
    this.renderButtonMid = this.renderButtonMid.bind(this)
    this.renderButtonRight = this.renderButtonRight.bind(this)
    this.renderStatusBar = this.renderStatusBar.bind(this)
  }

  renderStatusBar() {
    if (!this.props.statusBar) return null
      return <View style={{
        position: 'absolute',
        left:   statusBarLeft,
        width:  statusBarWidth,
        top:    statusBarTop,
        // backgroundColor: "red",
        zIndex: 11,
      }}>
      {this.props.statusBar}
    </View>    
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
      }} >
      { this.props.primaryScreen }
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

  renderButtonLeft() {
    return <View style={{
        position: 'absolute',
        left:   buttonLeftLeft,
        top:    buttonLeftTop,
        zIndex: 51,
      }}>
      {this.props.buttonLeft}
    </View>
  }

  renderButtonRight() {
    return <View style={{
        position: 'absolute',
        left:   buttonRightLeft,
        top:    buttonRightTop,
        zIndex: 51,
      }}>
      {this.props.buttonRight}
    </View>
  }

  renderButtonMid() {
    return <View style={{
        position: 'absolute',
        left:   buttonMidLeft,
        top:    buttonMidTop,
        zIndex: 51,
      }}>
      {this.props.buttonMid}
    </View>
  }

  render() {
    const source = this.props.secondaryScreen ? frameSecondaryImg : frameImg
    return (
      <View style={{
        backgroundColor: '#333',
      }}>
        <View pointerEvents="none" style={{zIndex:50}}>
          <Image
            source={source}
            style={{
              width: dimensions.screenWidth, 
              height: dimensions.screenHeight,
            }}
          />
        </View>
        {this.renderPrimaryScreen()}
        {this.renderSecondaryScreen()}
        {this.renderStatusBar()}
        {this.renderButtonLeft()}
        {this.renderButtonMid()}
        {this.renderButtonRight()}
      </View>
    );
  }
}

ScreenContainer.propTypes = {
  primaryScreen: PropTypes.node,
  secondaryScreen: PropTypes.node,
  buttonLeft: PropTypes.node,
  buttonMid: PropTypes.node,
  buttonRight: PropTypes.node,
  statusBar: PropTypes.node
};

export default ScreenContainer;
