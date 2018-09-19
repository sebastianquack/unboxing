import p2pkit from 'react-native-p2pkit';

import Service from './Service';

import Credentials from '../../credentials';

const p2pkitCallback = {

    onException: function(exceptionMessage) {
        console.log(exceptionMessage.message)
    },

    onEnabled: function() {
        console.log('p2pkit is enabled')
		p2pkit.enableProximityRanging()
        p2pkit.startDiscovery('hi', {discoveryPowerMode:p2pkit.HIGH_PERFORMANCE}) //base64 encoded Data (bytes)
    },

    onDisabled: function() {
        console.log('p2pkit is disabled')
    },

    // Refer to platform specific API for error codes
    onError: function(errorObject) {
        console.log('p2pkit failed to enable on platform ' + errorObject.platform + ' with error code ' + errorObject.errorCode)
    },

    onDiscoveryStateChanged: function(discoveryStateObject) {
        console.log('discovery state updated on platform ' + discoveryStateObject.platform + ' with error code ' + discoveryStateObject.state)
    },

    onPeerDiscovered: function(peer) {
        console.log(peer);
        console.log('peer discovered ' + peer.peerID)

        p2pkit.sendMessageToNearbyPeer("hello", peer.peerID);
        
    },

    onPeerLost: function(peer) {
        console.log('peer lost ' + peer.peerID)
    },

    onPeerUpdatedDiscoveryInfo: function(peer) {
        console.log('discovery info updated for peer ' + peer.peerID + ' info ' + peer.discoveryInfo)
    },

    onProximityStrengthChanged: function(peer) {
        console.log('proximity strength changed for peer ' + peer.peerID + ' proximity strength ' + peer.proximityStrength)
    },

    onGetMyPeerId: function(reply) {
        console.log(reply.myPeerId)
    },
    
    onGetDiscoveryPowerMode: function(reply) {
    	console.log(reply.discoveryPowerMode)
    }
}

class P2pService extends Service {

	constructor() {

        console.log(Credentials.p2pkit);

		// reactive vars
		super("p2p", {
		});
		setTimeout(() => {
			this.startP2PKit()
		},2000)
		
	}

	startP2PKit() {
		console.log("starting p2pkit")
		p2pkit.enable(Credentials.p2pkit, p2pkitCallback)
	}
}

const p2pService = new P2pService();

export {p2pService};

