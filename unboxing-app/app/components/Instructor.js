import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, ToastAndroid } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';
import ImageSequence from 'react-native-image-sequence';

import UIText from './UIText'

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

const imagesEinsatz = [
  require(`../../assets/imgAnim/Einsatz/Einsatz_00000.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00001.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00002.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00003.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00004.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00005.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00006.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00007.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00008.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00009.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00010.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00011.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00012.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00013.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00014.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00015.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00016.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00017.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00018.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00019.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00020.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00021.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00022.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00023.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00024.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00025.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00026.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00027.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00028.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00029.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00030.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00031.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00032.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00033.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00034.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00035.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00036.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00037.png`),
  require(`../../assets/imgAnim/Einsatz/Einsatz_00038.png`),
]

/*
const videos = {
  "step-1": require("../../assets/video/instructor/Einsatz.mp4"),
  "step-2": require("../../assets/video/instructor/Einsatz.mp4"),
  "step-2-playing": require("../../assets/video/instructor/Volume.mp4")  
}
*/

const images = {
  "step-1": imagesEinsatz,
  "step-2": imagesEinsatz,
  "step-2-playing": imagesEinsatz 
}

const makeNumbers = (min, max, strLen) => {
  var list = [];
  for (var i = min; i <= max; i++) {
      list.push(i);
  }
  return list.map( num => (String(num)).padStart(strLen, '0'))
}

const makeNumber = (num, strLen) => {
  (String(num)).padStart(strLen, '0')
}

class Instructor extends React.PureComponent { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

  /*
      // directory from unboxing folder (bad resolution, not usable)

      const imgUris = makeNumbers(0, 38, 5).map( 
        num => `/${pathPrefix}/assets/imgAnim/Einsatz/Einsatz_${num}.png`
      )
      const images = imgUris.map( uri => ({uri}))

  */

    if(images[this.props.mode]) {
      return(
          <View>
            <Text>Instructor</Text>
            <ImageSequence
              images={images[this.props.mode]}
              startFrameIndex={0}
              framesPerSecond={15}
              loop={true}              
              style={{
                height: 284,
                width: 284
              }}
            />
            <Text>Instructor</Text>
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
