import React, { Component } from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions, colors} from '../../config/globalStyles';
import UIText from './UIText'

import {withGameService} from './ServiceConnector';
import {gameService} from '../services';

import triangleIcon from '../../assets/img/triangle.png'
import videoThumbButton from '../../assets/img/videoThumb.png'
import alertBlue from '../../assets/img/infoBlue.png'
import alertRed from '../../assets/img/infoRed.png'

const highlightStyle = {
  borderLeftColor: colors.turquoise,  
  borderLeftWidth: 2,  
  marginBottom: 10
}

class InfoStreamElement extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if(!this.props.title || !this.props.content) return null;
    
    let style = {
      paddingLeft: 10,
      marginLeft: 10, 
      marginTop: 20,
    }
    if(this.props.highlight) style = { ...style, ...highlightStyle }   

    return(   
      <View style={style}>
        { this.props.title && <UIText size="s" strong em caps >{this.props.title}</UIText>}
        <UIText size={this.props.highlight ? "l" : "m"}>{this.props.content}</UIText>
      </View>
    );
  }
}

InfoStreamElement.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  video: PropTypes.array
};

class InfoStreamComponent extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let infoStream = this.props.gameService.infoStream;
    if(!infoStream) return null;
    if(infoStream.length == 0) return null;
    
    const elements = infoStream.map((element, index)=>
      <InfoStreamElement highlight={index >= infoStream.length -1} key={index} title={element.title} content={element.content}/> 
    );

    const videoThumb = this.props.gameService.infoStreamVideo ?       
      <TouchableOpacity
        onPress={()=>{gameService.startVideo(this.props.gameService.infoStreamVideo.video)}}
        style={{height: 177, width: "100%", zIndex: 1}}
      >
        <Image
              source={{uri: "file:///sdcard/unboxing/files/" + this.props.gameService.infoStreamVideo.thumb}}
              style={{width: 296, height: 177, top: 0, position: "absolute", marginRight: 20, marginBottom: 20}}
        />
      </TouchableOpacity> : null;

    return(       
      <View style={{
        //backgroundColor: "blue"
      }}>
        <View style={{
          width: 326,
          flexDirection: "column",
          marginTop: 100,
          marginBottom: 0 + (this.props.gameService.infoAlert ? 0 : 62),
        }}>
          {elements}
          {this.props.gameService.infoAlert && 
            <ImageBackground 
              imageStyle={{resizeMode: 'stretch'}}
              style={{marginLeft: 10, marginTop: 10, marginBottom: 10, height: 42, width: this.props.gameService.infoAlert.text.length * 15, alignItems: "center", justifyContent: "center"}}
              source={this.props.gameService.infoAlert.color == "blue" ? alertBlue : alertRed}>
              <UIText size="m" verticalCenter style={{color: colors.warmWhite}}>{this.props.gameService.infoAlert.text.toUpperCase()}</UIText>
            </ImageBackground>
          }
        </View>
        <View style={{
          flexDirection: "column",
          width: 296,
          position: "absolute",
          top: 0,
          left: 320,
          //backgroundColor: "red"
        }}>
          {videoThumb}
        </View>
      </View>
    );
  }
}

const InfoStream = withGameService(InfoStreamComponent);

export {InfoStream, InfoStreamElement};
