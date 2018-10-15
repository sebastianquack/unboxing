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
				// todo
			},
			onMessageReceived: (message) => {
				console.log("message received: ", message.message);

				// if this is start sequence message
				if(message.message == "start_sequence") {

					// if we haven't started and are ready to play
					if(sequenceService.getControlStatus() == "ready")  {
						sequenceService.startSequence(message.startTime);
					}
				}
			},
			// todo: onConnectionLost
		});

		// nearbyService.initConnection(challenge.name); 
		// unify serviceId for testing
	}

	getActiveChallenge() {
		return this.state.activeChallenge;
	}

	// called from TrackSelector when user selects track
	trackSelect(sequence, track) {
		sequenceService.trackSelect(sequence, track)
	}

	// manual start of items
	handlePlayNextItemButton() {

		// if sequence isn't running, start one and inform other players
		if(sequenceService.getControlStatus() == "ready") {
			// make sure first item is at start of sequence
			if(sequenceService.firstItemAtBeginningOfSequence()) {

				let nowTime = soundService.getSyncTime();
				console.log("handlePlayNextItemButton", nowTime);
			
				let startTime = nowTime + 2000; // set time for sequence to start
				sequenceService.startSequence(startTime); 

				// send start_sequence message to server or other
				nearbyService.broadcastMessage({message: "start_sequence", startTime: startTime}); // broadcast time to all connected devices

			} else {
				console.log("first item not at the start of sequence - cancel sequence start");
				// todo: notification
			}
		
		} else {
			if(sequenceService.getControlStatus() == "playing") {
   			sequenceService.playNextItem();			
			}	
		}

  }

  handleStopButton() {
   	//sequenceService.stopSequence();
   	sequenceService.stopCurrentSound();
  }

	leaveChallenge() {
		sequenceService.stopSequence();
		this.setReactive({
			challengeStatus: "list",
			activeChallenge: null
		});	

		// nearbyService.cancelConnection();
		// always leave on for testing
	}
}

const gameService = new GameService();

export {gameService};