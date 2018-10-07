import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

import {gameService} from './';

const uuidv1 = require('uuid/v1');

class NearbyService extends Service {

	constructor() {
		// reactive vars
		super("nearby", {
			discoveryServiceId: null, 		// service id to be discovered
			discoveryActive: false,			// true if discovery service is active
			advertistingServiceId: null, 	// service id to be advertised
			advertisingActive: false,		// true if advertising service is active
			discoveredEndpoint: null,		// endpoint discovered
			myEndpointName: uuidv1(),		// uuid for this endpoint
			myRole: "solo",				// solo - challengeServer - challengeClient
			challengeServerEndpoint: null	// id of the challenge Server
		});
		this.setupCallbacks();
	}

	setAdvertising = (value)=> {
		if(value != this.state.advertisingActive) {
			this.setReactive({advertisingActive: value});	
			if(value) {
				this.startAdvertising();
			} else {
				this.stopAdvertising();
			}
		}
	}

	setDiscovery = (value)=> {
		if(value != this.state.discoveryActive) {
			this.setReactive({discoveryActive: value});
			if(value) {
				this.startDiscovering();
			} else {
				this.stopDiscovering();
			}
		}
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
    		this.setReactive({discoveryActive: true});
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
		    console.log("foo");
		    console.log("onEndpointDiscovered", endpointId, endpointName, serviceId);
		    if(!this.state.discoveredEndpoint) {
		    	this.setReactive({discoveredEndpoint: endpointId});
		    	this.stopDiscovering();
				this.connectToDiscoveredEndpoint();
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
    		this.setReactive({discoveredEndpoint: null});
		});

		// this is fired on both sender's and receiver's ends
		NearbyConnection.onConnectionInitiatedToEndpoint(({
		    endpointId,             // ID of the endpoint wishing to connect
		    endpointName,           // The name of the remote device we're connecting to.
		    authenticationToken,    // A small symmetrical token that has been given to both devices.
		    serviceId,              // A unique identifier for the service
		    incomingConnection      // True if the connection request was initated from a remote device.
		}) => {
    		// Connection has been initated
    		console.log("onConnectionInitiatedToEndpoint", endpointId, endpointName, serviceId);
    		// Accept all connections for now
    		NearbyConnection.acceptConnection(serviceId, endpointId); 

		    this.setReactive({
		    	myRole: incomingConnection ? "challengeServer" : "challengeClient",
		    	challengeServerEndpoint: endpointId
		    });
		});

		NearbyConnection.onConnectedToEndpoint(({
		    endpointId,             // ID of the endpoint we connected to
		    endpointName,           // The name of the service
		    serviceId,              // A unique identifier for the service
		}) => {
		    // Succesful connection to an endpoint established
		    console.log("onConnectedToEndpoint", endpointId, endpointName, serviceId);
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
		    this.setReactive({advertisingActive: true});
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

	initConnection = ()=> {
		this.startDiscovering();
		this.discoveryTimeout = setTimeout(()=>{
			// no endpoint found, start advertising
			if(!this.state.discoveredEndpoint) {
				this.stopDiscovering();
				this.startAdvertising();	
			}
		}, 20000);
	}

	cancelConnection = ()=> {
		clearTimeout(this.discoveryTimeout);
		nearbyService.stopDiscovering();
		nearbyService.stopAdvertising();
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
  	  		challenge.name,
  	  		Strategy.P2P_STAR
		);
		this.setReactive({
			discoveryServiceId: challenge.name
		})	
	}

	connectToDiscoveredEndpoint() {
		let challenge = gameService.getActiveChallenge();
		if(!challenge || !this.state.discoveredEndpoint) return;
		console.log("nearby: connecting to ", challenge.name, this.state.discoveredEndpoint);
		NearbyConnection.connectToEndpoint(
    		challenge.name,         		// A unique identifier for the service
    		this.state.discoveredEndpoint   // ID of the endpoint to connect to
		);
	}

	stopDiscovering() {
		if(this.state.discoveryServiceId) {
			console.log("nearby: stopping discovery", this.state.discoveryServiceId);
			NearbyConnection.stopDiscovering(this.state.discoveryServiceId);
			this.setReactive({
				discoveryActive: false,
				discoveryServiceId: null,
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
			advertisingServiceId: challenge.name
		});		
	}

	stopAdvertising() {
		if(this.state.advertisingServiceId) {
			console.log("nearby: stopping advertising", this.state.advertisingServiceId);
			NearbyConnection.stopAdvertising(
    			this.state.advertistingServiceId
			);
			this.setReactive({
				advertisingActive: false,
				advertisingServiceId: null,
				endpoints: {}
			});
		}
	}
}

const nearbyService = new NearbyService();

export {nearbyService};