import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import {withServices} from '../components/ServiceConnector';
import {nearbyService} from '../services';

class NearbyStatus extends React.Component { 
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <Text> { JSON.stringify(this.props.services.nearby) }</Text>
        <TouchableOpacity style={globalStyles.button} onPress={()=>nearbyService.toggleDiscovery()}>
          <Text>Toggle Discovery</Text>
        </TouchableOpacity>         
        <TouchableOpacity style={globalStyles.button} onPress={()=>nearbyService.toggleAdvertising()}>
          <Text>Toggle Advertising</Text>
        </TouchableOpacity>         
      </View>
    );
  }
}

export default withServices(NearbyStatus);