import React, { Component } from 'react';
import { View, StyleSheet, Image, ToastAndroid } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';

import UIText from './UIText'
import Button from './Button'

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

class VideoPlayer extends React.PureComponent { 
  constructor(props) {
    super(props);
    this.state = {
      muted: false
    };
  }

  render() {
    return(
        <View
          style={{
          }}
        >
          <Button 
            type="mute" 
            muted={!this.state.muted}
            onPress={()=>{this.setState({muted: !this.state.muted})}}
            style={{
              left: 30,
              top: 500,
              position: "absolute",
              zIndex: 100
            }}
          />
          <Video 
            source={{uri: pathPrefix + this.props.source}} 
            resizeMode="contain"
            volume={this.state.muted ? 0.0 : 1.0}
            style={{
              top: -80,
              left: 0,
              width: "100%",
              height: "100%"
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
