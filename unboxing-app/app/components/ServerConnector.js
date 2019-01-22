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
			serverInput: this.props.networkService.server,
			deviceIdInput: this.props.storageService.deviceId
  	}
  }

	handleGetPress = () => {
		storageService.updateEverything()
	}

  render() {
		const connectionType = this.props.networkService.connectionInfo ? this.props.networkService.connectionInfo.type : null
		const effectiveConnectionType = this.props.networkService.connectionInfo ? this.props.networkService.connectionInfo.effectiveType: null
		const lastApiResult = this.props.networkService.lastApiResult
  	return (
  		<View>
				<TextInput
					underlineColorAndroid='transparent'
					style={{width: 40, height: 40, borderColor: 'gray', borderWidth: 1}}
					value={this.state.deviceIdInput}
					onChangeText={(text) => this.setState({deviceIdInput: text})}
					onSubmitEditing={(e) => storageService.setDeviceId(this.state.deviceIdInput) }
				/>				
				<Text>
					Connection Type: {" "}
					<Text style={ (connectionType == "none" ? globalStyles.bad : globalStyles.good) }>{connectionType}</Text>
				</Text>
				<Text>
					Effective Connection Type: {effectiveConnectionType}
				</Text>				
				<Text style={{marginTop: 20}}>
					Server: {this.props.networkService.server}
				</Text>
				<TextInput
					underlineColorAndroid='transparent'
					style={{width: 150, height: 40, borderColor: 'gray', borderWidth: 1}}
					value={this.state.serverInput}
					onChangeText={(text) => this.setState({serverInput: text})}
					onSubmitEditing={(e) => networkService.setServer(this.state.serverInput)}
				/>
				<TouchableOpacity style={globalStyles.button} onPress={this.handleGetPress}>
					<Text>Get Everything ({this.props.storageService.version}) {lastApiResult}</Text>
				</TouchableOpacity>					
  		</View>
  	);
  }
}

export default withServices(ServerConnector, ["networkService", "storageService"]);
