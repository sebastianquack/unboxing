import React, { Component } from 'react';
import { Text, View, Switch } from 'react-native';
import { Accelerometer, Gyroscope } from 'react-native-sensors';
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
    }
    this.receiveAccData = this.receiveAccData.bind(this)
    this.receiveGyrData = this.receiveGyrData.bind(this)
    this.renderDebugInfo = this.renderDebugInfo.bind(this)
    this.handleSwitch = this.handleSwitch.bind(this)
  }

  componentDidMount() {
    this.accelerationObservable.subscribe(this.receiveAccData);
    this.gyroscopeObservable.subscribe(this.receiveGyrData);
  }

  receiveAccData(data) {
    //console.log(`sensordata acc ${data.x} ${data.y} ${data.z}` )
    data.x = Math.floor(data.x*1000)/1000
    data.y = Math.floor(data.y*1000)/1000
    data.z = Math.floor(data.z*1000)/1000
    this.detectEinsatz(this.state.acc, data)
    this.setState({acc: data})
  }

  receiveGyrData(data) {
    //console.log(`sensordata gyr ${data.x} ${data.y} ${data.z}` )
    data.x = Math.floor(data.x*1000)/1000
    data.y = Math.floor(data.y*1000)/1000
    data.z = Math.floor(data.z*1000)/1000
    this.setState({gyr: data})
  }

  detectEinsatz(accPrev,acc) {
    if (!this.state.active) return;

    if (accPrev.z +5 < acc.z && accPrev.x>-1 && acc.x<5) {
      console.log("Einsatz!")
      const callback = this.props.onEinsatz
      if (callback) callback()
    }
  }

  componentWillUnmount() {
    this.accelerationObservable.stop();
    this.gyroscopeObservable.stop();
  }

  handleSwitch(value) {
    console.log("gestures switched to: " + value);
    this.setState({ active: value })
  }

  renderDebugInfo() {
    const acc = this.state.acc;
    const gyr = this.state.gyr;

    return (
      <View >
        <Text>acc x: {acc.x}</Text>
        <Text>acc y: {acc.y}</Text>
        <Text>acc z: {acc.z}</Text>
        <Text>gyr x: {gyr.x}</Text>
        <Text>gyr y: {gyr.y}</Text>
        <Text>gyr z: {gyr.z}</Text>
      </View>
    );    
  }

  render() {

    return (
      <View>
        <Text style={globalStyles.titleText}>Gestures</Text>
        <View style={{flexDirection:'row'}}>
          <Switch value={this.state.active} onValueChange={this.handleSwitch} />
          <Text>{this.state.active ? 'active' : 'off'}</Text>
        </View>
        {/*this.renderDebugInfo()*/}
      </View>
    );
  }
}

export default Gesture;