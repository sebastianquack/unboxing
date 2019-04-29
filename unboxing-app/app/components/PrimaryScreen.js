import React, { Component } from 'react';
import { Text, View, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

const horizontalPadding = Math.floor(dimensions.screenWidth * 0.04)
const verticalPadding = Math.floor(dimensions.screenWidth * 0.03)

const imageWidth = dimensions.screenWidth * 0.25

const shadeImg = require('../../assets/img/shade.png')

const backgroundGradients = {
  "passive": {
    //colors: ['#000', '#DF4B47', '#FFCE51'],
    //locations: [0.5, 0.875, 1],
    colors: ['#000', 'rgba(0,175,161,1)'],
    locations: [0.5, 1],
  },
  "active": {
    colors: ['#000', 'rgba(0,175,161,0.5)'],
    locations: [0.5, 1],
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
  }

  renderBackgroundColor() {
    return <LinearGradient 
      colors={backgroundGradients[this.props.backgroundColor].colors}
      locations={backgroundGradients[this.props.backgroundColor].locations}
      style={{
        height: "100%",
        width: "100%",
      }}
      ></LinearGradient>
  }

  renderBackgroundFlow() {
    return <View style={{
      position: "absolute",
      zIndex: 2,
      height: "100%",
      width: "100%",
      backgroundColor: 'rgba(0,220,0,0.5)',
      justifyContent: "center",alignItems: "center"
    }}>
      <Text style={{textAlign: "center"}}>FLOW</Text>
    </View>        
  }

  renderBackgroundContent() {
    return <View style={{
      position: "absolute",
      zIndex: 1,
      height: "100%",
      width: "100%",
      }}>
      { this.props.backgroundContent }
    </View>          
  }
  
  renderMainContent() {
    return <View style={{
      position: "absolute",
      zIndex: 3,
      height: "100%",
      width: "100%",
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
      }}>
      { this.props.mainContent }
    </View>          
  }

  renderOverlayContent() {
    return <View style={{
      position: "absolute",
      zIndex: 4,
      height: "100%",
      width: "100%",
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    }}>
      { this.props.overlayContent }
    </View>            
  }

  renderScrollContent() {
    return <ScrollView pointer-events="auto" style={{
      position: "absolute",
      zIndex: 5,
      width: "100%",
      height: "100%",
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,      
    }}>
      { this.props.scrollContent }
    </ScrollView>
  }

  renderInfoStream() {
    return <ScrollView pointer-events="auto" style={{
      position: "absolute",
      zIndex: 6,
      width: "100%",
      height: "100%",
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,      
    }}
      contentContainerStyle={{flex: 1, justifyContent: 'flex-end'}} // so that info starts at bottom of screen
    >
      { this.props.infoStreamContent }
    </ScrollView>
  }

  renderShade() {
    return <View pointerEvents="none" style={{
      position: "absolute",
      zIndex: 7,
      width: "100%",
      height: "100%",
      opacity: 0.5
      }}>
      <Image resizeMode="contain" source={shadeImg} style={{
        width: "100%",
      }} />
    </View>
  }

  render() {
    return <View style={{
      height: "100%",
      width: "100%",
      flexDirection: "row",
      // backgroundColor: 'rgba(255,0,0,0.5)',
    }}>
      { this.props.backgroundColor && this.renderBackgroundColor() }
      { this.props.backgroundContent && this.renderBackgroundContent() }
      { this.props.backgroundFlow && this.renderBackgroundFlow() }
      { this.props.mainContent && this.renderMainContent() }
      { this.props.overlayContent && this.renderOverlayContent() }
      { this.props.scrollContent && this.renderScrollContent() }
      { this.props.infoStreamContent && this.renderInfoStream() }
      { this.renderShade() }
    </View>
  }
}

PrimaryScreen.propTypes = {
  backgroundColor: PropTypes.oneOf(Object.keys(backgroundGradients)), 
  backgroundFlow: PropTypes.bool, // switch flow on/off
  mainContent: PropTypes.node,
  overlayContent: PropTypes.node,
  scrollContent: PropTypes.node,
};

export default PrimaryScreen;
