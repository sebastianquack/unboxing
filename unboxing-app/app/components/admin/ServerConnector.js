import React, { Component } from 'react';

import {
  Text,
  View,
	TextInput,
	TouchableOpacity
} from 'react-native';

import compose from 'lodash.flowright'

import {globalStyles} from '../../../config/globalStyles';
import { withNetworkService, withStorageService } from '../ServiceConnector';
import { networkService, storageService } from '../../services';

class ServerConnector extends React.Component { 
  constructor(props) {
  	super(props);
  	this.state = {
			serverInput: this.props.networkService.server,
			deviceIdInput: this.props.storageService.customDeviceId
  	}
  }

	handleGetPress = () => {
		storageService.updateEverything()
	}

  render() {
		const connectionType = this.props.networkService.connectionInfo ? this.props.networkService.connectionInfo.type : null
		const effectiveConnectionType = this.props.networkService.connectionInfo ? this.props.networkService.connectionInfo.effectiveType: null
		const lastApiResult = this.props.networkService.lastApiResult
		const deviceId = storageService.getDeviceId();
		const imeiDeviceId = storageService.getImeiDeviceId();
  	return (
  		<View>
				<TextInput
					underlineColorAndroid='transparent'
					style={{width: 40, height: 40, borderColor: 'gray', borderWidth: 1}}
					value={this.state.deviceIdInput}
					onChangeText={(text) => this.setState({deviceIdInput: text})}
					onSubmitEditing={(e) => storageService.setCustomDeviceId(this.state.deviceIdInput) }
				/>				
				<Text>
					Current deviceId: {" "}{deviceId}
				</Text>
				
				<Text>
					IMEI: {" "}
					<Text>{this.props.networkService.imei} (id: {imeiDeviceId})</Text>
				</Text>
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

export default compose(withNetworkService, withStorageService)(ServerConnector);
