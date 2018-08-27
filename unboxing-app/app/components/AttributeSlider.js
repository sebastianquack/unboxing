import React, { Component } from 'react';
import { Text, View, Switch, Slider } from 'react-native';
import { Accelerometer } from 'react-native-sensors';
import {globalStyles} from '../../config/globalStyles';

class AttributeSlider extends React.Component { 
  constructor(props) {
    super(props);
    this.gyroObservable = new Accelerometer({ // library names these wrong, we want to watch the gyro
      updateInterval: props.updateInterval || 200, // defaults to 100ms
    });
    this.state = {
      gyr:{x:0,y:0,z:0},
      value: this.props.initialValue,
      sliderPosition: this.props.initialValue,
      gestureControl: false
    }
    this.receiveGyrData = this.receiveGyrData.bind(this)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.buffer = []
  }

  componentDidMount() {
    this.gyroObservable.subscribe(this.receiveGyrData);
  }

  addBuffer = (data) => {
    if (!this.props.dataBufferSize) return

    const maxLength = this.props.dataBufferSize
    const currentLength = this.buffer.length

    // console.log("addBuffer", currentLength, maxLength)

    if (currentLength <= maxLength) {
      this.buffer.push(data)
    }
    if (currentLength > maxLength) {
      this.buffer.shift()
    }    
  }

  receiveGyrData(data) {
    //console.log(`sensordata gyr ${data.x} ${data.y} ${data.z}` )
    data.x = Math.floor(data.x*1000)/1000;
    data.y = Math.floor(data.y*1000)/1000;
    data.z = Math.floor(data.z*1000)/1000;
    this.setState({gyr: data});
    this.addBuffer(data)

    if(this.state.gestureControl) {
      let newValue = this.props.sensorTranslate(data, this.props, this.buffer);
      this.setState({sliderPosition: newValue, value: newValue});
      if(this.state.gestureControl) {
        this.props.onValueChange(newValue);    
      }
    }
  }

  componentWillUnmount() {
    this.gyroObservable.stop();
  }

  handleSwitch(value) {
    this.setState({ gestureControl: value })
  }

  renderDebugInfo() {
    const acc = this.state.acc;
    const gyr = this.state.gyr;

    return (
      <View >
        <Text>gyr x: {gyr.x}</Text>
        <Text>gyr y: {gyr.y}</Text>
        <Text>gyr z: {gyr.z}</Text>
      </View>
    );    
  }

  render() {

    return (
      <View style={{borderWidth: 1, borderColor: "#aaa", margin: 10, padding: 10}}>
        <Text>{this.props.attributeName}: {this.state.value}</Text>
        <Slider
          style={{width: 400, margin: 20}}
          minimumValue={this.props.minValue}
          maximumValue={this.props.maxValue}
          value={this.state.sliderPosition}
          onValueChange={value => {
            this.setState({value: Math.round(value * 100) / 100})
            this.props.onValueChange(value);
          }}
          onSlidingComplete={value => this.setState({sliderPosition: value})}
        />
        <View style={{flexDirection: 'row'}}>
          <Text>Sensor Control Active</Text>
          <Switch value={this.state.gestureControl} onValueChange={this.handleSwitch} />
        </View>
        {this.renderDebugInfo()}
      </View>
    );
  }
}

export default AttributeSlider;