import React, { Component } from 'react';

import {
  Text,
  View,
  TextInput
} from 'react-native';

import { withServices } from './ServiceConnector';
import { networkService } from '../services';

class ServerConnector extends React.Component { 
  constructor(props) {
  	super(props);
  	this.state = {
      serverInput: this.props.services.network.server
  	}
  }

  componentDidMount() {
		console.log(networkService)
  }

  render() {
  	return (
  		<View>
	  		<Text style={{marginTop: 20}}>Server: {this.props.services.network.server}</Text>
	        <TextInput
	          underlineColorAndroid='transparent'
	          style={{width: 150, height: 40, borderColor: 'gray', borderWidth: 1}}
	          value={this.state.serverInput}
	          onChangeText={(text) => this.setState({serverInput: text})}
	          onSubmitEditing={(e) => networkService.setServer(this.state.serverInput)}
	        />
  		</View>
  	);
  }
}

export default withServices(ServerConnector);
