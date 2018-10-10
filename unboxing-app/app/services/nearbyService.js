import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

import {gameService} from './';

const uuidv1 = require('uuid/v1');

class NearbyService extends Service {

	constructor() {
		// reactive vars
		super("nearby", {
			serviceId: null, 				// service id for discovery & advertising
			discoveryActive: false,			// true if discovery service is active
			advertisingActive: false,		// true if advertising service is active
			myEndpointName: uuidv1(),		// random unique name for this endpoint
			myRole: "solo",					// solo - server - client
			serverEndpointId: null,			// endpoint of servier, if client
			clientEndpointIds: [],			// connected clients, if server
		});
		this.customCallbacks = {
			onConnectionEstablished: null,
			onMessageReceived: null,
			onConnectionLost: null,
		}
		this.setupNearbyCallbacks();
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

	setCustomCallbacks(callbacks) {
		Object.keys(callbacks).forEach((key)=>{
			this.customCallbacks[key] = callbacks[key];
		});
		console.log(this.customCallbacks);
	}

	getMyRole() {
		return this.state.myRole;
	}

	getNumParticipants() {
		if(this.state.myRole == "server") {
			return this.state.clientEndpointIds.length + 1;
		}
		if(this.state.myRole == "client") {
			// todo: ask server for num participants
		}
		return 1;
	}

	setupNearbyCallbacks() {
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
		    console.log("onEndpointDiscovered", endpointId, endpointName, serviceId);
		    if(!this.state.serverEndpointId) {
		    	this.setReactive({serverEndpointId: endpointId});
		    	this.stopDiscovering();
				this.connectToServerEndpoint();
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
		    	myRole: incomingConnection ? "server" : "client"
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
		    
		    if(typeof this.customCallbacks.onConnectionEstablished === "function") {
		    	this.customCallbacks.onConnectionEstablished();
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
				let msgObj = {};
				console.log("payload: ", bytes);
			    try {
			        msgObj = JSON.parse(bytes);
			    } catch(e) {
			        console.log(e);
			        msgObj = {message: bytes};
			    }

				// relay messages through server
				if(msgObj.type == "broadcast" && this.state.myRole == "server") {
					this.sendMessageToClients(msgObj.message);
				}

				if(typeof this.customCallbacks.onMessageReceived === "function") {
		    		this.customCallbacks.onMessageReceived(msgObj.message);
		    	}		    
			});
		});
	}

	initConnection = (serviceId)=> {
		this.setReactive({serviceId: serviceId});
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
			serviceId: null,
			clientEndpointIds: [],
			myRole: "solo"	
		});
	}
	
	startDiscovering() {
		// begin discovery of service
		NearbyConnection.startDiscovering(
  	  		this.state.serviceId ? this.state.serviceId : "test",
  	  		Strategy.P2P_STAR
		);
	}

	connectToServerEndpoint() {
		if(!this.state.serviceId || !this.state.serverEndpointId) return;
		console.log("nearby: connecting to ", this.state.serviceId, this.state.serverEndpointId);
		NearbyConnection.connectToEndpoint(
    		this.state.serviceId,         // A unique identifier for the service
    		this.state.serverEndpointId   // ID of the endpoint to connect to
		);
	}

	// send a message to server
	sendMessageToServer(message) {
		if(!this.state.serviceId || !this.state.serverEndpointId || this.state.myRole != "client") return;
		console.log("sendMessageToServer", message, this.state.serverEndpointId);
		NearbyConnection.sendBytes(
  		  	this.state.serviceId,           // A unique identifier for the service
    		this.state.serverEndpointId,    // ID of the endpoint
    		JSON.stringify(message)  		// A string of bytes to send
		);
	}

	// send a message to all connected clients
	sendMessageToClients(message) {
		if(!this.state.serviceId || this.state.myRole != "server") return;
		console.log("sendMessageToClients", message, this.state.clientEndpointIds);
		console.log(JSON.stringify(message));
		this.state.clientEndpointIds.forEach((clientEndpointId)=>{
			NearbyConnection.sendBytes(
	  		  	this.state.serviceId,     	// A unique identifier for the service
	    		clientEndpointId,   		// ID of the endpoint
	    		JSON.stringify(message) 	// A string of bytes to send
			);		
		});
	}

	broadcastMessage(message) {
		if(this.state.myRole == "server") {
			this.sendMessageToClients({type: "broadcast", message: message});
		}

		if(this.state.myRole == "client") {
			this.sendMessageToServer({type: "broadcast", message: message});	
		}
	}

	stopDiscovering() {
		if(this.state.discoveryActive) {
			console.log("nearby: stopping discovery", this.state.serviceId);
			NearbyConnection.stopDiscovering(this.state.serviceId);
			this.setReactive({
				discoveryActive: false
			});	
		}
	}

	startAdvertising() {
		NearbyConnection.startAdvertising(
		    this.state.myEndpointName,
    		this.state.serviceId ? this.state.serviceId : "test",
    		Strategy.P2P_STAR
		);
	}

	stopAdvertising() {
		if(this.state.advertisingActive) {
			console.log("nearby: stopping advertising", this.state.serviceId);
			NearbyConnection.stopAdvertising(
    			this.state.serviceId
			);
			this.setReactive({
				advertisingActive: false
			});
		}
	}
}

const nearbyService = new NearbyService();

export {nearbyService};