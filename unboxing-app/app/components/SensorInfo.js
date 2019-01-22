import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import {sensorService} from '../services';
import {withServices} from '../components/ServiceConnector';

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
    return <View>
      {this.renderSensor("acc_x", data.acc.x)}
      {this.renderSensor("acc_y", data.acc.y)}
      {this.renderSensor("acc_z", data.acc.z)}
      {this.renderSensor("gyr_x", data.gyr.x)}
      {this.renderSensor("gyr_y", data.gyr.y)}
      {this.renderSensor("gyr_z", data.gyr.z)}      
    </View>
  }

  render() {
    return (
      <View style={styles.info}>
        <Text style={globalStyles.titleText}>Sensor Info</Text>
        {this.renderSensorData(this.props.sensorService.data)}
        <Text>Sample Rate: { this.props.sensorService.sampleRate }</Text>
        <Text>isUp: { this.props.peakService.isUp ? "up" : "" }</Text>
        <Text>isDown: { this.props.peakService.isDown ? "down" : "" }</Text>
        <Text>deltaUpDown: { this.props.peakService.deltaUpDown }</Text>
        <Text>bpm: { this.props.peakService.bpm }</Text>
      </View>
    );
  }
}

export default withServices(SensorInfo, ["sensorService", "peakService"]);


const styles = StyleSheet.create({
  info: {

  }
});
