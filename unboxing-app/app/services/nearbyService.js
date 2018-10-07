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
			myEndpointName: uuidv1(),		// random unique name for this endpoint
			myRole: "solo",					// solo - challengeServer - challengeClient
			serverEndpointId: null,			// endpoint of servier, if client
			clientEndpointIds: [],			// connected clients, if server
			challengeServerEndpointId: null	// id of the challenge Server
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

	getMyRole() {
		return this.state.myRole;
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
		    if(!this.state.serverEndpointId) {
		    	this.setReactive({serverEndpointId: endpointId});
		    	this.stopDiscovering();
				this.connectToserverEndpointId();
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
    		this.setReactive({serverEndpointId: null});
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
		    	myRole: incomingConnection ? "challengeServer" : "challengeClient"
		    });

		    if(incomingConnection) {
		    	let clientEndpointIds = this.state.clientEndpointIds;
		    	if(clientEndpointIds.indexOf(endpointId) == -1) {
		    		clientEndpointIds.push(endpointId);	
		    		this.setReactive({clientEndpointIds: clientEndpointIds});
		    	}
		    }
		});

		NearbyConnection.onConnectedToEndpoint(({
		    endpointId,             // ID of the endpoint we connected to
		    endpointName,           // The name of the service
		    serviceId,              // A unique identifier for the service
		}) => {
		    // Succesful connection to an endpoint established
		    console.log("onConnectedToEndpoint", endpointId, endpointName, serviceId);
		    if(this.state.myRole == "challengeClient") {
		    	this.sendMessageToChallengeServer("hello server");
		    } 
		    if(this.state.myRole == "challengeServer") {
		    	this.sendMessageToChallengeClients("hello to all clients");	
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

		NearbyConnection.onReceivePayload(({
    		serviceId,              // A unique identifier for the service
    		endpointId,             // ID of the endpoint we got the payload from
    		payloadType,            // The type of this payload (File or a Stream) [See Payload](https://developers.google.com/android/reference/com/google/android/gms/nearby/connection/Payload)
    		payloadId               // Unique identifier of the payload
		}) => {
    		// Payload has been received
    		console.log("onReceivePayload");
			NearbyConnection.readBytes(
			    serviceId,               // A unique identifier for the service
			    endpointId,              // ID of the endpoint wishing to stop playing audio from
			    payloadId                // Unique identifier of the payload
			).then(({
			    type,                    // The Payload.Type represented by this payload
			    bytes,                   // [Payload.Type.BYTES] The bytes string that was sent
			    payloadId,               // [Payload.Type.FILE or Payload.Type.STREAM] The payloadId of the payload this payload is describing
			    filename,                // [Payload.Type.FILE] The name of the file being sent
			    metadata,                // [Payload.Type.FILE] The metadata sent along with the file
			    streamType,              // [Payload.Type.STREAM] The type of stream this is [audio or video]
			}) => {
				console.log("message received: ", bytes);
			});
		});
	}

	initConnection = ()=> {
		this.startDiscovering();
		this.discoveryTimeout = setTimeout(()=>{
			// no endpoint found, start advertising
			if(!this.state.serverEndpointId) {
				this.stopDiscovering();
				this.startAdvertising();	
			}
		}, 20000);
	}

	cancelConnection = ()=> {
		clearTimeout(this.discoveryTimeout);
		nearbyService.stopDiscovering();
		nearbyService.stopAdvertising();
		this.setReactive({
			serverEndpointId: null,
			clientEndpointIds: [],
			myRole: "solo"	
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
  	  		challenge.name,
  	  		Strategy.P2P_STAR
		);
		this.setReactive({
			discoveryServiceId: challenge.name
		})	
	}

	connectToserverEndpointId() {
		let challenge = gameService.getActiveChallenge();
		if(!challenge || !this.state.serverEndpointId) return;
		console.log("nearby: connecting to ", challenge.name, this.state.serverEndpointId);
		NearbyConnection.connectToEndpoint(
    		challenge.name,         		// A unique identifier for the service
    		this.state.serverEndpointId   // ID of the endpoint to connect to
		);
	}

	// send a message to server
	sendMessageToChallengeServer(message) {
		let challenge = gameService.getActiveChallenge();
		if(!challenge || !this.state.serverEndpointId || this.state.myRole != "challengeClient") return;
		console.log("sendMessageToChallengeServer", message, this.state.serverEndpointId);
		NearbyConnection.sendBytes(
  		  	challenge.name,               		// A unique identifier for the service
    		this.state.serverEndpointId,    // ID of the endpoint
    		message                    			// A string of bytes to send
		);
	}

	// send a message to all connected clients
	sendMessageToChallengeClients(message) {
		let challenge = gameService.getActiveChallenge();
		if(!challenge || this.state.myRole != "challengeServer") return;
		console.log("sendMessageToChallengeClients", message, this.state.clientEndpointIds);
		this.state.clientEndpointIds.forEach((clientEndpointId)=>{
			NearbyConnection.sendBytes(
	  		  	challenge.name,               		// A unique identifier for the service
	    		clientEndpointId,   				// ID of the endpoint
	    		message                    			// A string of bytes to send
			);		
		});
	}

	stopDiscovering() {
		if(this.state.discoveryServiceId) {
			console.log("nearby: stopping discovery", this.state.discoveryServiceId);
			NearbyConnection.stopDiscovering(this.state.discoveryServiceId);
			this.setReactive({
				discoveryActive: false,
				discoveryServiceId: null,
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
			});
		}
	}
}

const nearbyService = new NearbyService();

export {nearbyService};