import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

import {gameService, storageService, soundService} from './';

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
			endpointInfo: {},				// status of all known endpoints {myNearbyStatus: "discovered" / "connected", meshStatus: "available" / "unknown"}
		});
		this.customCallbacks = {
			onConnectionEstablished: null, 	// not implemented
			onMessageReceived: null,
			onConnectionLost: null, 		// not implemented
		}
		this.receivedPayloads = {};
		this.setupNearbyCallbacks();		
		
		this.endpointPingInterval;
		this.endpointPingIntervalTime = 5000; // rythm of checking enpointInfo and initiating connections
		this.healthCheckInterval = 20000; // rythm of checking in with connected nodes
		this.healthCheckTimeout = 2000; // timout before assuming connection is lost
	}

	debug = (...msg) => {
		// this.showNotification(msg.join(", "));
		console.log(msg);  
	}

	// for example count these: ("myNearbyStatus", "connected")
	countEndpointsWithStatus(statusKey, statusValue) {
		return Object.values(this.state.endpointInfo).filter( (value) => {
			(value[statusKey] === statusValue)
		}).length
	}

	toggleActive = ()=> {
		this.setReactive({active: !this.state.active});

		if(this.state.active) {
			this.pingEndpoints();
			this.endpointPingInterval = setInterval(this.pingEndpoints, this.endpointPingIntervalTime);
		} else {
			clearInterval(this.endpointPingInterval);
		}

	}
	
	pingEndpoints = ()=> {
		if(this.state.active) {

			console.log("ping endpoints");
			
			let connectionCounter = 0; 
			const connectionMaxPerPing = 1; // maximum number of connections to initiate at the same time

			Object.keys(this.state.endpointInfo).forEach((endpointId)=>{
				
				if(this.state.endpointInfo[endpointId].myNearbyStatus == "discovered") {

					// if less than 2 connected endpoints and discovered endpoint is not available in mesh, connect
					if (
						this.countEndpointsWithStatus("myNearbyStatus", "connected") < 2 
						&& this.state.endpointInfo[endpointId]
						&& this.state.endpointInfo[endpointId].meshStatus !== "available" 
						&& connectionCounter < connectionMaxPerPing) {

							this.connectToEndpoint(endpointId);
							this.updateEndpointInfo(endpointId, {myNearbyStatus: "connecting"});
							connectionCounter++;
					}
				}

				if(this.state.endpointInfo[endpointId].myNearbyStatus == "connected") { 

					let lastHealthCheckSent = this.state.endpointInfo[endpointId].lastHealthCheckSent || 0;
					let timeSinceHealthCheckSent = soundService.getSyncTime() - lastHealthCheckSent;
					
					// have we sent a health check to this node?
					if(lastHealthCheckSent > 0) {
						// should we be expecting to have a response?
						if(timeSinceHealthCheckSent > this.healthCheckTimeout) {
							if(!this.state.endpointInfo[endpointId].lastHeardFrom ||
								this.state.endpointInfo[endpointId].lastHeardFrom - lastHealthCheckSent	>	this.healthCheckTimeout						
							) {
								// we lost connection
								this.showNotification("connection lost to " + this.state.endpointInfo[endpointId].name);
								this.updateEndpointInfo(endpointId, {myNearbyStatus: "lost"});
							}
						}
					}

					// is it time to send another health check request?
					if(timeSinceHealthCheckSent > this.healthCheckInterval) {
						// send a health check message
						this.sendMessageToEndpoint(endpointId, {message: "healthCheck"});
						this.updateEndpointInfo(endpointId, {lastHealthCheckSent: soundService.getSyncTime()});
					}
					
				}
				
			});
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

	// update the endpointInfo object for a specified endpoint, only change the keys in update object
	updateEndpointInfo(endpointId, update) {
		let newEndpointInfo = this.state.endpointInfo;

		if(!newEndpointInfo[endpointId]) {
			newEndpointInfo[endpointId] = {};
		}

		Object.keys(update).forEach((key)=>{
			newEndpointInfo[endpointId][key] = update[key];	
		});

		this.setReactive({endpointInfo: newEndpointInfo});
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
		    endpointId,             // ID of the endpoint discovered
		    endpointName,           // The name of the remote device we're connecting to. -> this seems to be the only point were we have id and name
		    serviceId               // A unique identifier for the service
		}) => {
		    // An endpoint has been discovered we can connect to - save it!
		    this.debug("onEndpointDiscovered", endpointId, endpointName, serviceId);
				this.updateEndpointInfo(endpointId, {myNearbyStatus: "discovered", name: endpointName});
				
				// connection is initiated in pingEndpoints
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
		    endpointName,           // The name of the remote device we're connecting to. // this is always discoverer
		    authenticationToken,    // A small symmetrical token that has been given to both devices.
		    serviceId,              // A unique identifier for the service
		    incomingConnection      // True if the connection request was initated from a remote device. - possibly set the wrong way?
		}) => {
    		// Connection has been initated
				this.debug("onConnectionInitiatedToEndpoint", endpointId, endpointName, serviceId);
				//this.showNotification("onConnectionInitiatedToEndpoint: " + endpointId + " " + endpointName + " " + serviceId);

    		// Accept all connections for now
    		NearbyConnection.acceptConnection(serviceId, endpointId); 
		});

		NearbyConnection.onConnectedToEndpoint(({
		    endpointId,             // ID of the endpoint we connected to
		    endpointName,           // this is always discoverers name? not sure - can also be advertisers name if we are on discoverer
		    serviceId,              // A unique identifier for the service
		}) => {
		    // Succesful connection to an endpoint established
				this.debug("onConnectedToEndpoint", endpointId, endpointName, serviceId);
				//this.showNotification("onConnectedToEndpoint: " + endpointId + " " + endpointName + " " + serviceId);
				
				// update local endpointInfo object
				this.updateEndpointInfo(endpointId, {
					myNearbyStatus: "connected", 
					lastHeardFrom: soundService.getSyncTime(),
					meshStatus: "available"
				});
				
				// broadcast endpointInfo object
				this.broadcastMessage({
					message: "endpointInfo",
					originator: storageService.getDeviceId(),
					endpointInfo: this.state.endpointInfo
				})
				// possibly turn off discovery here if 2 connections
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
    	//this.connectToEndpoint(endpointId, serviceId);
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
			    endpointId,              // ID of the endpoint 
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

				//this.showNotification("message received from " + endpointId + ": " + bytes)

				// always update the sender information
				if(!this.state.endpointInfo[endpointId]) {
					this.state.endpointInfo[endpointId] = {};
				}
				this.state.endpointInfo[endpointId].name = msgObj.sender;
				this.state.endpointInfo[endpointId].lastHeardFrom = soundServive.getSyncTime();
				this.setReactive({endpointInfo: this.state.endpointInfo});
				
				// tell sender about her own id (and only do this once)
				if(msgObj.message == "idPingback")	{
					if(!this.state.endpointInfo[msgObj.endpointId]) {
						this.state.endpointInfo[msgObj.endpointId] = {};
					}
					// set my own name for this id if someone sends me a message with idPingback
					this.state.endpointInfo[msgObj.endpointId].name = storageService.getDeviceId();
					this.setReactive({endpointInfo: this.state.endpointInfo});
				} else {
					// if this is not a pingback message, do the pingback
					this.sendMessageToEndpoint(endpointId, {message: "idPingback", endpointId: endpointId});
				}
				
				// check if received for the first time & forward
				if (msgObj.message != "idPingback" && !this.receivedPayloads[msgObj.uuid]) {
					this.receivedPayloads[msgObj.uuid] = true;
					this.broadcastMessage(msgObj, endpointId) // todo optimize dont send back to sender

					// update message status from received object
					if (msgObj.message === "endpointInfo") {	
					
						for ( let key in msgObj.endpointInfo) {
							if(!this.state.endpointInfo[key]) {
								this.state.endpointInfo[key] = {};
							}
							this.state.endpointInfo[key].meshStatus = msgObj.endpointInfo[key].meshStatus
							// just extract and copy names for future reference
							if(msgObj.endpointInfo[key].name) {
								this.state.endpointInfo[key].name = msgObj.endpointInfo[key].name
							}
						}
						this.setReactive({endpointInfo: this.state.endpointInfo});
					
					}

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
		message.sender = storageService.getDeviceId();
		console.log("sendMessageToEndpoint", endpointId, message);
		NearbyConnection.sendBytes(
  		  "test",           // A unique identifier for the service
    		endpointId,    					// ID of the endpoint
    		JSON.stringify(message)  		// A string of bytes to send
		);
	}

	// send message to all connected endpoints, exlude one (usually where it came from)
	broadcastMessage = (message, excludeId) => {
		if (!message.uuid) {
			message.uuid = uuidv1()
			this.receivedPayloads[message.uuid] = true;
		}
		// send to connected neighbors
		Object.entries(this.state.endpointInfo).forEach(([endpointId, value])=>{
			if(excludeId != endpointId) {
				if (value.myNearbyStatus === "connected"){
					this.sendMessageToEndpoint(endpointId, message);
				}	
			}
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