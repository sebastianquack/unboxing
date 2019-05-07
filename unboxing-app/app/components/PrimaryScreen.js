import React, { Component } from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import Video from 'react-native-video';

import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

const horizontalPadding = Math.floor(dimensions.screenWidth * 0.04)
const verticalPadding = Math.floor(dimensions.screenWidth * 0.03)

const imageWidth = dimensions.screenWidth * 0.25

const mozartFlow = require('../../assets/video/Mozartfeld.mp4');

const backgroundGradients = {
  "fire": {
    colors: ['#000', '#DF4B47', '#FFCE51'],
    locations: [0.5, 0.875, 1],
  },  
  "active": {
    colors: ['rgba(0,0,0,0)', 'rgba(76,46,136,0.2)', 'rgba(0,175,161,1)'],
    locations: [0.3, 0.5, 1],    
  },
  "passive": { 
    colors: ['rgba(0,0,0,0)', 'rgba(76,46,136,0.2)', 'rgba(0,175,161,0.5)'],
    locations: [0.5, 0.7, 1],    
  },
}

class PrimaryScreen extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderBackgroundColor = this.renderBackgroundColor.bind(this)
    this.renderBackgroundFlow   = this.renderBackgroundFlow  .bind(this)
    this.renderMainContent = this.renderMainContent.bind(this)
    this.renderOverlayContent = this.renderOverlayContent.bind(this)
    this.renderScrollContent = this.renderScrollContent.bind(this)
    this.renderBackgroundContent = this.renderBackgroundContent.bind(this)
    this.renderInfoStreamShade = this.renderInfoStreamShade.bind(this)
  }

  renderBackgroundColor(zIndex) {
    return <View pointerEvents="none" style={{
      position: "absolute",
      top:0,
      zIndex,
      width: "100%",
      height: "100%",
      }}>
      <LinearGradient 
        colors={backgroundGradients[this.props.backgroundColor].colors}
        locations={backgroundGradients[this.props.backgroundColor].locations}
        style={{
          height: "100%",
          width: "100%",
        }}
      ></LinearGradient>
    </View>
  }

  renderBackgroundContent(zIndex) {
    return <View style={{
      position: "absolute",
      height: "100%",
      width: "100%",
      zIndex,
      }}>
      { this.props.backgroundContent }
    </View>          
  }

  renderBackgroundFlow(zIndex) {
    return <View style={{
      position: "absolute",
      height: "100%",
      width: "100%",
      zIndex,
      justifyContent: "center", alignItems: "center"
    }}>
      <Video 
            source={mozartFlow} 
            resizeMode="cover"
            style={{
              height: "100%",
              width: "100%"
            }}
            /*onBuffer={(error)=>{console.warn(JSON.stringify(error))}}*/
            onError={()=>{console.warn(JSON.stringify(this.videoError))}}
          />
      </View>        
  }
  
  renderMainContent(zIndex) {
    return <View style={{
      position: "absolute",
      height: "100%",
      width: "100%",
      zIndex,
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
      }}>
      { this.props.mainContent }
    </View>          
  }

  renderBottomShade(zIndex) {
    return <View pointerEvents="none" style={{
      position: "absolute",
      top:0,
      zIndex,
      width: "100%",
      height: "100%",
      }}>
      <LinearGradient 
        colors={['rgba(0,0,0,0)','rgba(0,0,0,0.6)','rgba(0,0,0,1)']}
        locations={[0.6,0.8,1]}
        style={{
          width: "100%",
          height: "100%",
        }}
      />     
    </View>
  }

  renderOverlayContent(zIndex) {
    return <View style={{
      position: "absolute",
      height: "100%",
      width: "100%",
      zIndex,
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    }}>
      { this.props.overlayContent }
    </View>            
  }

  renderScrollContent(zIndex) {
    return <ScrollView pointer-events="auto" style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      zIndex,
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,      
    }}>
      { this.props.scrollContent }
    </ScrollView>
  }

  renderInfoStream(zIndex) {
    return <ScrollView pointer-events="auto" style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      zIndex,
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,      
    }}
      contentContainerStyle={{flex: 1, justifyContent: 'flex-end'}} // so that info starts at bottom of screen
    >
      { this.props.infoStreamContent }
    </ScrollView>
  }

  renderInfoStreamShade(zIndex) {
    return <View pointerEvents="none" style={{
      position: "absolute",
      top:0,
      zIndex,
      width: "100%",
      height: "100%",
      }}>
      <LinearGradient 
        colors={['rgba(0,0,0,1)','rgba(0,0,0,0.1)']}
        start={{x: 0.0, y: 1}}
        end={{x: 0.4, y: 0}}
        locations={[0.35,0.5]}
        style={{
          width: "100%",
          height: "100%",
        }}
      />     
    </View>
  }

  renderShade(zIndex) {
    return <View pointerEvents="none" style={{
      position: "absolute",
      top:-2,
      zIndex,
      width: "100%",
      height: "100%",
      }}>
      <LinearGradient 
        colors={['rgba(0,0,0,1)','rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
        locations={[0,0.15,0.4]}
        style={{
          width: "100%",
          height: "100%",
        }}
      />     
    </View>
  }

  render() {
    const backgroundLayer = this.props.backgroundOnTop ? 70 : 25;

    return <View style={{
      height: "100%",
      width: "100%",
      flexDirection: "row",
      // backgroundColor: 'rgba(255,0,0,0.5)',
    }}>
      { this.props.backgroundFlow && this.renderBackgroundFlow(10) }
      


      { this.props.backgroundContent && this.renderBackgroundContent(20) }
      { this.props.mainContent && this.renderMainContent(30) }
      { this.renderShade(40) }
      { this.renderBottomShade(50) }
      { this.props.infoStreamContent && this.renderInfoStreamShade(60) }
      
      { this.props.backgroundColor && this.renderBackgroundColor(70) } 
 
      { this.props.overlayContent && this.renderOverlayContent(80) }
      { this.props.scrollContent && this.renderScrollContent(90) }
      { this.props.infoStreamContent && this.renderInfoStream(100) }

    </View>
  }
}

PrimaryScreen.propTypes = {
  backgroundColor: PropTypes.oneOf(Object.keys(backgroundGradients)), 
  backgroundFlow: PropTypes.bool, // switch flow on/off
  mainContent: PropTypes.node,
  overlayContent: PropTypes.node,
  scrollContent: PropTypes.node,
  backgroundLayer: PropTypes.bool
};

export default PrimaryScreen;
