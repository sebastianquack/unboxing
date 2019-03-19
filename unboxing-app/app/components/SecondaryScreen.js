import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';
import loadInstrumentIcons from '../../config/instruments'
import UIText from './UIText'

const horizontalPadding = Math.floor(dimensions.screenWidth * 0.014)
const verticalPadding = Math.floor(dimensions.screenWidth * 0.016)

const imageWidth = dimensions.screenWidth * 0.25

const instruments = loadInstrumentIcons();

class SecondaryScreen extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderInstrument = this.renderInstrument.bind(this)
    this.renderPhoto = this.renderPhoto.bind(this)
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
        }}>
        {this.props.instrument && <Video 
          source={instruments[this.props.instrument].video} 
          repeat
          muted
          resizeMode="contain"
          style={{
            height: "100%",
            width: "100%"
          }}
        />}
      </View>      
      <View style={{
          flex: 1,
          // backgroundColor: "blue",
        }}>
        {this.props.instrument &&
          <UIText caps strong align="center">
            {this.props.instrument}
          </UIText>    
        }
        <UIText size="s" align="center" caps wide em>{this.props.instrument ? "Aktuell" : "Your Instrument"}</UIText>      
      </View>
    </View>
  }

  renderPhoto() { // TODO
    return <Image
        source={this.props.photoSource}
        style={{}}
      />
  }

  render() {
    const type = this.props.type
    if (type === "instrument") return this.renderInstrument()
    else if (type === "photo") return this.renderPhoto()
    else return null
  }
}

SecondaryScreen.propTypes = {
  type: PropTypes.oneOf(['instrument', 'photo']),
  instrument: PropTypes.oneOf(Object.keys(instruments)),
  photoSource: PropTypes.string // path of photo
};

export default SecondaryScreen;
