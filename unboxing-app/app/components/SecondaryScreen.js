import React, { Component } from 'react';
import { View, StyleSheet, Image, ToastAndroid } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';
import loadInstruments from '../../config/instruments'
import UIText from './UIText'

import {storageService} from '../services';
import {withGameService} from './ServiceConnector';


const horizontalPadding = Math.floor(dimensions.screenWidth * 0.014)
const verticalPadding = Math.floor(dimensions.screenWidth * 0.016)

const imageWidth = dimensions.screenWidth * 0.25

const instruments = loadInstruments();

class SecondaryScreen extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderInstrument = this.renderInstrument.bind(this)
    this.renderNavigation = this.renderNavigation.bind(this)
  }

  renderInstrument() {
    return <View style={{
        paddingLeft: verticalPadding,
        paddingRight: verticalPadding,
        paddingTop: horizontalPadding,
        paddingBottom: horizontalPadding,
        height: "100%",
        width: "100%",
        flexDirection: "column",
        // backgroundColor: 'rgba(255,0,0,0.5)',
      }}>
      <View style={{
          flex: 2,
          // backgroundColor: "red"
          justifyContent: "center",
          alignItems: "center"
        }}>
        {this.props.instrument && instruments[this.props.instrument] && <Video 
          source={instruments[this.props.instrument].video} 
          repeat
          muted
          resizeMode="contain"
          style={{
            height: "100%",
            width: "100%",
          }}
          onError={()=>{console.warn("video load error " + JSON.stringify(this.videoError))}}
        />}
      </View>      
      <View style={{
          flex: 1,
          // backgroundColor: "blue",
          position: "relative",
          top: -20
        }}>
        {this.props.instrument &&
          <UIText caps strong size="m" align="center">
            {instruments[this.props.instrument] ? instruments[this.props.instrument]["name_" + storageService.state.language] : null}
          </UIText>    
        }
        {this.props.instrument &&
        <UIText size="s" align="center" caps wide em>{storageService.t("current")}</UIText>}
        {!this.props.instrument &&
        <UIText size="s" align="center" caps wide em>{storageService.t("select-your-instrument")}</UIText>}
      </View>
    </View>
  }

  renderNavigation() { 
    return this.props.gameService.activePlace && this.props.gameService.activePlace.navigationPhoto ? <Image
        source={{uri: "file:///sdcard/unboxing/files/places/" + this.props.gameService.activePlace.tag + "/" + this.props.gameService.activePlace.navigationPhoto}}
        style={{
          height: "100%",
          width: "100%"
        }}
      /> : null;
  }

  render() {
    const type = this.props.type
    if (type === "instrument") return this.renderInstrument()
    else if (type === "navigation") return this.renderNavigation()
    else return null
  }
}

SecondaryScreen.propTypes = {
  type: PropTypes.oneOf(['instrument', 'navigation']),
  instrument: PropTypes.oneOf(Object.keys(instruments)),
  target: PropTypes.string // code of navigation target
};

export default withGameService(SecondaryScreen);
