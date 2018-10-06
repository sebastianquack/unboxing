import Service from './Service';

import {sequenceService, nearbyService} from './';

class GameService extends Service {

	constructor() {
		// initialize with reactive vars
		super("game", {
			challengeStatus: "list",	// list <-> active 
			activeChallenge: null 		// active challenge saved here
		});

		// not reactive vars
		this.discoveryTimeout;
	}

	setActiveChallenge(challenge) {
		this.setReactive({
			challengeStatus: "active",
			activeChallenge: challenge
		});

		/*nearbyService.startDiscovering();
		this.discoveryTimeout = setTimeout(()=>{
			// no endpoints found, start advertising
			if(nearbyService.getNumEndpoints() == 0) {
				nearbyService.stopDiscovering();
				nearbyService.startAdvertising();	
			}
		}, 10000);*/
	}

	getActiveChallenge() {
		return this.state.activeChallenge;
	}

	leaveChallenge() {
		sequenceService.stopSequence();
		this.setReactive({
			challengeStatus: "list",
			activeChallenge: null
		});	

		//clearTimeout(this.discoveryTimeout);
		nearbyService.stopDiscovering();
		nearbyService.stopAdvertising();
	}
}

const gameService = new GameService();

export {gameService};