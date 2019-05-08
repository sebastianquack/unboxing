import React, { Component } from 'react';
import { View, StyleSheet, Image, ToastAndroid } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import UIText from './UIText'

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

class VideoPlayer extends React.PureComponent { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return(
        <View>
          <Video 
            source={{uri: pathPrefix + this.props.source}} 
            resizeMode="contain"
            style={{
              top: -80,
              height: "100%",
              width: "100%"
            }}
            /*onBuffer={(error)=>{console.warn(JSON.stringify(error))}}*/
            onError={()=>{console.warn(JSON.stringify(this.videoError))}}
          />
        </View>
    );
  }
}

VideoPlayer.propTypes = {
  source: PropTypes.string
};

export default VideoPlayer;
