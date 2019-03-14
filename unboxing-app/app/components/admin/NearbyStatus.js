import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';

import {globalStyles} from '../../../config/globalStyles';
import {withNearbyService, withStorageService} from '../ServiceConnector';
import {nearbyService, storageService} from '../../services';

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
      lastHeardFrom: "heardFrom",
      lastHeardFromAsNeighbor: "hfNeighbor",
    }
    
    const entriesFlat =  Object // [{endpointId, myNearbyStatus, name, ...}, {...}, ...]
      .entries(endpointInfo)
      .map( ([endpointId, value]) => ({ ...value, endpointId }) )
      .sort( (elem1, elem2) => (elem1.name && elem2.name ? elem1.name.localeCompare(elem2.name) : 0))

    const headerRow = Object
      .entries(columns)
      .map( ([key, title]) => 
          <View key={key} style={rowItemStyle}>
            <Text>{title}</Text>
          </View>
        )

    const rows = entriesFlat.map( entry => {
      const rowStyle = {}
      if (entry.myNearbyStatus === "connected") rowStyle.backgroundColor = "lightgreen"
      if (entry.myNearbyStatus === "connecting") rowStyle.backgroundColor = "orange"
      return <View key={entry.endpointId} style={{...rowContainerStyle, ...rowStyle}}>
        {Object.keys(columns).map( key => {
          itemStyle = (this.props.storageService.deviceId === entry[key]) ? { fontWeight: "bold" } : {}
          return <View key={key} style={rowItemStyle}>
            <Text style={itemStyle}>
              {entry[key] || "-"}
            </Text>
          </View>
        })}
      </View>
    })

    return <View style={tableContainerStyle}>
      <View style={{...rowContainerStyle, backgroundColor: "#eee"}}>
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
        <Text>Nearby</Text>
        <Text>deviceId: {this.props.storageService.deviceId}</Text>
        <Text>serviceId: {this.props.nearbyService.serviceId}</Text>
        { this.renderEndpointInfo(this.props.nearbyService.endpointInfo) }
        <View style={{width:"25%"}}>
          <Text>Active Off/On</Text>         
          <Switch value={this.props.nearbyService.active} onValueChange={nearbyService.toggleActive}/>
        </View>
        <View style={{width:"25%"}}>
          <Text>Discovery: {this.props.nearbyService.discoveryActive ? "on" : "off"}</Text>
        </View>
        <View style={{width:"25%"}}>
          <Text>Advertising: {this.props.nearbyService.advertisingActive ? "on" : "off"}</Text>
        </View>
        <Text>Last health check: {this.props.nearbyService.lastHealthCheckSent}</Text>
        <Text>Message Counter: {this.props.nearbyService.messageCounter}</Text>
        <Text>Message Log</Text>
        <Text>{this.props.nearbyService.messageLog}</Text>
        
      </View>
    );
  }
}

export default withNearbyService(withStorageService(NearbyStatus));