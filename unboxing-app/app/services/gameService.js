import Service from './Service';

import {sequenceService} from './sequenceService';

class GameService extends Service {

	constructor() {
		// initialize with reactive vars
		super("game", {
			challengeStatus: "list",	// list <-> active 
			activeChallenge: null 		// active challenge saved here
		});

		// not reactive vars
	}

	setActiveChallenge(challenge) {
		this.setReactive({
			challengeStatus: "active",
			activeChallenge: challenge
		});
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
	}
}

const gameService = new GameService();

export {gameService};