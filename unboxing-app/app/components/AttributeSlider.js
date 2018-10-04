import React, { Component } from 'react';
import { Text, View, Switch, Slider } from 'react-native';

import {sensorService} from '../services'
import {globalStyles} from '../../config/globalStyles';

class AttributeSlider extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      gestureControl: false
    }
    this.receiveData = this.receiveData.bind(this)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.buffer = []
    this.receiverHandle = null
  }

  componentDidMount() {
    this.receiverHandle = sensorService.registerReceiver(this.receiveData);
  }

  componentWillUnmount() {
    sensorService.unRegisterReceiver(this.receiverHandle);
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

  receiveData(data) {
    data = data.gyr
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
        <Text>{/*JSON.stringify(this.state)*/}</Text>
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
          value={this.props.value}
          onValueChange={value => {
            this.props.onValueChange(Math.round(value * 100) / 100);
          }}
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