import Service from './Service';

import {sequenceService, nearbyService, soundService} from './';

class GameService extends Service {

	constructor() {
		// initialize with reactive vars
		super("gameService", {
			gameMode: "manual",			// manual, walk, installation
			activeWalk: null,
			pathStep: 0,
			challengeStatus: "off",		// off <-> navigate <-> prepare <-> play 
			activeChallenge: null, 		// active challenge saved here
			debugMode: true				// show debugging info in interface
		});

		// not reactive vars
		this.discoveryTimeout;

		this.assistanceThreshold = 2000;
	}

	toggleDebugMode = ()=> {
		this.setReactive({
			debugMode: !this.state.debugMode
		});
	}

	// called when admin starts walk
	setActiveWalk(walk) {
		this.setReactive({
			activeWalk: walk,
			pathStep: 0,
			gameMode: "walk"
		});

		//todo here: select path based on device name
		//todo here: set active challenge based on first place
	}

	// called by admin to leave walk mode
	setGameMode(mode) {
		if(this.state.gameMode == "walk" && mode == "manual") {
			this.setReactive({
				activeWalk: null,
				pathStep: 0,
				gameMode: "manual"
			});		
		}
	}


	// called when user enters challenge
	setActiveChallenge(challenge) {
		this.setReactive({
			challengeStatus: this.state.gameMode == "walk" ? "navigate" : "prepare",
			activeChallenge: challenge
		});

		sequenceService.setSequence(challenge.sequence_id);
	}

	setActiveChallengeStatus(status) {

		this.setReactive({
			challengeStatus: status
		});

		if(status == "prepare") {
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
							sequenceService.startSequence(message.startTime, false); // just start sequence, not item started locally
						}
					}
				},
				// todo: onConnectionLost
			});
		}

	}

	getActiveChallenge = ()=> {
		return this.state.activeChallenge;
	}

	isChallengeLooping = ()=> {
		let looping = false;
		let activeChallenge = this.getActiveChallenge();
		if(activeChallenge) {
			if(activeChallenge.sequence_loop) {
				looping = true;
			}
		}
		return looping;
	}

	// called from TrackSelector when user selects track
	trackSelect(sequence, track) {
		sequenceService.trackSelect(sequence, track)
	}

	// manual start of items - also called by gestures
	handlePlayNextItemButton = ()=> {

		// if the sequence isn't running, start the sequence and inform other players
		if(sequenceService.getControlStatus() == "ready") {
			this.startSequence();
		// else, if the sequence is already running
		} else {
			if(sequenceService.getControlStatus() == "playing") {
				
				let now = soundService.getSyncTime();
				// compare with item's official start time
				let officialTime = sequenceService.getNextItemStartTimeAbsolute();
				let difference = now - officialTime;
				
				if(this.state.activeChallenge.item_manual_mode == "assisted") {
					if(difference <= -this.assistanceThreshold) {
						this.showNotification("too early! try again");		
					}
					if(difference > -this.assistanceThreshold && difference <= 0) {
						this.showNotification("good!");		
						sequenceService.scheduleSoundForNextItem(officialTime); 			
					}
					if(difference > 0) {
						this.showNotification("too late! skipping sound...");		
						sequenceService.skipNextItem();
					}
				} else {
					sequenceService.scheduleSoundForNextItem(now); 		
				}		
			}	
		}

		sequenceService.updateActionInterface();
  }

  startSequence = () => {
			let nowTime = soundService.getSyncTime();
			let startTime = nowTime + 2000; // set time for sequence to start
			sequenceService.startSequence(startTime, true); // set local start flag to true 

			this.showNotification("starting sequence...");

			// send start_sequence message to all players connected via nearby
			nearbyService.broadcastMessage({message: "start_sequence", startTime: startTime}); // broadcast time to all connected devices
  }

  handleMissedCue() {
  	if(this.state.activeChallenge.item_manual_mode == "assisted") {
  		this.showNotification("too late! skipping sound...");		
			sequenceService.skipNextItem();
		}
  }

  handleSkipButton() {
  	sequenceService.skipNextItem();
  }

  handleStopButton() {
   	sequenceService.stopCurrentSound();
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