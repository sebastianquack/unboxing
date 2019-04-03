import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions, colors, fontSizes } from '../../config/globalStyles';
import UIText from './UIText'

const squareStyle = {
  width: fontSizes.m - 4,
  height: fontSizes.m - 4,
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 3,
  borderColor: colors.warmWhite,
  position: "relative",
  top: 8
}

const squareActiveStyle = {
  ...squareStyle,
  borderColor: colors.turquoise
}

class StatusBar extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    const squares = []
    for (let i=0; i < this.props.steps; i++) {
      if (i > 0) {
        squares.push(<UIText key={i+100} size="m">-</UIText>)
      }
      squares.push(<View key={i} style={ i === this.props.currentStep ? squareActiveStyle : squareStyle } />)
    }

    return <View style={{
        width: "100%",
        flexDirection: "row",
      }}>
      <View className="firstSection" style={{
          flexDirection: "column" ,
          flex: 1,
        }}>
        <UIText size="m" em caps>{this.props.title}</UIText>
        <UIText size="s" caps color="white">{this.props.description}</UIText>
      </View>

      <View className="secondSection" style={{
          flexDirection: "column",
        }}>
        { this.props.steps &&
          <View style={{
            flexDirection: "row"
          }}>
          { squares }
          </View>
        }
      </View>    

      <View className="thirdSection" style={{
          flexDirection: "column",
          flex: 1,
        }}>
        {this.props.minutesToEnd &&
        <View>
          <UIText style={{textAlign: "right"}} size="m" em caps>{this.props.minutesToEnd < 1 ? (this.props.minutesToEnd > 0 ? "<1" : "0") : Math.floor(this.props.minutesToEnd)} MIN</UIText>
          <UIText style={{textAlign: "right"}} size="s" caps color="white">{this.props.endText}</UIText>
        </View>
        }
      </View>

    </View>
  }
}

StatusBar.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  steps: PropTypes.number,
  currentStep: PropTypes.number,
};

export default StatusBar;
