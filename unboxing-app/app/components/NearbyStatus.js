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
        <Text>Nearby - {this.props.services.nearby.discoveryActive}</Text>
        <Text> { JSON.stringify(this.props.services.nearby) }</Text>
        <View style={{width:"25%"}}>
          <Text>Nearby Messages Off/On</Text>         
          <Switch value={this.props.services.nearby.active} onValueChange={nearbyService.toggleActive}/>
        </View>
        <View style={{width:"25%"}}>
          <Text>Discovery Off/On</Text>         
          <Switch value={this.props.services.nearby.discoveryActive} onValueChange={nearbyService.toggleDiscovery}/>
        </View>

        <View style={{width:"25%"}}>
          <Text>Advertising Off/On</Text>         
          <Switch value={this.props.services.nearby.advertisingActive} onValueChange={nearbyService.toggleAdvertising}/>
        </View>
        
      </View>
    );
  }
}

export default withServices(NearbyStatus);