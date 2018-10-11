import React, { Component } from 'react';
import { Text, View, Switch, StyleSheet, TouchableOpacity, Slider } from 'react-native';

import {gestureService} from '../services'
import {withServices} from './ServiceConnector';
import {globalStyles} from '../../config/globalStyles';

class Gestures extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  renderGestures = () => {
    return this.props.services.gestures.activeGestures.map( gesture => (
      <Text key={gesture._id}>{gesture.name} (length: {gesture.records.length})</Text>
    ))
  }

  render() {
    const gesturesState = this.props.services.gestures
    return (
      <View>
        <Text style={globalStyles.titleText}>
          Gestures
        </Text>
        <View>
          <Text>Gesture Recognition: </Text>
          <Switch value={gesturesState.isRecognizing} onValueChange={gestureService.toggleRecognition} />
        </View>
        {this.renderGestures()}
      </View>
    );
  }
}

export default withServices(Gestures);

const styles = StyleSheet.create({
  debugContainer: {
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
  },
  recButton: {
    backgroundColor: 'green',
    padding: 10,
  },
  recButtonRecording: {
    backgroundColor: 'red',
    padding: 10,
  },
  submitButton: {
    backgroundColor: 'green',
    padding: 10,
  },
  discardButton: {
    backgroundColor: 'red',
    padding: 10,
  },    
  gestureInfo: {
    backgroundColor: '#eee',
    padding: 10,
  },      
})