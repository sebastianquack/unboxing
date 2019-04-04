import React, { Component } from 'react';
import { View, StyleSheet, Image, ToastAndroid } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import UIText from './UIText'

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

const videos = {
  "step-1": require("../../assets/video/instructor/Einsatz.mp4"),
  "step-2": require("../../assets/video/instructor/Einsatz.mp4"),
  "step-2-playing": require("../../assets/video/instructor/Volume.mp4")  
}

class Instructor extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if(videos[this.props.mode]) {
      return(
          <View>
            <Video 
              source={videos[this.props.mode]} 
              repeat
              rate={0.75}
              resizeMode="contain"
              style={{
                height: 284,
                width: 241
              }}
              onBuffer={()=>{console.warn(this.onBuffer)}}
              onError={()=>{console.warn(JSON.stringify(this.videoError))}}
            />
          </View>
      );
    } else {
      return null;
    }

  }
}

Instructor.propTypes = {
  mode: PropTypes.string
};

export default Instructor;
