import React, { Component } from 'react';
import { Text, View, Switch, StyleSheet, TouchableOpacity, Slider } from 'react-native';

import {gestureService, sensorService} from '../services'
import {withServices} from './ServiceConnector';
import {globalStyles} from '../../config/globalStyles';

class Gestures extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  renderGestures = () => {
    return this.props.services.gestures.activeGestures.map( gesture => {
      const dtwValue = this.props.services.gestures.dtwValues[gesture._id];
      return <Text key={gesture._id}>
          <Text style={{fontWeight:"bold"}}>{(gesture.sensitivity/dtwValue).toFixed(1)}  </Text> 
          ({dtwValue} {"<"} {gesture.sensitivity}) (length: {gesture.activeLength})  <Text style={{fontWeight:"bold"}}>{gesture.name}</Text>
        </Text>
    })
  }

  renderDetectedGestures = () => {
    return this.props.services.gestures.detectedGestures.map( (gesture, index) => (
      <Text key={index}>{gesture.name} {gesture.detectedAt.getHours()}:{gesture.detectedAt.getMinutes()}:{gesture.detectedAt.getSeconds()}</Text>
    ))
  }

  renderRecorder = () => {
    const recordButton = <TouchableOpacity style={styles.recordButton}
        onPress={gestureService.startRecording}
        ><Text>● Start Recording</Text>
      </TouchableOpacity>

    const stopButton = <TouchableOpacity style={styles.stopButton}
        onPress={gestureService.stopRecording}
        ><Text>■ Stop Recording</Text>
      </TouchableOpacity>      

    const clearButton = <TouchableOpacity style={styles.clearButton}
        onPress={gestureService.clearRecords}
        ><Text>X Clear Recording</Text>
      </TouchableOpacity>       

    const sendButton = <TouchableOpacity style={styles.sendButton}
        onPress={gestureService.sendRecords}
        ><Text>Send Recording to Server</Text>
      </TouchableOpacity>

    const isRecording = this.props.services.gestures.isRecording
    const hasRecords = this.props.services.gestures.hasRecords

    const firstButton = ( isRecording ? stopButton : ( hasRecords ? clearButton : recordButton ) )
    const secondButton = ( hasRecords ? sendButton : null )

    return <View>
        {firstButton}
        {secondButton}
    </View>
  }

  handleRegognitionSwitch() {
    sensorService.enableSampleRateMonitoring()
    gestureService.toggleRecognition()
  }


  render() {
    const gesturesState = this.props.services.gestures
    const sensorsState = this.props.services.sensors
    return (
      <View>
        <Text style={globalStyles.titleText}>
          Gestures
        </Text>
        <View style={{flexDirection: 'row'}}> 
          <Text>Gesture Recognition: </Text>
          <Switch value={gesturesState.isRecognizing} onValueChange={this.handleRegognitionSwitch} />
        </View>
        <Text>{sensorsState.sampleRate} samples per second</Text>
        <View style={{margin: 10}}>
          {this.renderGestures()}
        </View>
        {/*<View>
          <Text>Detected Gestures:</Text>
          {this.renderDetectedGestures()}
        </View>*/}
        {this.renderRecorder()}
      </View>
    );
  }
}

export default withServices(Gestures);

const buttonStyle = {
  padding: 10,
  height: 40,
  fontSize: 20,
  backgroundColor: '#f0f0f0',
}

const styles = StyleSheet.create({
  debugContainer: {
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
  },
  recordButton: {
    ...buttonStyle
  },
  stopButton: {
    ...buttonStyle,
    backgroundColor: 'red',
  },
  sendButton: {
    ...buttonStyle,
    marginTop: 10,
  },
  clearButton: {
    ...buttonStyle
  },    
  gestureInfo: {
    backgroundColor: '#eee',
    padding: 10,
  },      
})