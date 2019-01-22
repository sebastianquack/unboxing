import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

import {gameService, storageService} from './';

const uuidv1 = require('uuid/v1');

const strategy = Strategy.P2P_CLUSTER;

class NearbyService extends Service {

	constructor() {
		// reactive vars
		super("nearbyService", {
			active: false,					// general on / off switch for nearby
			serviceId: null, 				// service id for discovery & advertising
			discoveryActive: false,			// true if discovery service is active
			advertisingActive: false,		// true if advertising service is active
			myEndpointName: uuidv1(),		// random unique name for this endpoint
			endpointIds: [], 				// all other devices in range 
			endpointInfo: {}
		});
		this.customCallbacks = {
			onConnectionEstablished: null, 	// not implemented
			onMessageReceived: null,
			onConnectionLost: null, 		// not implemented
		}
		this.receivedPayloads = {};
		this.setupNearbyCallbacks();		
		this.endpointPingInterval;
	}

	debug = (...msg) => {
		// this.showNotification(msg.join(", "));
		// console.log(msg);  
	}

	pingEndpoints = ()=> {
		if(this.state.active) {
			this.state.endpointIds.forEach((endpointId)=>{
				if(this.state.endpointInfo[endpointId].status != "connected") {
					this.connectToEndpoint(endpointId);
				} else {
					this.sendMessageToEndpoint(endpointId, "ping");		
				}
			});
		}
	}

	toggleActive = ()=> {
		this.setReactive({active: !this.state.active});

		if(this.state.active) {
			this.pingEndpoints();
			this.endpointPingInterval = setInterval(this.pingEndpoints, 20000);
		} else {
			clearInterval(this.endpointPingInterval);
		}
	}

	toggleDiscovery = ()=> {
		if(!this.state.discoveryActive) {
			this.startDiscovering();
			this.setReactive({discoveryActive: true});
		} else {
			this.stopDiscovering();
			this.setReactive({discoveryActive: false});
		}
	}

	toggleAdvertising = ()=> {
		if(!this.state.advertisingActive) {
			this.startAdvertising();
			this.setReactive({advertisingActive: true});
		} else {
			this.stopAdvertising();
			this.setReactive({advertisingActive: false});
		}
	}

	setCustomCallbacks(callbacks) {
		Object.keys(callbacks).forEach((key)=>{
			this.customCallbacks[key] = callbacks[key];
		});
		console.log(this.customCallbacks);
	}

	updateEndpointInfo(endpointId, update) {
		let newEndpointInfo = this.state.endpointInfo;

		if(!newEndpointInfo[endpointId]) {
			this.addEndpointId(endpointId);
			newEndpointInfo[endpointId] = {};
		}

		Object.keys(update).forEach((key)=>{
			newEndpointInfo[endpointId][key] = update[key];	
		});

		this.setReactive({endpointInfo: newEndpointInfo});
	}

	addEndpointId(endpointId) {
		let endpointIds = this.state.endpointIds;
		if(endpointIds.indexOf(endpointId) == -1) {			
			endpointIds.push(endpointId);
			this.setReactive({endpointIds: endpointIds});
		}
	}

	removeEndpointId(endpointId) {
		let endpointIds = this.state.endpointIds;
		const index = endpointIds.indexOf(endpointId)
		if(index > -1) {
			endpointIds.splice(index,1);
			this.setReactive({endpointIds: endpointIds});
		}
	}	

	setupNearbyCallbacks() {
		NearbyConnection.onDiscoveryStarting(({
    		serviceId               // A unique identifier for the service
		}) => {
			this.debug("onDiscoveryStarting", serviceId)
		});

		NearbyConnection.onDiscoveryStarted(({
    		serviceId               // A unique identifier for the service
		}) => {
    		// Discovery services has started
			this.debug("onDiscoveryStarted", serviceId);
		});

		NearbyConnection.onDiscoveryStartFailed(({
    		serviceId,              // A unique identifier for the service
    		statusCode              // The status of the response [See CommonStatusCodes](https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes)
		}) => {
			// Failed to start discovery service
			this.debug("onDiscoveryStartFailed", serviceId, statusCode);
		});

		NearbyConnection.onEndpointDiscovered(({
		    endpointId,             // ID of the endpoint wishing to connect
		    endpointName,           // The name of the remote device we're connecting to.
		    serviceId               // A unique identifier for the service
		}) => {
		    // An endpoint has been discovered we can connect to - save it!
		    this.debug("onEndpointDiscovered", endpointId, endpointName, serviceId);
		    this.updateEndpointInfo(endpointId, {status: "discovered"});
		});

		// Note - Can take up to 3 min to time out
		NearbyConnection.onEndpointLost(({
    		endpointId,             // ID of the endpoint we lost
    		endpointName,           // The name of the remote device we lost
    		serviceId               // A unique identifier for the service
		}) => {
			// Endpoint moved out of range or disconnected
    	this.debug("onEndpointLost", endpointId, endpointName, serviceId)
		});

		// this is fired on both sender's and receiver's ends - regardless of advertisting or discovery
		NearbyConnection.onConnectionInitiatedToEndpoint(({
		    endpointId,             // ID of the endpoint wishing to connect
		    endpointName,           // The name of the remote device we're connecting to.
		    authenticationToken,    // A small symmetrical token that has been given to both devices.
		    serviceId,              // A unique identifier for the service
		    incomingConnection      // True if the connection request was initated from a remote device.
		}) => {
    		// Connection has been initated
    		this.debug("onConnectionInitiatedToEndpoint", endpointId, endpointName, serviceId);
    		// Accept all connections for now
    		NearbyConnection.acceptConnection(serviceId, endpointId); 
		});

		NearbyConnection.onConnectedToEndpoint(({
		    endpointId,             // ID of the endpoint we connected to
		    endpointName,           // The name of the service
		    serviceId,              // A unique identifier for the service
		}) => {
		    // Succesful connection to an endpoint established
		    this.debug("onConnectedToEndpoint", endpointId, endpointName, serviceId);
		    this.updateEndpointInfo(endpointId, {status: "connected"});
		});

		NearbyConnection.onAdvertisingStarting(({
		    endpointName,            // The name of the service thats starting to advertise
		    serviceId,               // A unique identifier for the service
		}) => {
		    // Advertising service is starting
		    this.debug("onAdvertisingStarting", serviceId);
		});

		NearbyConnection.onAdvertisingStarted(({
		    endpointName,            // The name of the service thats started to advertise
		    serviceId,               // A unique identifier for the service
		}) => {
		    // Advertising service has started
		    this.debug("onAdvertisingStarted", endpointName, serviceId);
		    this.setReactive({advertisingActive: true});
		});

		NearbyConnection.onAdvertisingStartFailed(({
		    endpointName,            // The name of the service thats failed to start to advertising
		    serviceId,               // A unique identifier for the service
		    statusCode,              // The status of the response [See CommonStatusCodes](https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes)
		}) => {
		    // Failed to start advertising service
		    this.debug("onAdvertisingStartFailed", endpointName, serviceId, statusCode);
		});

		NearbyConnection.onSendPayloadFailed(({
    serviceId,              // A unique identifier for the service
    endpointId,             // ID of the endpoint wishing to connect
    statusCode              // The status of the response [See CommonStatusCodes](https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes)
		}) => {
    	// Failed to send a payload
    	this.debug("onSendPayloadFailed", endpointId, serviceId, statusCode);
    	this.connectToEndpoint(endpointId, serviceId);
		});

		NearbyConnection.onReceivePayload(({
    		serviceId,              // A unique identifier for the service
    		endpointId,             // ID of the endpoint we got the payload from
    		payloadType,            // The type of this payload (File or a Stream) [See Payload](https://developers.google.com/android/reference/com/google/android/gms/nearby/connection/Payload)
    		payloadId               // Unique identifier of the payload
		}) => {
    		// Payload has been received
    		//this.debug("onReceivePayload");
    		const theEndpointId = endpointId;
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
				this.debug("payload from ", theEndpointId, bytes);
			    try {
			        msgObj = JSON.parse(bytes);
			    } catch(e) {
			        this.debug(e);
			        msgObj = {message: bytes};
				}
				
				if (!this.receivedPayloads[msgObj.uuid]) {
					this.receivedPayloads[msgObj.uuid] = true;
					this.broadcastMessage(msgObj)
					if(typeof this.customCallbacks.onMessageReceived === "function") {
						this.customCallbacks.onMessageReceived(msgObj);
					}	
				}
	    
			});
		});
	}

	startDiscovering() {
		// begin discovery of services
		NearbyConnection.startDiscovering(
  	  		"test",
  	  		strategy
		);
	}

	connectToEndpoint(endpointId, serviceId="test") {
		this.debug("nearby: connecting to ", serviceId, endpointId);
		NearbyConnection.connectToEndpoint(
    		serviceId,         // A unique identifier for the service
    		endpointId
		);
	}

	// send message to an endpoint
	sendMessageToEndpoint(endpointId, message) {
		this.debug("sendMessageToEndpoint", endpointId, message);
		NearbyConnection.sendBytes(
  		  "test",           // A unique identifier for the service
    		endpointId,    					// ID of the endpoint
    		JSON.stringify(message)  		// A string of bytes to send
		);
	}

	broadcastMessage = (message) => {
		if (!message.uuid) {
			message.uuid = uuidv1()
		}
		this.state.endpointIds.forEach((endpointId)=>{
			this.sendMessageToEndpoint(endpointId, message);
		})
	}

	stopDiscovering() {
		this.debug("nearby: stopping discovery");

		NearbyConnection.stopDiscovering("test");
		
		this.setReactive({
			discoveryActive: false
		});		
	}

	startAdvertising() {
		NearbyConnection.startAdvertising(
		    storageService.getDeviceId(),
    		"test",
    		strategy
		);
	}

	stopAdvertising() {
		if(this.state.advertisingActive) {
			this.debug("nearby: stopping advertising", storageService.getDeviceId());
			NearbyConnection.stopAdvertising(
    			storageService.getDeviceId()
			);
			this.setReactive({
				advertisingActive: false
			});
		}
	}
}

const nearbyService = new NearbyService();

export {nearbyService};