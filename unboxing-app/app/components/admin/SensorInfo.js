import React, { Component } from 'react';
import { Text, View, StyleSheet, Switch } from 'react-native';
import compose from 'lodash.flowright'

import {globalStyles} from '../../../config/globalStyles';
import {sensorService, peakService} from '../../services';
import {withPeakService, withSensorService, withGameService} from '../ServiceConnector';

class SensorInfo extends React.Component { 
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    sensorService.enableReactiveData()
    sensorService.enableSampleRateMonitoring()
  }

  renderSensor(name, value, min=-5, max=5) {
    scale=20
    return <View flexDirection="row" style={{
      borderLeftColor: "black",
      borderLeftWidth: 1,
      borderRightColor: "black",
      borderRightWidth: 1,      
      width: (-min*scale)+100
    }}>
      <Text style={{width: 100}}>{name}</Text>
      <View style={{
        left: -min*scale + value*scale
      }}><Text>{name}: {value}</Text></View>
    </View>
  }

  renderSensorData(data) {
    if(this.props.gameService.debugMode) {
      return (
        <View>
          {this.renderSensor("acc_x", data.acc.x)}
          {this.renderSensor("acc_y", data.acc.y)}
          {this.renderSensor("acc_z", data.acc.z)}
          {this.renderSensor("gyr_x", data.gyr.x)}
          {this.renderSensor("gyr_y", data.gyr.y)}
          {this.renderSensor("gyr_z", data.gyr.z)}      
        </View>
      )
    } else {
      return null;
    }

  }

  render() {

    return (
      <View style={styles.info}>
        <Text style={globalStyles.titleText}>Sensor Info</Text>
        {this.renderSensorData(this.props.sensorService.data)}
        <View style={{width:"25%"}}>
          <Text>peakMode acc/gyr</Text>         
          <Switch value={this.props.peakService.peakMode == "acc"} onValueChange={peakService.togglePeakMode}/>
        </View>
        <Text>Sample Rate: { this.props.sensorService.sampleRate }</Text>
        <Text>isUp: { this.props.peakService.isUp ? "up" : "" }</Text>
        <Text>isDown: { this.props.peakService.isDown ? "down" : "" }</Text>
        <Text>deltaUpDown: { this.props.peakService.deltaUpDown }</Text>
        <Text>isFacingDown: { this.props.peakService.isFacingDown ? "true" : "false" }</Text>
        <Text>bpm: { this.props.peakService.bpm }</Text>
        <Text>still: { this.props.peakService.still ? "true" : "false" }</Text>
      </View>
    );
  }
}

export default withGameService(withSensorService(withPeakService(SensorInfo)));


const styles = StyleSheet.create({
  info: {

  }
});
