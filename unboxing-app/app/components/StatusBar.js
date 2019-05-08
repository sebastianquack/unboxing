import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground, Image } from 'react-native';
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

import timerImage from '../../assets/img/Timer.png'

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
        { this.props.steps &&
          <View style={{
            flexDirection: "row",
            marginBottom: 5
          }}>
          { squares }
          </View>
        }

        <View style={{marginTop: 5}}>
          <UIText size="m" caps >{this.props.title}</UIText>
          <UIText size="m" style={{lineHeight: 21}} caps >{this.props.description}</UIText>
        </View>
      </View>

      <View className="secondSection" style={{
          flexDirection: "column",
        }}>
        {this.props.midSection}
      </View>    

      <View className="thirdSection" style={{
          flexDirection: "column",
          flex: 1
      }}>
      {this.props.minutesToEnd && <View>
          <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
            <UIText style={{textAlign: "right", paddingRight: 5}} size="m" em caps>{this.props.minutesToEnd < 1 ? (this.props.minutesToEnd > 0 ? "<1" : "0") : Math.floor(this.props.minutesToEnd) + 1} MIN</UIText>
            <Image source={timerImage}/>
          </View>
          <UIText style={{textAlign: "right"}} size="s" caps color="white">{this.props.endText}</UIText>
        </View>}
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
