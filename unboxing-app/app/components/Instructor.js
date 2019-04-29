import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, ToastAndroid } from 'react-native';
import Video from 'react-native-video';
import PropTypes from 'prop-types';
import ImageSequence from 'react-native-image-sequence';

import UIText from './UIText'

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

const imagesStill = [
  require(`../../assets/imgAnim/Einsatz/Einsatz_00000.png`)
]

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
]

const imagesStop = [
  require(`../../assets/imgAnim/Stop/Stop_00000.png`),
  require(`../../assets/imgAnim/Stop/Stop_00001.png`),
  require(`../../assets/imgAnim/Stop/Stop_00002.png`),
  require(`../../assets/imgAnim/Stop/Stop_00003.png`),
  require(`../../assets/imgAnim/Stop/Stop_00004.png`),
  require(`../../assets/imgAnim/Stop/Stop_00005.png`),
  require(`../../assets/imgAnim/Stop/Stop_00006.png`),
  require(`../../assets/imgAnim/Stop/Stop_00007.png`),
  require(`../../assets/imgAnim/Stop/Stop_00008.png`),
  require(`../../assets/imgAnim/Stop/Stop_00009.png`),
  require(`../../assets/imgAnim/Stop/Stop_00010.png`),
  require(`../../assets/imgAnim/Stop/Stop_00011.png`),
  require(`../../assets/imgAnim/Stop/Stop_00012.png`),
  require(`../../assets/imgAnim/Stop/Stop_00013.png`),
  require(`../../assets/imgAnim/Stop/Stop_00014.png`),
  require(`../../assets/imgAnim/Stop/Stop_00015.png`),
  require(`../../assets/imgAnim/Stop/Stop_00016.png`),
  require(`../../assets/imgAnim/Stop/Stop_00017.png`),
  require(`../../assets/imgAnim/Stop/Stop_00018.png`),
  require(`../../assets/imgAnim/Stop/Stop_00019.png`),
  require(`../../assets/imgAnim/Stop/Stop_00020.png`),
  require(`../../assets/imgAnim/Stop/Stop_00021.png`),
  require(`../../assets/imgAnim/Stop/Stop_00022.png`),
  require(`../../assets/imgAnim/Stop/Stop_00023.png`),
  require(`../../assets/imgAnim/Stop/Stop_00024.png`),
  require(`../../assets/imgAnim/Stop/Stop_00025.png`),
  require(`../../assets/imgAnim/Stop/Stop_00026.png`),
  require(`../../assets/imgAnim/Stop/Stop_00027.png`),
  require(`../../assets/imgAnim/Stop/Stop_00028.png`),
  require(`../../assets/imgAnim/Stop/Stop_00029.png`),
  require(`../../assets/imgAnim/Stop/Stop_00030.png`),
  require(`../../assets/imgAnim/Stop/Stop_00031.png`),
  require(`../../assets/imgAnim/Stop/Stop_00032.png`),
  require(`../../assets/imgAnim/Stop/Stop_00033.png`),
  require(`../../assets/imgAnim/Stop/Stop_00034.png`),
  require(`../../assets/imgAnim/Stop/Stop_00035.png`),
  require(`../../assets/imgAnim/Stop/Stop_00036.png`),
  require(`../../assets/imgAnim/Stop/Stop_00037.png`),
  require(`../../assets/imgAnim/Stop/Stop_00038.png`),
  require(`../../assets/imgAnim/Stop/Stop_00039.png`),
  require(`../../assets/imgAnim/Stop/Stop_00040.png`),
  require(`../../assets/imgAnim/Stop/Stop_00041.png`),
  require(`../../assets/imgAnim/Stop/Stop_00042.png`),
  require(`../../assets/imgAnim/Stop/Stop_00043.png`),
  require(`../../assets/imgAnim/Stop/Stop_00044.png`),
  require(`../../assets/imgAnim/Stop/Stop_00045.png`),  
]

const imagesVorneHinten = [
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00000.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00001.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00002.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00003.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00004.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00005.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00006.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00007.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00008.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00009.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00010.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00011.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00012.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00013.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00014.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00015.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00016.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00017.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00018.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00019.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00020.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00021.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00022.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00023.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00024.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00025.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00026.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00027.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00028.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00029.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00030.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00031.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00032.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00033.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00034.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00035.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00036.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00037.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00038.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00039.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00040.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00041.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00042.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00043.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00044.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00045.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00046.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00047.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00048.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00049.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00050.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00051.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00052.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00053.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00054.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00055.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00056.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00057.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00058.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00059.png`),
  require(`../../assets/imgAnim/VorneHinten/VorneHinten_00060.png`),  
]

const imagesVolume = [
  require(`../../assets/imgAnim/Volume/Volume_00000.png`),
  require(`../../assets/imgAnim/Volume/Volume_00001.png`),
  require(`../../assets/imgAnim/Volume/Volume_00002.png`),
  require(`../../assets/imgAnim/Volume/Volume_00003.png`),
  require(`../../assets/imgAnim/Volume/Volume_00004.png`),
  require(`../../assets/imgAnim/Volume/Volume_00005.png`),
  require(`../../assets/imgAnim/Volume/Volume_00006.png`),
  require(`../../assets/imgAnim/Volume/Volume_00007.png`),
  require(`../../assets/imgAnim/Volume/Volume_00008.png`),
  require(`../../assets/imgAnim/Volume/Volume_00009.png`),
  require(`../../assets/imgAnim/Volume/Volume_00010.png`),
  require(`../../assets/imgAnim/Volume/Volume_00011.png`),
  require(`../../assets/imgAnim/Volume/Volume_00012.png`),
  require(`../../assets/imgAnim/Volume/Volume_00013.png`),
  require(`../../assets/imgAnim/Volume/Volume_00014.png`),
  require(`../../assets/imgAnim/Volume/Volume_00015.png`),
  require(`../../assets/imgAnim/Volume/Volume_00016.png`),
  require(`../../assets/imgAnim/Volume/Volume_00017.png`),
  require(`../../assets/imgAnim/Volume/Volume_00018.png`),
  require(`../../assets/imgAnim/Volume/Volume_00019.png`),
  require(`../../assets/imgAnim/Volume/Volume_00020.png`),
  require(`../../assets/imgAnim/Volume/Volume_00021.png`),
  require(`../../assets/imgAnim/Volume/Volume_00022.png`),
  require(`../../assets/imgAnim/Volume/Volume_00023.png`),
  require(`../../assets/imgAnim/Volume/Volume_00024.png`),
  require(`../../assets/imgAnim/Volume/Volume_00025.png`),
  require(`../../assets/imgAnim/Volume/Volume_00026.png`),
  require(`../../assets/imgAnim/Volume/Volume_00027.png`),
  require(`../../assets/imgAnim/Volume/Volume_00028.png`),
  require(`../../assets/imgAnim/Volume/Volume_00029.png`),
  require(`../../assets/imgAnim/Volume/Volume_00030.png`),
  require(`../../assets/imgAnim/Volume/Volume_00031.png`),
  require(`../../assets/imgAnim/Volume/Volume_00032.png`),
  require(`../../assets/imgAnim/Volume/Volume_00033.png`),
  require(`../../assets/imgAnim/Volume/Volume_00034.png`),
  require(`../../assets/imgAnim/Volume/Volume_00035.png`),
  require(`../../assets/imgAnim/Volume/Volume_00036.png`),
  require(`../../assets/imgAnim/Volume/Volume_00037.png`),
  require(`../../assets/imgAnim/Volume/Volume_00038.png`),
  require(`../../assets/imgAnim/Volume/Volume_00039.png`),
  require(`../../assets/imgAnim/Volume/Volume_00040.png`),
  require(`../../assets/imgAnim/Volume/Volume_00041.png`),
  require(`../../assets/imgAnim/Volume/Volume_00042.png`),
  require(`../../assets/imgAnim/Volume/Volume_00043.png`),
  require(`../../assets/imgAnim/Volume/Volume_00044.png`),
  require(`../../assets/imgAnim/Volume/Volume_00045.png`), 
]

/*
const videos = {
  "step-1": require("../../assets/video/instructor/Einsatz.mp4"),
  "step-2": require("../../assets/video/instructor/Einsatz.mp4"),
  "step-2-playing": require("../../assets/video/instructor/Volume.mp4")  
}
*/

const images = {
  "einsatz": imagesEinsatz,
  "stop": imagesStop,
  "volume": imagesVolume,
  "still": imagesStill
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
    //console.warn("instructor render", this.props.mode);

    if(images[this.props.mode]) {
      return(
          <View>
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
