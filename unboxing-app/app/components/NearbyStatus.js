import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';

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
        <Text>Nearby</Text>
        <Text> { JSON.stringify(this.props.services.nearby) }</Text>
        <View style={{width:"25%"}}>
          <Text>Toggle Discovery</Text>         
          <Switch value={this.props.services.nearby.discoveryActive} onValueChange={nearbyService.setDiscovery}/>
        </View>
        <View style={{width:"25%"}}>
          <Text>Toggle Advertising</Text>         
          <Switch value={this.props.services.nearby.advertisingActive} onValueChange={nearbyService.setAdvertising}/>
        </View>
      </View>
    );
  }
}

export default withServices(NearbyStatus);