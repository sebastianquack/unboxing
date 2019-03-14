import React, { Component } from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

const horizontalPadding = Math.floor(dimensions.screenWidth * 0.014)
const verticalPadding = Math.floor(dimensions.screenWidth * 0.016)

const imageWidth = dimensions.screenWidth * 0.25

const instruments = { 
  "piano": { image: require('../../assets/img/piano.png') },
  "flute": { image: require('../../assets/img/piano.png') },
  "oboe 1": { image: require('../../assets/img/piano.png') },
  "oboe 2": { image: require('../../assets/img/piano.png') },
  "bassoon 1": { image: require('../../assets/img/piano.png') },
  "bassoon 2": { image: require('../../assets/img/piano.png') },
  "horn 1": { image: require('../../assets/img/piano.png') },
  "horn 2": { image: require('../../assets/img/piano.png') },
  "trumpet 1": { image: require('../../assets/img/piano.png') },
  "trumpet 2": { image: require('../../assets/img/piano.png') },
  "timpani": { image: require('../../assets/img/piano.png') },
  "violin 1": { image: require('../../assets/img/piano.png') },
  "violin 2": { image: require('../../assets/img/piano.png') },
  "viola": { image: require('../../assets/img/piano.png') },
  "cello": { image: require('../../assets/img/piano.png') },
  "double bass": { image: require('../../assets/img/piano.png') },
}

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
        <Image 
          source={instruments[this.props.instrument].image} 
          resizeMode="contain"
          style={{
            height: "100%",
            width: "100%"
          }}
        />
      </View>      
      <View style={{
          flex: 1,
          // backgroundColor: "blue",
        }}>
        <Text style={{ 
            color: "white", 
            textAlign: "center" 
          }}>
          {this.props.instrument}
        </Text>          
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
