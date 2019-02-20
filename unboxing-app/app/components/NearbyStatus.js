import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import {withNearbyService} from '../components/ServiceConnector';
import {nearbyService} from '../services';

const tableContainerStyle = {
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "black",
  width: "100%"
}

const rowContainerStyle = {
  flexDirection: "row",
  alignItems: 'stretch',
}

const rowItemStyle = {
  flex: 1,
  padding: 10,
  borderStyle: "solid",
  borderWidth: 0.5,
  borderColor: "black"
}

class NearbyStatus extends React.Component { 
  constructor(props) {
    super(props);
    this.renderEndpointInfo = this.renderEndpointInfo.bind(this)
  }

  renderEndpointInfo(endpointInfo) {
    if (!endpointInfo) return <Text>missing endpointInfo</Text>

    const columns = {
      endpointId: "endpointId",
      name: "name",      
      meshStatus: "meshStatus",
      myNearbyStatus: "myNearbyStatus",
    }
    
    const entriesFlat =  Object // [{endpointId, myNearbyStatus, name, ...}, {...}, ...]
      .entries(endpointInfo)
      .map( ([endpointId, value]) => ({ ...value, endpointId }) )
      .sort( (elem1, elem2) => elem1.endpointId < elem2.endpointId )

    const headerRow = Object
      .entries(columns)
      .map( ([key, title]) => 
          <View key={key} style={rowItemStyle}>
            <Text>{title}</Text>
          </View>
        )

    const rows = entriesFlat.map( entry => (
      <View key={entry.endpointId} style={rowContainerStyle}>
        {Object.keys(columns).map( key =>
          <View key={key} style={rowItemStyle}>
            <Text>{entry[key] || "-"}</Text>
          </View>
        )}
      </View>
    ))

    return <View style={tableContainerStyle}>
      <View style={rowContainerStyle}>
        {headerRow}
      </View>
      <View>
        {rows}
      </View>
    </View>
  }

  render() {

    return (
      <View>
        <Text>Nearby - {this.props.nearbyService.discoveryActive}</Text>
        <Text> { JSON.stringify(this.props.nearbyService) }</Text>
        {this.renderEndpointInfo(this.props.nearbyService.endpointInfo)}
        {/*
        <View style={{width:"25%"}}>
          <Text>Nearby Messages Off/On</Text>         
          <Switch value={this.props.nearbyService.active} onValueChange={nearbyService.toggleActive}/>
        </View>
        */}
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