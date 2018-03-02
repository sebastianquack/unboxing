import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Accelerometer, Gyroscope } from 'react-native-sensors';

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
      gyr:{x:0,y:0,z:0}
    }
    this.receiveAccData = this.receiveAccData.bind(this)
    this.receiveGyrData = this.receiveGyrData.bind(this)
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
    if (accPrev.z +15 < acc.z && accPrev.x>-1 && acc.x<5) {
      console.log("Einsatz!")
      const callback = this.props.onEinsatz
      if (callback) callback()
    }
  }

  componentWillUnmount() {
    this.accelerationObservable.stop();
    this.gyroscopeObservable.stop();
  }

  render() {
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
}

export default Gesture;