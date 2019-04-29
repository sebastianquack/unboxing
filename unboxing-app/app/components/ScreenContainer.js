import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

import frameImg from '../../assets/img/ShapeScreenAlternative.png'
import frameSecondaryImg from '../../assets/img/ShapeScreenMain.png'

import LanguageSwitcher from './LanguageSwitcher';

const primaryScreenWidth = Math.floor(dimensions.screenWidth * 0.91)
const primaryScreenLeft = Math.floor((dimensions.screenWidth - primaryScreenWidth) / 2)
const primaryScreenHeight = Math.floor(dimensions.screenHeight * 0.59)
const primaryScreenTop = Math.floor(dimensions.screenHeight * 0.035)

const modalWidth = Math.floor(dimensions.screenWidth)
const modalTop = Math.floor(dimensions.screenHeight * 0.1)
const modalLeft = Math.floor((dimensions.screenWidth - modalWidth) / 2)
const modalHeight = Math.floor(dimensions.screenHeight * 0.9)

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

const buttonModalLeft = Math.floor(dimensions.screenWidth * 0.37)
const buttonModalTop = Math.floor(dimensions.screenHeight * 0.8)

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
        zIndex: 12,
      }}>
      {this.props.statusBar}
    </View>    
  }

  renderModal() {
    if (!this.props.modalContent) return null
    return <View style={{
        position: 'absolute',
        left:   modalLeft,
        width:  modalWidth,
        top:    modalTop,
        height: modalHeight,
        backgroundColor: "#000",
        zIndex: 11,
      }}>
      { this.props.modalContent }
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

  renderButtonModal() {
    if (!this.props.buttonModal) return null;
    return <View style={{
        position: 'absolute',
        left:   buttonModalLeft,
        top:    buttonModalTop,
        zIndex: 51,
      }}>
      {this.props.buttonModal}
    </View>
  }

  renderLanguageSwitcher() {
    return <View style={{
        position: 'absolute',
        left:   325,
        bottom:  50,
        zIndex: 51,
        opacity: 1
      }}>
      <LanguageSwitcher/>
    </View>
  }

  render() {
    const source = this.props.secondaryScreen ? frameSecondaryImg : frameImg
    return (
      <View style={{
          backgroundColor: '#000',
          width: dimensions.screenWidth, 
          height: dimensions.screenHeight,
        }}>
        {!this.props.modalContent &&
          <View pointerEvents="none" style={{zIndex:50}}>
            <Image
              source={source}
              style={{
                width: dimensions.screenWidth, 
                height: dimensions.screenHeight,
              }}
            />
           </View> 
        }
        {!this.props.modalContent && this.renderPrimaryScreen()}
        {!this.props.modalContent && this.renderSecondaryScreen()}
        {!this.props.modalContent && this.renderButtonLeft()}
        {!this.props.modalContent && this.renderButtonMid()}
        {!this.props.modalContent && this.renderButtonRight()}
        {this.renderModal()}
        {this.renderButtonModal()}
        {this.renderStatusBar()}
        {!this.props.modalContent && this.renderLanguageSwitcher()}
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
  statusBar: PropTypes.node,
  buttonModal: PropTypes.node
};

export default ScreenContainer;
