import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import {sensorService} from '../services';
import {withServices} from '../components/ServiceConnector';

class SensorInfo extends React.Component { 
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    sensorService.enableReactiveData()
  }

  render() {
    return (
      <View style={styles.info}>
        <Text>acc x { this.props.services.sensors.data.acc.x }</Text>
        <Text>acc y { this.props.services.sensors.data.acc.y }</Text>
        <Text>acc z { this.props.services.sensors.data.acc.z }</Text>
        <Text>gyr x { this.props.services.sensors.data.gyr.x }</Text>
        <Text>gyr y { this.props.services.sensors.data.gyr.y }</Text>
        <Text>gyr z { this.props.services.sensors.data.gyr.z }</Text>
      </View>
    );
  }
}

export default withServices(SensorInfo);


const styles = StyleSheet.create({
  info: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
  }
});
