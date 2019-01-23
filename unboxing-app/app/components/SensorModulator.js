import React, { Component } from 'react';
import { Text, View, Switch, Slider } from 'react-native';
import { Accelerometer } from 'react-native-sensors';

import AttributeSlider from './AttributeSlider';
import AttributeNavigator from './AttributeNavigator';

import {soundService, gameService} from '../services';
import {withSoundService} from '../components/ServiceConnector';

class SensorModulator extends React.Component { 
  constructor(props) {
    super(props);
  }

  // render an AttributeSlide depending on mode prop
  render = () => {
    switch(this.props.mode) {
      case "volume tilt": 
        return (
          <AttributeSlider
            attributeName={"Volume"}
            initialValue={this.props.soundService.volume}
            value={this.props.soundService.volume}
            minValue={0.1}
            maxValue={1}
            onValueChange={value=>soundService.setVolume(value)}
            sensorTranslate={(data, props)=>{
              let sensorValue = data.gyr.y;
              if(sensorValue > 5) sensorValue = 5;
              if(sensorValue < -5) sensorValue = -5;
              let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
              return Math.floor(100*result)/100;      
            }}
          />
        );
      case "speed tilt": 
        return (
          <AttributeSlider
            attributeName={"Speed"}
            initialValue={this.props.soundService.speed}
            value={this.props.soundService.speed}
            minValue={0.8}
            maxValue={1.2}
            onValueChange={value=>soundService.setSpeed(value)}
            sensorTranslate={(data, props)=>{
              let sensorValue = -data.gyr.x;
              if(sensorValue > 5) sensorValue = 5;
              if(sensorValue < -5) sensorValue = -5;
              let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
              return Math.floor(100*result)/100;      
            }}
          />
        );
      case "volume move":
        return (
          <AttributeSlider
            attributeName={"Volume by amount of movement"}
            initialValue={this.props.soundService.volume}
            value={this.props.soundService.volume}
            minValue={0.1}
            maxValue={1}
            dataBufferSize={1}
            updateInterval={200}
            onValueChange={value=>soundService.setVolume(value)}
            sensorTranslate={translateMovementAmount}
          />
        );
      case "off when moving":
        return (
          <AttributeSlider
            attributeName={"off when moving"}
            initialValue={this.props.soundService.volume}
            value={this.props.soundService.volume}
            minValue={0.2}
            maxValue={1}
            dataBufferSize={1}
            updateInterval={200}
            onValueChange={value=>soundService.setVolume(value)}
            sensorTranslate={(data, props)=>{
              data = data.acc
              const limit = 0.3 // larger number means more movement
              const speed = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
              let result = 0
              console.log(speed)
              if (speed < limit) {
                result = 1 - speed*limit;
              } else {
                result = 0.1;
              }
              return Math.floor(100*result)/100;      
            }}
          />
        );        
      case "crescendo":
        return (
          <AttributeNavigator
            attributeName={"Crescendo"}
            initialValue={this.props.soundService.volume}
            value={this.props.soundService.volume}
            minValue={0.1}
            maxValue={1}
            onValueChange={value=>soundService.setVolume(value)}
            sensorTranslate={(data, props, buffer)=>{
              let sensorValue = data.gyr.x;
              if(sensorValue > 5) sensorValue = 5;
              if(sensorValue < -5) sensorValue = -5;
              let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
              return Math.floor(100*result)/100;      
            }}
            targetValueFunction={(time, duration) => {
              return {
                target: 0.1 + (time/duration) * 0.9,
                threshold: 0.2
              }
            }}
          />
        );                
      default: 
        return null;
    }
  }
}

export default withSoundService(SensorModulator);

// translation function for "volume movement"
translateMovementAmount = (data, props, dataBuffer)=>{
  data = data.acc
  dataBuffer = dataBuffer.map( d => d.acc)
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
  result = Math.floor(100*result)/100; // rounding to 2 decimals
  if(result < 0.1) {
    result = 0.1;
  }
  return result;
}
