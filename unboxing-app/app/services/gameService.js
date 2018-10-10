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

		nearbyService.setCustomCallbacks({
			onConnectionEstablished: () => {
				nearbyService.broadcastMessage("hi everyone");
			},
			onMessageReceived: (message) => {
				console.log("message received: ", message);

				/* if this is start sequence message 
				&& we haven't started 
				&& we are set to autostart sequence (todo) */
				if(message == "start_sequence" && sequenceService.getControlStatus() == "ready")  {
					sequenceService.startSequence(); // todo: set time for sequence to start
				}
			},
			// todo: onConnectionLost
		});

		nearbyService.initConnection(challenge.name); 
		// todo: set timeOut for connection init - after that, allow start of challenge
	}

	getActiveChallenge() {
		return this.state.activeChallenge;
	}

	// called from TrackSelector
	trackSelect(sequence, track) {
		sequenceService.trackSelect(sequence, track)
	}

	// start triggered by button or gesture
	handleStartSequence() {
		if(sequenceService.getControlStatus() == "ready") {
			sequenceService.startSequence(); // todo: set time for sequence to start

			// send start_sequence message to server or other
			nearbyService.broadcastMessage("start_sequence"); // send time with message
		}
	}

	playNextItem() {
    	sequenceService.playNextItem();
  	}

  	handleStopSequence() {
    	sequenceService.stopSequence();	
  	}

	leaveChallenge() {
		sequenceService.stopSequence();
		this.setReactive({
			challengeStatus: "list",
			activeChallenge: null
		});	

		nearbyService.cancelConnection();
	}
}

const gameService = new GameService();

export {gameService};