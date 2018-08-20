/* TO DO (server and client)
 * - record other sensors (aggregate before)
 * - choose which dimensions to use/ ignore
 */

import React, { Component } from 'react';
import Meteor, { createContainer } from 'react-native-meteor';
import { Text, View, Switch, StyleSheet, TouchableOpacity, Slider } from 'react-native';
import { Accelerometer, Gyroscope } from 'react-native-sensors';
import { DynamicTimeWarping } from 'dynamic-time-warping';
import hash from 'object-hash';

import {globalStyles} from '../config/globalStyles';

class Gesture extends React.Component { 
  constructor(props) {
    super(props);
    this.accelerationObservable = new Accelerometer({
      updateInterval: 100, // defaults to 100ms
    });
    this.gyroscopeObservable = new Gyroscope({
      updateInterval: 100, // defaults to 100ms
    });        
    this.state = {
      acc:{x:0,y:0,z:0},
      gyr:{x:0,y:0,z:0},
      active: false,
      recording: false,
      debugging: false,
      dtw: 0,
      sensitivity: 40,
      recordingMeta: {
        length:0
      }
    }
    this.records = []
    this.recentRecords = []
    this.receiveAccData = this.receiveAccData.bind(this)
    this.receiveGyrData = this.receiveGyrData.bind(this)
    this.renderDebugInfo = this.renderDebugInfo.bind(this)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleRecPress = this.handleRecPress.bind(this)
    this.handleSensitivityChange = this.handleSensitivityChange.bind(this)
    this.startRecording = this.startRecording.bind(this)
    this.stopRecording = this.stopRecording.bind(this)
    this.submitRecords = this.submitRecords.bind(this)
    this.clearRecords = this.clearRecords.bind(this)
    this.detectDtwEinsatz = this.detectDtwEinsatz.bind(this)
  }

  componentDidCatch(error, info) {
    console.log("Exception caught in Gesture: ", error, info)
  }

  componentDidMount() {
    this.accelerationObservable.subscribe(this.receiveAccData);
    this.gyroscopeObservable.subscribe(this.receiveGyrData);
  }

  componentDidUpdate(prevProps) {
    if (this.props.gesture && prevProps.gesture) {
      if (hash(this.props.gesture) !== hash(prevProps.gesture)) {
        this.recentRecords = []
      }
    }
  }  

  receiveAccData(data) {
    //console.log(`sensordata acc ${data.x} ${data.y} ${data.z}` )
    data.x = Math.floor(data.x*1000)/1000
    data.y = Math.floor(data.y*1000)/1000
    data.z = Math.floor(data.z*1000)/1000
    //this.detectEinsatz(this.state.acc, data)
    if (this.state.recording) {
      this.records.push(data)
    }
    if (this.state.active) {
      this.detectDtwEinsatz(data)
    }
    if (this.state.debugging) this.setState({acc: data})
  }

  receiveGyrData(data) {
    //console.log(`sensordata gyr ${data.x} ${data.y} ${data.z}` )
    data.x = Math.floor(data.x*1000)/1000
    data.y = Math.floor(data.y*1000)/1000
    data.z = Math.floor(data.z*1000)/1000
    if (this.state.debugging) this.setState({gyr: data})
  }

  detectEinsatz(accPrev,acc) {
    if (accPrev.z +5 < acc.z && accPrev.x>-1 && acc.x<5) {
      console.log("Einsatz!")
      const callback = this.props.onEinsatz
      if (callback) callback()
    }
  }

  dtwDistFunc = function( a, b ) {
    return Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );
  };

  detectDtwEinsatz(data) {
    // maintain data flow
    const currentRecords = this.records.length > 0 ? this.records : (this.props.gesture ? this.props.gesture.records : [])
    const currentSensitivity = this.records.length > 0 ? this.state.sensitivity : (this.props.gesture ? this.props.gesture.sensitivity : [])
    // console.log("detect", currentRecords, currentSensitivity)
    if (currentRecords.length >= this.recentRecords.length) {
      this.recentRecords.push(data);
      if (currentRecords.length < this.recentRecords.length) {
        this.recentRecords.shift();
      }
    }
    if (this.recentRecords.length != currentRecords.length || currentRecords.length < 1) {
      console.log("gesture array to short", this.recentRecords.length, currentRecords.length, this.records.length)
      return false; // array too short
    }
    this.dtw = new DynamicTimeWarping(currentRecords, this.recentRecords, this.dtwDistFunc);
    const dist = Math.round(this.dtw.getDistance())
    delete this.dtw
    console.log("gesture dtw: " + dist)

    if (dist < currentSensitivity && !this.state.recording) {
      console.log("DTW Einsatz!")
      this.recentRecords = []
      const callback = this.props.onEinsatz
      if (callback) callback()
    } 

    this.setState({dtw: dist})
  }

  componentWillUnmount() {
    this.accelerationObservable.stop();
    this.gyroscopeObservable.stop();
  }

  handleSwitch(value) {
    console.log("gestures switched to: " + value);
    this.setState({ active: value })
  }

  handleRecPress() {
    const targetState = !this.state.recording
    if (targetState) {
      this.startRecording()
    } else {
      this.stopRecording()
    }
  }

  handleSensitivityChange(value) {
    this.setState({sensitivity: value})
  }

  startRecording() {
    console.log("start gesture recording")
    this.records = []
    this.recentRecords = []
    this.setState({recording: true})
  }

  stopRecording() {
    console.log("stop gesture recording")
    this.setState({
      recording: false,
      recordingMeta: {
        length: this.records.length
      }
    })
    this.recentRecords = []
  }

  submitRecords() {
    const gesture = {
      records: this.records,
      sensitivity: this.state.sensitivity
    }
    Meteor.call('addGesture', gesture, ()=>{
      this.clearRecords()
    })
  }

  clearRecords() {
    this.setState({
      recording: false,
      recordingMeta: {
        length: 0
      }
    })
    this.records = []
  }

  renderValue(text, value) {
    return (
      <View style={{flexDirection:'column'}}>
        <Text>{text} {value}</Text>
      </View>
    )
  }

  renderDebugInfo() {
    const acc = this.state.acc;
    const gyr = this.state.gyr;

    return (
      <View style={styles.debugContainer}>
        {this.renderValue("Acc x", acc.x)}
        {this.renderValue("Acc y", acc.y)}
        {this.renderValue("Acc z", acc.z)}
        {this.renderValue("Gyr x", gyr.x)}
        {this.renderValue("Gyr y", gyr.y)}
        {this.renderValue("Gyr z", gyr.z)}
        <TouchableOpacity onPress={this.handleRecPress} style={this.state.recording ? styles.recButtonRecording : styles.recButton}>
          <Text>{this.state.recording ? 'Stop' : 'Start'} Rec</Text>
          {this.records.length != 0 && <Text>{this.records.length}/{this.recentRecords.length} values</Text>}
          <Text>{this.state.dtw != 0 ? 'DTW: ' + this.state.dtw+'/'+this.state.sensitivity : ''}</Text>
        </TouchableOpacity>
        {this.state.dtw != 0 &&
          <Slider style={{padding:20}} step={1} value={this.state.sensitivity} onSlidingComplete={this.handleSensitivityChange} minimumValue={1} maximumValue={10*this.records.length}></Slider>
        }
      </View>
    );    
  }

  renderDtwRecording() {
    const currentRecords = this.records.length > 0 ? this.records : (this.props.gesture ? this.props.gesture.records : [])
    const currentSensitivity = this.records.length > 0 ? this.state.sensitivity : (this.props.gesture ? this.props.gesture.sensitivity : [])
    // console.log("render", currentRecords, currentSensitivity)
    return (
      <View style={styles.debugContainer}>
        <Text style={styles.gestureInfo}>{(this.records.length > 0 ? "local gesture" : `server gesture:\n${this.props.gesture ? this.props.gesture.name : "?"}`)}</Text>
        <TouchableOpacity onPress={this.handleRecPress} style={this.state.recording ? styles.recButtonRecording : styles.recButton}>
          <Text>{this.state.recording ? 'Stop' : 'Start'} Rec</Text>
          {currentRecords.length != 0 && <Text>{currentRecords.length}/{this.recentRecords.length} values</Text>}
          <Text>{this.state.dtw != 0 ? 'DTW: ' + this.state.dtw+'/'+currentSensitivity : ''}</Text>
        </TouchableOpacity>
        {this.state.dtw != 0 && this.records.length > 0 &&
          <Slider style={{padding:20}} step={1} value={this.state.sensitivity} onValueChange={this.handleSensitivityChange} minimumValue={1} maximumValue={10*this.records.length}></Slider>
        }
        {this.records.length > 0 && !this.state.recording && 
        <View>
          <TouchableOpacity style={styles.submitButton} onPress={this.submitRecords} >
            <Text>Use</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardButton} onPress={this.clearRecords}>
            <Text>Discard</Text>
          </TouchableOpacity>
        </View>
        }
      </View>
    );    
  }

  render() {
    return (
      <View>
        <Text style={globalStyles.titleText}>Gestures</Text>
        <View style={{flexDirection:'row'}}>
          <Switch value={this.state.active} onValueChange={this.handleSwitch} />
        </View>
        {this.state.debugging && this.renderDebugInfo()}
        {this.state.active && this.renderDtwRecording()}
      </View>
    );
  }
}

export default createContainer(params=>{
  const handle = Meteor.subscribe('gestures.active');
  const gestures = Meteor.collection('gestures').find()

  // crop records out of range
  const croppedGestures = gestures.map( g => {
    return {...g, records: g.records.slice(g.start, g.stop)}
  })

  const gesture = croppedGestures[0]
  
  return {
    ready: handle.ready(),
    gesture
  };
}, Gesture)

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