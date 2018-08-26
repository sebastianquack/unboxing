import React, { Component } from 'react';

import {
  Text,
  View,
  TextInput
} from 'react-native';

import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';
import Zeroconf from 'react-native-zeroconf';

var RNFS = require('react-native-fs');

var defaultServer = "192.168.1.2"; // local file on device overrides this setting

class ServerConnector extends React.Component { 
  constructor(props) {
  	super(props);
  	this.state = {
  		currentServer: defaultServer,
      	serverInput: defaultServer
  	}
  	this.updateServer = this.updateServer.bind(this);
    this.loadLocalConfig = this.loadLocalConfig.bind(this);
    this.initZeroconf = this.initZeroconf.bind(this);

  }

  componentDidMount() {
    this.initZeroconf()
    //this.loadLocalConfig();
  }

  initZeroconf() {
    const zeroconf = new Zeroconf();
    zeroconf.scan(type = 'http', protocol = 'tcp', domain = 'local.');
    zeroconf.on('start', () => console.log('The scan has started.'));
    zeroconf.on('update', () => {
      const zc_services = zeroconf.getServices()
      console.log("update " + JSON.stringify(zc_services))
      const servers = []
      for (key in zc_services) {
        const parts = key.split("_")
        if (parts[0]=="unboxing") {
          servers.push(`${parts[1]}.${parts[2]}.${parts[3]}.${parts[4]}`)
        }
      }
      if (servers.length > 0) {
        console.log(">>> found unboxing servers", servers)
        this.updateServer(servers[0])
      }
    });
    zeroconf.on('resolved', data => console.log("resolved " + JSON.stringify(data)));
    zeroconf.on('error', data => console.log("error " + JSON.stringify(data)))
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
      }, ()=>this.updateServer(localConfig.defaultServerIp));
    })
    .catch((err) => {
      console.log(err.message, err.code);
      // this.updateServer();
    });
  }

  updateServer(host) {
    if (!host) host = this.state.serverInput
    console.log(host)
    console.log("updating server to " + host);

    // this.state.currentServer = this.state.serverInput;
    // todo: save back to config file

    Meteor.disconnect();
    this.setState({ currentServer: host }, () => {
      if(this.state.currentServer) {
        console.log("connecting to " + this.state.currentServer);
        Meteor.connect('ws://'+this.state.currentServer+':3000/websocket');  
      }    
    })
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
	          onSubmitEditing={(e) => this.updateServer(this.state.serverInput)}
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
