import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

import {gameService} from './';

const uuidv1 = require('uuid/v1');

const strategy = Strategy.P2P_CLUSTER;

class NearbyService extends Service {

	constructor() {
		// reactive vars
		super("nearby", {
			active: false,					// general on / off switch for nearby
			serviceId: null, 				// service id for discovery & advertising
			discoveryActive: false,			// true if discovery service is active
			advertisingActive: false,		// true if advertising service is active
			myEndpointName: uuidv1(),		// random unique name for this endpoint
			endpointIds: [] 				// all other devices in range 
		});
		this.customCallbacks = {
			onConnectionEstablished: null, 	// not implemented
			onMessageReceived: null,
			onConnectionLost: null, 		// not implemented
		}
		this.receivedPayloads = {};
		this.setupNearbyCallbacks();
	}

	debug = (...msg) => {
		this.showNotification(msg.join(", "));
		console.log(msg);  
	}


	toggleActive = ()=> {
		if(!this.state.active) {
			this.setReactive({active: true});
			this.initConnection("test"); // use for debuggung
		} else {
			this.setReactive({active: false});
			this.cancelConnection();
		}
	}

	initConnection = (serviceId)=> {
		this.setReactive({serviceId: serviceId});
		this.startDiscovering();
		this.startAdvertising();	
	}

	cancelConnection = ()=> {
		nearbyService.stopDiscovering();
		nearbyService.stopAdvertising();
		clearTimeout(this.roleDecideTimeout);
		this.setReactive({
			serviceId: null,
			endpointIds: [],
		});

	}
	
	setCustomCallbacks(callbacks) {
		Object.keys(callbacks).forEach((key)=>{
			this.customCallbacks[key] = callbacks[key];
		});
		console.log(this.customCallbacks);
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
    		this.setReactive({discoveryActive: true});
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
		    // An endpoint has been discovered we can connect to
		    this.debug("onEndpointDiscovered", endpointId, endpointName, serviceId);
		    this.connectToEndpoint(endpointId);
		});

		// Note - Can take up to 3 min to time out
		NearbyConnection.onEndpointLost(({
    		endpointId,             // ID of the endpoint we lost
    		endpointName,           // The name of the remote device we lost
    		serviceId               // A unique identifier for the service
		}) => {
			// Endpoint moved out of range or disconnected
			this.removeEndpointId(endpointId)
    		this.debug("onEndpointLost", endpointId, endpointName, serviceId)
    		//this.setReactive({serverEndpointId: null});
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
		    this.addEndpointId(endpointId);
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

		NearbyConnection.onReceivePayload(({
    		serviceId,              // A unique identifier for the service
    		endpointId,             // ID of the endpoint we got the payload from
    		payloadType,            // The type of this payload (File or a Stream) [See Payload](https://developers.google.com/android/reference/com/google/android/gms/nearby/connection/Payload)
    		payloadId               // Unique identifier of the payload
		}) => {
    		// Payload has been received
    		this.debug("onReceivePayload");
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
				this.debug("payload: ", bytes);
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
		// begin discovery of service
		NearbyConnection.startDiscovering(
  	  		this.state.serviceId ? this.state.serviceId : "test",
  	  		strategy
		);
	}

	connectToEndpoint(endpointId) {
		if(!this.state.serviceId) return;
		this.debug("nearby: connecting to ", this.state.serviceId, endpointId);
		NearbyConnection.connectToEndpoint(
    		this.state.serviceId,         // A unique identifier for the service
    		endpointId
		);
	}

	// send message to an endpoint
	sendMessageToEndpoint(endpointId, message) {
		if(!this.state.serviceId) return;
		this.debug("sendMessageToEndpoint", endpointId, message);
		NearbyConnection.sendBytes(
  		  	this.state.serviceId,           // A unique identifier for the service
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
		if(this.state.discoveryActive) {
			this.debug("nearby: stopping discovery", this.state.serviceId);
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
    		strategy
		);
	}

	stopAdvertising() {
		if(this.state.advertisingActive) {
			this.debug("nearby: stopping advertising", this.state.serviceId);
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