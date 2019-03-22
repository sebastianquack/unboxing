import Service from './Service';

import {sequenceService, nearbyService, soundService, storageService, relayService} from './';

const defaultStatusBarTitle = "Unboxing Mozart";
const defaultStatusBarSubtitle = "Development Version - Testing"

class GameService extends Service {

	constructor() {
		// initialize with reactive vars
		super("gameService", {
			gameMode: "manual",			// manual, walk, installation
			activeWalk: null,
			pathIndex: 0,
			walkStatus: "off",			// off -> ongoing -> ended
			challengeStatus: "off",		// off <-> navigate <-> prepare <-> play 
			activeChallenge: null, 		// active challenge saved here
			showInstrumentSelector: false, // show the interface selector in the interface
      statusBarTitle: defaultStatusBarTitle,
      statusBarSubtitle: defaultStatusBarSubtitle,
      debugMode: false,          // show debugging info in interface
      infoStream: [],
      numChallengeParticipants: 1 // number of people in the challenge
		});

		// not reactive vars
		this.discoveryTimeout;

		this.assistanceThreshold = 2000;
    this.guitarHeroThreshold = {pre: 2000, post: 2000}
	}

	toggleDebugMode = ()=> {
		this.setReactive({
			debugMode: !this.state.debugMode
		});
	}

	// called by admin to change game mode - here: to leave walk mode
	setGameMode = (mode)=> {
		if(this.state.gameMode == "walk" && mode == "manual") {
			this.setReactive({
				activeWalk: null,
				pathIndex: 0,
				gameMode: "manual"
			});

			this.leaveChallenge();
		}
	}

  /** game mode management **/

	// for navigation testing
  setupMinimalWalk(place) {
    
    this.setReactive({
        activeWalk: {tag: place.tag},
        activePath: [{place: place.shorthand, time: 0}],
        pathIndex: 0,
        gameMode: "walk"
      });
    this.setupActivePlace();
  }


  // called when admin starts walk
	setActiveWalk = (walk)=> {
		
		let activePath = storageService.getActivePath(walk);
		
		if(activePath) {

			this.setReactive({
				activeWalk: walk,
				activePath: activePath,
				pathIndex: 0,
				gameMode: "walk"
			});

			this.setupActivePlace();
		}
	}


  /** walks and places **/

	// called when user leaves place, moves to next one
	moveToNextPlaceInWalk = ()=> {
		this.setReactive({
			pathIndex: this.state.pathIndex + 1
		});
		this.setupActivePlace();
	}

	setupActivePlace = ()=> {
		// check if there are still places in path
		if(this.state.pathIndex >= this.state.activePath.length) {
			this.setReactive({
				activePlaceReference: null,
				activePlace: null,
				activeChallenge: null,
				walkStatus: "ended",
        challengeStatus: "off"
			});
      this.initInfoStream();
			return;
		}

		let placeReference = this.state.activePath[this.state.pathIndex];
		let place = storageService.findPlace(placeReference.place, this.state.activeWalk.tag);
		this.setReactive({
			walkStatus: "ongoing",
			activePlaceReference: placeReference,
			activePlace: place
		});

		let challenge = storageService.findChallenge(place.challenge_id);
		this.setActiveChallenge(challenge);
	}

  /** challenges **/

	// called when user enters a challenge
	setActiveChallenge = (challenge)=> {
		this.setReactive({
			activeChallenge: challenge
		});

    this.setActiveChallengeStatus(this.state.gameMode == "walk" ? "navigate" : "prepare");

		sequenceService.setSequence(challenge.sequence_id);

    this.setReactive({
      statusBarTitle: sequenceService.getSequenceName(),
      statusBarSubtitle: challenge.name
    })
    
    relayService.emitMessage({code: "joinChallenge", challengeId: challenge._id, deviceId: storageService.getDeviceId()});
    this.activateRelayCallbacks();
	}

  leaveChallenge() {

    
    relayService.emitMessage({code: "leaveChallenge", challengeId: this.state.activeChallenge ? this.state.activeChallenge._id : null, deviceId: storageService.getDeviceId()});  
    
    sequenceService.stopSequence();

    this.setReactive({
      statusBarTitle: defaultStatusBarTitle,
      statusBarSubtitle: defaultStatusBarSubtitle,
      showInstrumentSelector: false
    })
    
    if(this.state.gameMode == "walk") {
      this.moveToNextPlaceInWalk();
    } else {
      this.setReactive({
        challengeStatus: "list",
        activeChallenge: null
      }); 
    }

    this.initInfoStream();

  }

  onMessageReceived = (msgObj) => {
    //this.showNotification(JSON.stringify(msgObj));

    if(msgObj.code == "challengeParticipantUpdate") {
      if(this.state.activeChallenge) {
        if(msgObj.challengeId == this.state.activeChallenge._id) {
          this.setReactive({numChallengeParticipants: msgObj.numParticipants})
        }  
      }
    }
        
    // if this is start sequence message
    if(msgObj.code == "startSequence") {
      if(this.state.activeChallenge) {
        if(msgObj.challengeId == this.state.activeChallenge._id) {
          this.startSequenceRemotely(msgObj.startTime)  
        }  
      }
    }
  }

  activateNearbyCallbacks = () => {
    nearbyService.setCustomCallbacks({
      onConnectionEstablished: () => {
        // todo
      },
      onMessageReceived: this.onMessageReceived
    });   
  }

  activateRelayCallbacks() {
    relayService.listenForMessages(this.onMessageReceived);
  }

	setActiveChallengeStatus = (status)=> {

		this.setReactive({
			challengeStatus: status
		});

    if(status == "prepare") {
      //this.activateNearbyCallbacks();
      this.activateRelayCallbacks();
    }

    this.initInfoStream();
	}

	getActiveChallenge = ()=> {
		return this.state.activeChallenge;
	}

  getChallengeStatus = ()=> {
    return this.state.challengeStatus;
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

  getGuitarHeroThreshold = () => {
    return this.guitarHeroThreshold
  }
 

  /** sequences **/

  startSequence = () => {

      if(this.state.challengeStatus == "play") {
        this.showNotification("starting sequence...");
        
        let nowTime = soundService.getSyncTime();
        let startTime = nowTime + 2000; // set time for sequence to start
        sequenceService.startSequence(startTime, true); // set local start flag to true 

        // send start_sequence message to all players connected via nearby
        relayService.emitMessage({code: "startSequence", challengeId: this.state.activeChallenge._id, startTime: startTime});  
      }
  }

  startSequenceRemotely = startAt => {
    let nowTime = soundService.getSyncTime();
    const startTime = startAt || (nowTime - 1000)

    // should this request restart the sequence?
    // yes, if sequence has already started and the remote time is an earlier time
    if (
        sequenceService.state.controlStatus === "playing"
        // && sequenceService.state.playbackStartedAt > nowTime
        && startTime < sequenceService.state.playbackStartedAt
      ) {
      console.log("startSequenceRemotely: shifting timing")
      sequenceService.shiftSequenceToNewStartTime(startTime);
    }
    // should this request start the sequence?
    // yes, if sequence is ready to play
    else if (sequenceService.state.controlStatus === "ready") {
      console.log("startSequenceRemotely: starting sequence")
      sequenceService.startSequence(startTime, false)
    } else {
      console.log("startSequenceRemotely: ignored, time diff:", startTime, sequenceService.state.playbackStartedAt)
    }
    return null
  }

  handleMissedCue() {
    if(this.state.activeChallenge.item_manual_mode == "assisted") {
      this.showNotification("too late! skipping sound...");   
      sequenceService.skipNextItem();
    }
  }

  handleMissedGuitarHeroCue() {
    this.showNotification("guitar hero too late!");
    console.log("guitar hero missed cue");
    sequenceService.stopCurrentSound();
  }

	// manual start of items - also called by gestures -- confusing: investigate & rename
	handlePlayNextItemButton = ()=> {

		// if the sequence isn't running, start the sequence and inform other players
		if(sequenceService.getControlStatus() == "ready") {
			this.startSequence();
		// else, if the sequence is already running
		} else {
			if(sequenceService.getControlStatus() == "playing") {
				
				let now = soundService.getSyncTime();
				
        // compare with next item's official start time
        let officialTime = sequenceService.getNextItemStartTimeAbsolute();

        if(this.state.activeChallenge.item_manual_mode == "guitar hero") {
          officialTime = sequenceService.guitarHeroStartTimeAbsolute();
        }  
        
        let difference = now - officialTime;
				
        console.log("handlePlayNextItemButton with difference: " + difference);
        console.log(sequenceService.state.currentItem);

        if(this.state.activeChallenge.item_manual_mode == "guitar hero") {
            if(difference <= -this.guitarHeroThreshold.pre) {
              this.showNotification("guitar hero: too early!");    
            }
            if(difference > -this.guitarHeroThreshold.pre && difference <= this.guitarHeroThreshold.post) {
              this.showNotification("guitar hero: good!");   
              sequenceService.approveScheduledOrCurrentItem();
            }
        } else {
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
		}

		sequenceService.updateActionInterface();
  }

  // confusing - investigate & rename?
  handleSkipButton() {
  	sequenceService.skipNextItem();
  }

  // confusing - investigate & rename?
  handleStopButton() {
   	sequenceService.stopCurrentSound();
  }


  /** interface actions **/

  // called from TrackSelector when user selects track
  trackSelect = (sequence, track)=> {
    sequenceService.trackSelect(sequence, track);
  }

  // big right button on game container
  handlePlayButton = ()=> {
    switch(this.state.challengeStatus) {
      case "navigate":
        this.setActiveChallengeStatus("prepare");            
        break;
      case "prepare":
        this.setActiveChallengeStatus("play");            
        break;
      default:
        this.showNotification("no current function");
    }
  }

  // center button for instrument selection
  handleMidButton = ()=> {
    if(this.state.challengeStatus == "prepare" || this.state.challengeStatus == "play") {
      this.setReactive({
        showInstrumentSelector: !this.state.showInstrumentSelector
      });  
    } else {
      this.showNotification("no current function");
    }
  }

  // big left button on game container
  handleBackButton = ()=> {
    switch(this.state.challengeStatus) {
      case "play":
        this.backToLobby();
        break;
      case "prepare":
        this.leaveChallenge();
        break;
      default:
        this.showNotification("no current function");
    }
  }

  // center button to close instrument selection modal
  handleCloseModal = ()=> {
    this.setReactive({
      showInstrumentSelector: false
    });
  }

  backToLobby() {
    sequenceService.cancelItemsAndSounds()
    this.setActiveChallengeStatus("prepare");
  }
  

  /** info stream management **/

  clearInfoStream = ()=> {
    this.setReactive({
      infoStream: []
    });
  }

  addItemToInfoStream = (title, content, video=false) => {
    let infoStream = this.state.infoStream;
    infoStream.push({title: title, content: content, video: video});
    this.setReactive({
      infoStream: infoStream
    });
  }

  initInfoStream = ()=> {
    this.clearInfoStream();    
    
    // special case - end of walk - todo: add before walk here?
    if(!this.state.activeChallenge) {
      if(this.state.challengeStatus == "off") {
        this.addItemToInfoStream("navigation", "you are at the end of your path. please give back the device"); 
      }
      return;
    }  

    // there is an active challenge
    switch(this.state.challengeStatus) {
      case "navigate":
        this.addItemToInfoStream("navigation", "go to the place marked on the map.");
        this.addItemToInfoStream("navigation", "press check in when you're there!");
        break;
      case "prepare":
        this.addItemToInfoStream("welcome", "welcome to this passage. here's a video about it! (placeholder)", true);
        if(!sequenceService.getCurrentTrackName()) {
          this.addItemToInfoStream("how to play", "select your instrument, then press play to start playing");   
        } else {
          this.addItemToInfoStream("how to play", "press play to start playing!");   
        }
        
        break;
      case "play":
        sequenceService.updateActionInterface();
        break;
    }
  }


}

const gameService = new GameService();

export {gameService};