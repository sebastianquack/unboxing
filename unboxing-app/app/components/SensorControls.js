import React, { Component } from 'react';
import { Text, View, Switch, Slider } from 'react-native';
import { Accelerometer } from 'react-native-sensors';

import AttributeSlider from './AttributeSlider';

import {soundService} from '../services/soundService';
import {withServices} from '../components/ServiceConnector';

class SensorControls extends React.Component { 
  constructor(props) {
    super(props);
  }

  translateMovementAmount = (data, props, dataBuffer)=>{
    if (dataBuffer.length == 0) return 0
    const speedBufferSize = 5
    const speedX = Math.abs(data.x-dataBuffer[0].x)
    const speedY = Math.abs(data.y-dataBuffer[0].y)
    const speedZ = Math.abs(data.z-dataBuffer[0].z)
    const currentSpeed = speedX + speedY + speedZ
    if (typeof(this.speedBuffer) == "undefined") {
      this.speedBuffer = []
      this.speedBuffer.fill(0,0,speedBufferSize)
    }

    //FIFO in
    if (this.speedBuffer.length <= speedBufferSize) {
      this.speedBuffer.push(currentSpeed)
    }
    //FIFO out
    if (this.speedBuffer.length > speedBufferSize) {
      this.speedBuffer.shift()
    }    

    const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
    const avg = average(this.speedBuffer)

    // console.log(currentSpeed, avg)

    let result = 0.1 * ((currentSpeed + avg) / 2);
    return Math.floor(100*result)/100;      
  }

  render() {

    return (
      <View>
        
        <AttributeSlider
          attributeName={"Volume"}
          initialValue={this.props.services.sound.volume}
          value={this.props.services.sound.volume}
          minValue={0.1}
          maxValue={1}
          onValueChange={value=>soundService.setVolume(value)}
          sensorTranslate={(data, props)=>{
            let sensorValue = data.x;
            if(sensorValue > 5) sensorValue = 5;
            if(sensorValue < -5) sensorValue = -5;
            let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
            return Math.floor(100*result)/100;      
          }}
        />

        <AttributeSlider
          attributeName={"Speed"}
          initialValue={this.props.services.sound.speed}
          value={this.props.services.sound.speed}
          minValue={0.8}
          maxValue={1.2}
          onValueChange={value=>soundService.setSpeed(value)}
          sensorTranslate={(data, props)=>{
            let sensorValue = data.y;
            if(sensorValue > 5) sensorValue = 5;
            if(sensorValue < -5) sensorValue = -5;
            let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
            return Math.floor(100*result)/100;      
          }}
        />

        <AttributeSlider
          attributeName={"Volume by amount of movement"}
          initialValue={this.props.services.sound.volume}
          value={this.props.services.sound.volume}
          minValue={0.1}
          maxValue={1}
          dataBufferSize={1}
          updateInterval={200}
          onValueChange={value=>soundService.setVolume(value)}
          sensorTranslate={this.translateMovementAmount}
        />

      </View>
    );
  }
}

export default withServices(SensorControls);