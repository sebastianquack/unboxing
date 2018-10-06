import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

import {gameService} from './';

const uuidv1 = require('uuid/v1');

class NearbyService extends Service {

	constructor() {
		// reactive vars
		super("nearby", {
			discovery_service_id: null, 	// service id to be discovered
			discovery_active: false,		// true if discovery service is active
			advertisting_service_id: null, 	// service id to be advertised
			advertising_active: false,		// true if advertising service is active
			endpoints: {},					// endpoints discovered
			endpointName: uuidv1()			// uuid for this endpoint
		});
		this.setupCallbacks();
	}

	getNumEndpoints() {
		return Object.keys(this.state.endpoints).length;
	}

	setupCallbacks() {
		NearbyConnection.onDiscoveryStarting(({
    		serviceId               // A unique identifier for the service
		}) => {
    		console.log("onDiscoveryStarting", serviceId);    	
		});

		NearbyConnection.onDiscoveryStarted(({
    		serviceId               // A unique identifier for the service
		}) => {
    		// Discovery services has started
			console.log("onDiscoveryStarted", serviceId);
    		this.setReactive({discovery_active: true});
		});

		NearbyConnection.onDiscoveryStartFailed(({
    		serviceId,              // A unique identifier for the service
    		statusCode              // The status of the response [See CommonStatusCodes](https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes)
		}) => {
			// Failed to start discovery service
			console.log("onDiscoveryStartFailed", serviceId, statusCode);
		});

		NearbyConnection.onEndpointDiscovered(({
		    endpointId,             // ID of the endpoint wishing to connect
		    endpointName,           // The name of the remote device we're connecting to.
		    serviceId               // A unique identifier for the service
		}) => {
		    // An endpoint has been discovered we can connect to
		    console.log("onEndpointDiscovered", endpointId, endpointName, serviceId);
		    if(!this.state.endpoints[endpointId]) {
		    	let endpoints = this.state.endpoints;
		    	endpoints[endpointId] = endpointName;
		    	this.setReactive({endpoints: endpoints});
		    }
		});

		// Note - Can take up to 3 min to time out
		NearbyConnection.onEndpointLost(({
    		endpointId,             // ID of the endpoint we lost
    		endpointName,           // The name of the remote device we lost
    		serviceId               // A unique identifier for the service
		}) => {
    		// Endpoint moved out of range or disconnected
    		console.log("onEndpointLost", endpointId, endpointName, serviceId)
    		if(this.state.endpoints[endpointId]) {
		    	let endpoints = this.state.endpoints;
		    	delete endpoints[endpointId];
		    	this.setReactive({endpoints: endpoints});
		    }
		});

		NearbyConnection.onAdvertisingStarting(({
		    endpointName,            // The name of the service thats starting to advertise
		    serviceId,               // A unique identifier for the service
		}) => {
		    // Advertising service is starting
		    console.log("onAdvertisingStarting", serviceId);
		});

		NearbyConnection.onAdvertisingStarted(({
		    endpointName,            // The name of the service thats started to advertise
		    serviceId,               // A unique identifier for the service
		}) => {
		    // Advertising service has started
		    console.log("onAdvertisingStarted", endpointName, serviceId);
		    this.setReactive({advertising_active: true});
		});

		NearbyConnection.onAdvertisingStartFailed(({
		    endpointName,            // The name of the service thats failed to start to advertising
		    serviceId,               // A unique identifier for the service
		    statusCode,              // The status of the response [See CommonStatusCodes](https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes)
		}) => {
		    // Failed to start advertising service
		    console.log("onAdvertisingStartFailed", endpointName, serviceId, statusCode);
		});
	}

	startDiscovering() {
		let challenge = gameService.getActiveChallenge();
		if(!challenge) {
			//console.log("nearby: no active challenge, do not know what to discover")
			//return;
			challenge = {name: "test"};
		}

		// begin discovery of service with challenge id
		NearbyConnection.startDiscovering(
  	  		challenge.name
		);
		this.setReactive({
			discovery_service_id: challenge.name
		})	
	}

	stopDiscovering() {
		if(this.state.discovery_service_id) {
			console.log("nearby: stopping discovery", this.state.discovery_service_id);
			NearbyConnection.stopDiscovering(this.state.discovery_service_id);
			this.setReactive({
				discovery_active: false,
				discovery_service_id: null,
				endpoints: {}
			});	
		}
	}

	startAdvertising() {
		let challenge = gameService.getActiveChallenge();
		if(!challenge) {
			//console.log("nearby: no active challenge, do not know what to advertise")
			//return;
			challenge = {name: "test"};
		}

		NearbyConnection.startAdvertising(
		    this.state.endpointName,
    		challenge.name,              
    		Strategy.P2P_STAR
		);
		this.setReactive({
			advertising_service_id: challenge.name
		});		
	}

	stopAdvertising() {
		if(this.state.advertising_service_id) {
			console.log("nearby: stopping advertising", this.state.advertising_service_id);
			NearbyConnection.stopAdvertising(
    			this.state.advertisting_service_id
			);
			this.setReactive({
				advertising_active: false,
				advertising_service_id: null,
				endpoints: {}
			});
		}
	}

	toggleDiscovery() {
		if(this.state.discovery_service_id) {
			this.stopDiscovering();
		} else {
			this.startDiscovering();
		}
	}

	toggleAdvertising() {
		if(this.state.advertising_service_id) {
			this.stopAdvertising();
		} else {
			this.startAdvertising();
		}
	}
	
}

const nearbyService = new NearbyService();

export {nearbyService};