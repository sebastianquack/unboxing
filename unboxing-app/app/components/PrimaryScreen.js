import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';

const horizontalPadding = Math.floor(dimensions.screenWidth * 0.04)
const verticalPadding = Math.floor(dimensions.screenWidth * 0.03)

const imageWidth = dimensions.screenWidth * 0.25

class PrimaryScreen extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderBackgroundColor = this.renderBackgroundColor.bind(this)
    this.renderBackgroundFlow   = this.renderBackgroundFlow  .bind(this)
    this.renderBackgroundContent = this.renderBackgroundContent.bind(this)
    this.renderForegroundContent = this.renderForegroundContent.bind(this)
    this.renderScrollContent = this.renderScrollContent.bind(this)
  }

  renderBackgroundColor() {
    return <View style={{
      position: "absolute",
      zIndex: 1,
      height: "100%",
      width: "100%",
      backgroundColor: this.props.backgroundColor,
    }}>
    </View>    
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
      zIndex: 3,
      height: "100%",
      width: "100%",
    }}>
      { this.props.backgroundContent }
    </View>          
  }

  renderForegroundContent() {
    return <View style={{
      position: "absolute",
      zIndex: 4,
      height: "100%",
      width: "100%",
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
    }}>
      { this.props.foregroundContent }
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

  render() {
    return <View style={{
      height: "100%",
      width: "100%",
      flexDirection: "row",
      // backgroundColor: 'rgba(255,0,0,0.5)',
    }}>
      { this.props.backgroundColor && this.renderBackgroundColor() }
      { this.props.backgroundFlow && this.renderBackgroundFlow() }
      { this.props.backgroundContent && this.renderBackgroundContent() }
      { this.props.foregroundContent && this.renderForegroundContent() }
      { this.props.scrollContent && this.renderScrollContent() }
    </View>
  }
}

PrimaryScreen.propTypes = {
  backgroundColor: PropTypes.string, 
  backgroundFlow: PropTypes.bool, // switch flow on/off
  backgroundContent: PropTypes.node,
  foregroundContent: PropTypes.node,
  scrollContent: PropTypes.node,
};

export default PrimaryScreen;
