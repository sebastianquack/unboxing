import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import {withNearbyService} from '../components/ServiceConnector';
import {nearbyService} from '../services';

class NearbyStatus extends React.Component { 
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <View>
        <Text>Nearby - {this.props.nearbyService.discoveryActive}</Text>
        <Text> { JSON.stringify(this.props.nearbyService) }</Text>
        <View style={{width:"25%"}}>
          <Text>Nearby Ping Off/On</Text>         
          <Switch value={this.props.nearbyService.active} onValueChange={nearbyService.toggleActive}/>
        </View>
        <View style={{width:"25%"}}>
          <Text>Discovery Off/On</Text>         
          <Switch value={this.props.nearbyService.discoveryActive} onValueChange={nearbyService.toggleDiscovery}/>
        </View>

        <View style={{width:"25%"}}>
          <Text>Advertising Off/On</Text>         
          <Switch value={this.props.nearbyService.advertisingActive} onValueChange={nearbyService.toggleAdvertising}/>
        </View>
        
      </View>
    );
  }
}

export default withNearbyService(NearbyStatus);