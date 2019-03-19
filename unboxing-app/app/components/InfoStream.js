import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions, colors} from '../../config/globalStyles';
import UIText from './UIText'

import {withGameService} from './ServiceConnector';
import {gameService} from '../services';

import triangleIcon from '../../assets/img/triangle.png'
import videoThumb from '../../assets/img/videoThumb.png'

const highlightStyle = {
  borderLeftColor: colors.turquoise,  
  borderLeftWidth: 1,       
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
      marginLeft: 25, 
      marginTop: 20
    }
    if(this.props.highlight) style = { ...style, ...highlightStyle }    
    
    return(   
      <View style={style}>
        {this.props.highlight &&
          <Image
            source={triangleIcon} 
            style={{
              position: "absolute",
              left: -25,   
              top: 0
            }}
          />
        }
        <UIText size="s" strong em caps >{this.props.title}</UIText>
        <UIText size="m" style={{color: colors.warmWhite}}>{this.props.content}</UIText>
        {this.props.video &&
           <Image
            source={videoThumb} 
            style={{
              marginTop: 20,
              marginBottom: 20
            }}
          />  
        }
      </View>
    );
  }
}

InfoStreamElement.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  video: PropTypes.bool
};

class InfoStreamComponent extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const infoStream = this.props.gameService.infoStream;
    const elements = infoStream.map((element, index)=>
      <InfoStreamElement highlight={index >= infoStream.length -1} key={index} title={element.title} content={element.content} video={element.video}/> 
    );

    return( 
      <View style={{
        width: 326,
        flexDirection: "column",
        marginBottom: 70
      }}>
        {elements}
      </View>
    );
  }
}

const InfoStream = withGameService(InfoStreamComponent);

export {InfoStream, InfoStreamElement};
