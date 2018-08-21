import React, { Component } from 'react';

import {
  Text,
  View,
  TextInput
} from 'react-native';

import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';

/* this doesn't work - cannot resolve services for some reason - could be useful in future
import Zeroconf from 'react-native-zeroconf';
const zeroconf = new Zeroconf();
zeroconf.scan(type = 'http', protocol = 'tcp', domain = 'local.');
zeroconf.on('start', () => console.log('The scan has started.'));
zeroconf.on('update', () => console.log("update " + JSON.stringify(zeroconf.getServices())));
zeroconf.on('resolved', data => console.log("resolved " + JSON.stringify(data)));
zeroconf.on('error', data => console.log("error " + JSON.stringify(data)));*/

var RNFS = require('react-native-fs');

class ServerConnector extends React.Component { 
  constructor(props) {
  	super(props);
  	this.state = {
  		currentServer: "",
      	serverInput: "192.168.1.2"
  	}
  	this.updateServer = this.updateServer.bind(this);
  	this.loadLocalConfig = this.loadLocalConfig.bind(this);
  	this.loadLocalConfig();
  }

  // read default server ip address from file on device
  loadLocalConfig() {
    RNFS.readFile(RNFS.ExternalDirectoryPath + "/localConfig.json", 'utf8')
    .then((contents) => {
      // log the file contents
      console.log(contents);
      this.localConfig = JSON.parse(contents);
      console.log(this.localConfig);
      this.setState({
        serverInput: this.localConfig.defaultServerIp,
        currentServer: this.localConfig.defaultServerIp
      }, ()=>this.updateServer());
    })
    .catch((err) => {
      console.log(err.message, err.code);
    });
  }

  updateServer() {
    console.log("updating server to " + this.state.serverInput);
    this.state.currentServer = this.state.serverInput;
    // todo: save back to config file

    Meteor.disconnect();
    if(this.state.currentServer) {
      Meteor.connect('ws://'+this.state.currentServer+':3000/websocket');  
    }    
  }

  render() {
  	return (
  		<View>
	  		<Text style={{marginTop: 20}}>Server: {this.state.currentServer}</Text>
	        <Text>Status: { this.props.connected ? "connected" : "disconnected"}</Text>
	        <TextInput
	          underlineColorAndroid='transparent'
	          style={{width: 150, height: 40, borderColor: 'gray', borderWidth: 1}}
	          value={this.state.serverInput}
	          onChangeText={(text) => this.setState({serverInput: text})}
	          onSubmitEditing={this.updateServer}
	        />
  		</View>
  	);
  }
}

export default createContainer(params=>{
	const connected = Meteor.status().connected
	return {
    	connected
  	};
}, ServerConnector);
