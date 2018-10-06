import React, { Component } from 'react';

import {
  Text,
  View,
	TextInput,
	TouchableOpacity
} from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import { withServices } from './ServiceConnector';
import { networkService, storageService } from '../services';

class ServerConnector extends React.Component { 
  constructor(props) {
  	super(props);
  	this.state = {
      serverInput: this.props.services.network.server
  	}
  }

	handleGetPress = () => {
		storageService.updateEverything()
	}

  render() {
  	return (
  		<View>
				<Text>
					Connection Type: {this.props.services.network.connectionInfo ? this.props.services.network.connectionInfo.type : null}, effective: {this.props.services.network.connectionInfo ? this.props.services.network.connectionInfo.effectiveType: null}
				</Text>
				<Text style={{marginTop: 20}}>
					Server: {this.props.services.network.server}
				</Text>
				<TextInput
					underlineColorAndroid='transparent'
					style={{width: 150, height: 40, borderColor: 'gray', borderWidth: 1}}
					value={this.state.serverInput}
					onChangeText={(text) => this.setState({serverInput: text})}
					onSubmitEditing={(e) => networkService.setServer(this.state.serverInput)}
				/>
				<TouchableOpacity style={globalStyles.button} onPress={this.handleGetPress}>
					<Text>Get Everything ({this.props.services.storage.version})</Text>
				</TouchableOpacity>					
  		</View>
  	);
  }
}

export default withServices(ServerConnector);
