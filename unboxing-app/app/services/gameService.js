import Service from './Service';

import {sequenceService, nearbyService, soundService} from './';

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

	// called, when user selects challenge
	setActiveChallenge(challenge) {
		this.setReactive({
			challengeStatus: "active",
			activeChallenge: challenge
		});

		nearbyService.setCustomCallbacks({
			onConnectionEstablished: () => {
				nearbyService.broadcastMessage({message: "hi everyone"});
			},
			onMessageReceived: (message) => {
				console.log("message received: ", message.message);

				/* if this is start sequence message 
				&& we haven't started 
				&& we are set to autostart sequence (todo) */
				if(message.message == "start_sequence" && sequenceService.getControlStatus() == "ready")  {
					sequenceService.startSequence(message.startTime);
				}
			},
			// todo: onConnectionLost
		});

		nearbyService.initConnection(challenge.name); 
		// todo: set timeOut for connection init - after that, allow start of solo challenge?
	}

	getActiveChallenge() {
		return this.state.activeChallenge;
	}

	// called from TrackSelector when user selects track
	trackSelect(sequence, track) {
		sequenceService.trackSelect(sequence, track)
	}

	// start triggered by button or gesture
	handleStartSequence() {
		if(sequenceService.getControlStatus() == "ready") {
			let startTime = soundService.getSyncTime() + 2000; // set time for sequence to start
			sequenceService.startSequence(startTime); 

			// send start_sequence message to server or other
			nearbyService.broadcastMessage({message: "start_sequence", startTime: startTime}); // broadcast time to all connected devices
		}
	}

	// manual start of items
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