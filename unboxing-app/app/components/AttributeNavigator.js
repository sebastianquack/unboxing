import React, { Component } from 'react';
import { Text, View, Switch, Slider } from 'react-native';

import {sensorService} from '../services'
import {withServices} from '../components/ServiceConnector'
import {globalStyles} from '../../config/globalStyles';

class AttributeSlider extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      sensorControl: true
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
    this.setState(data);
    this.addBuffer(data)

    if(this.state.sensorControl) {
      let newValue = this.props.sensorTranslate(data, this.props, this.buffer);
      this.setState({sliderPosition: newValue, value: newValue});
      if(this.state.sensorControl) {
        this.props.onValueChange(newValue);    
      }
    }
  }

  handleSwitch(value) {
    this.setState({ sensorControl: value })
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
        <Svg
            height="100"
            width="100"
        >
            <Polyline
                points="10,10 20,12 30,20 40,60 60,70 95,90"
                fill="none"
                stroke="black"
                strokeWidth="3"
            />
        </Svg>
        {this.renderDebugInfo()}
      </View>
    );
  }
}

export default withServices(AttributeSlider);