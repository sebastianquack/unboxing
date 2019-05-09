import Service from './Service';

import {sequenceService, soundService, storageService, relayService, networkService, peakService} from './';

import loadNavigationAssets from '../../config/instruments'
const instruments = loadNavigationAssets();

const baseState = {
      gameMode: "manual",     // manual, walk, installation
      activeWalk: null,
      pathIndex: 0,
      activePath: null,
      activePlace: null,
      activePlaceReference: null,
      pathLength: 0,
      minutesToEnd: null,
      walkStatus: "off",      // off -> tutorial-intro -> ongoing -> ended
      challengeStatus: "off",   // off <-> navigate -> (tutorial->) prepare <-> play 
      activeChallenge: null,    // active challenge saved here
      tutorialStatus: "off",     // off -> step-1 -> complete
      showInstrumentSelector: false, // show the interface selector in the interface
      statusBarTitle: null,
      statusBarSubtitle: null,
      infoStream: [],
      numChallengeParticipants: 1, // number of people in the challenge
      numChallengeParticipantsWithInstrument: 0,
      activeInstallation: null,
      installationActivityMap: null,
      installationConnected: false,

}

class GameService extends Service {

	constructor() {
		// initialize with reactive vars
		super("gameService", {...baseState, debugMode: false, autoplayMode: false});
    
		// not reactive vars

		this.assistanceThreshold = 2000;
    this.guitarHeroThreshold = {pre: 2000, post: 2000}

    this.checkInButtonDelay = 60*1000;

    this.walkTrackerInterval = setInterval(this.walkTracker, 10000);

    // automatically resume the last walk saved
    setTimeout(()=>{
      this.resumeGameFromFile();
    }, 3000);
	}

  resetGamestate = () => {
    this.setReactive(baseState);
    clearTimeout(this.checkInTimeout);
  }

  toggleDebugMode = ()=> {
    this.setReactive({
      debugMode: !this.state.debugMode
    });
  }

  toggleAutoplayMode = ()=> {
    this.setReactive({
      autoplayMode: !this.state.autoplayMode
    });
  }

  /** game mode management **/

	// for navigation testing
  setupMinimalWalk(place) {
    this.resetGamestate();
    this.setReactive({
        activeWalk: {tag: place.tag},
        activePath: {places: [{place: place.shorthand, duration: 2}]},
        pathLength: 1,
        pathIndex: 0,
        gameMode: "walk",
        walkStartTime: soundService.getSyncTime(),
      });
    this.walkTracker();
    this.setupActivePlace();
    this.initInfoStream();
    this.saveGameStateToFile();
  }

  jumpToChallenge = (challenge) => {
    this.leaveChallenge();
    this.resetGamestate();
    this.setActiveChallenge(challenge) 
    this.initInfoStream();
    this.saveGameStateToFile();
  }

  startTutorialForWalkById = (id) => {
    let walk = storageService.getWalkById(id);
    this.startTutorialForWalk(walk);
  }
  
  startTutorialForWalk = (walk) => {
    this.leaveChallenge();
    this.resetGamestate();
    this.setReactive({
        gameMode: "manual",
        challengeStatus: "tutorial",
        tutorialStatus: "tutorial-intro",
        walkInstrument: storageService.getWalkInstrument(walk),
        activeWalk: walk
      });
    this.initInfoStream();  
    this.saveGameStateToFile();
  }

  startWalkById = (id, startTime) => {
    let walk = storageService.getWalkById(id);
    this.setActiveWalk(walk, startTime)
  }

  setActiveWalk = (walk, startTime)=> {
		this.resetGamestate();
    let activePath = storageService.getActivePath(walk);
    if(activePath) {
			this.setReactive({
				activeWalk: walk,
        activePath: activePath,
        pathLength: activePath.places.length,
				pathIndex: 0,
				gameMode: "walk",
        walkStatus: "ongoing",
        tutorialStatus: "complete",
        walkStartTime: startTime,
        challengeStatus: "off",
        walkInstrument: storageService.getWalkInstrument(walk)
			});
      this.setupActivePlace();  
      this.walkTracker();
      this.initInfoStream(); 
		}
	}

  startPracticeChallengeByWalkId(walkId) {
    let walk = storageService.getWalkById(walkId);
    let challenge = storageService.getTutorialChallengeFromWalk(walk);
    this.jumpToChallenge(challenge);
  }

  startFinalChallengeByWalkId(walkId) {
    let walk = storageService.getWalkById(walkId);
    let challenge = storageService.getFinalChallengeFromWalk(walk);
    this.resetGamestate();
    this.setActiveChallenge(challenge);  
    sequenceService.state.currentSequence.tracks.forEach((track)=>{
      if(track.name == storageService.getWalkInstrument(walk)) {
        this.trackSelect(track);
      }
    })
    this.setReactive({walkStatus: "final-challenge"});
  }

  startInstallationByName = (name) => {
    this.leaveChallenge();
    this.resetGamestate();

    let installation = storageService.loadInstallationByName(name);
    if(installation) {
      //console.warn(installation);

      // set relay server based on installation config
      let relayServerName = storageService.findRelayServerForInstallation(installation);
      if(relayServerName != null) {
        const connection = storageService.findServerByName(relayServerName)
        relayService.setServer(connection._id);
        networkService.setConnection(connection || undefined);  
        this.activateRelayCallbacks();

      } else {
        this.showNotification("relay server not specified for this device - add device to a group?")
      }

      if(this.state.activeChallenge) {
        this.leaveChallenge();  
      }
      
      let practiceInstrument = storageService.findPracticeInstrumentForInstallation(installation);
      if(!practiceInstrument) {
        this.showNotification("practice instrument for device not found");
      }

      //console.warn(this.state.debugMode);
      
      this.setReactive({
        activeInstallation: installation,
        gameMode: "installation",
        installationStartInstrument: practiceInstrument,
        activeChallenge: null,
        activeWalk: null,
        activePath: null,
        activePlace: null,
        pathLength: null,
        pathIndex: null,
        walkStatus: "off",
        walkStartTime: null,
        minutesToEnd: null,
        challengeStatus: "off",
        installationConnected: false,
        installationActivityMap: null,
        tutorialStatus: this.state.debugMode ? "tutorial-installation-complete" : "tutorial-installation-2",
        statusBarTitle: storageService.t("installation-choose-a-passage")

      });
      storageService.saveGameStateToFile(this.state);  
      if(!peakService.state.still) {
        this.handleMoveEvent();
      }
    }    
  }


  /** persist and resume **/

  saveGameStateToFile = () => {
    storageService.saveGameStateToFile(this.state);
  }

  resumeGameFromFile = () => {
    storageService.loadGameStateFromFile(stateObj=>{
      if (!stateObj) return

      this.setReactive({
        debugMode: stateObj.debugMode,
        autoplayMode: stateObj.autoplayMode
      });

      if(stateObj.activeInstallation && stateObj.gameMode == "installation") {
          this.startInstallationByName(stateObj.activeInstallation.name);
          return;
      }

      if(stateObj.activeWalk && stateObj.gameMode == "manual") {
        this.startTutorialForWalk(stateObj.activeWalk);
        return;
      }

      if(stateObj.activeChallenge && stateObj.gameMode == "manual") {
        this.jumpToChallenge(stateObj.activeChallenge);
        return;
      }

      if(stateObj.activeWalk && stateObj.gameMode == "walk") {
        if(stateObj.pathIndex < stateObj.pathLength) {
          this.setReactive({
            activeWalk: stateObj.activeWalk,
            activePath: stateObj.activePath,
            pathLength: stateObj.pathLength,
            pathIndex: stateObj.pathIndex,
            gameMode: stateObj.gameMode,
            walkStatus: stateObj.walkStatus,
            walkStartTime: stateObj.walkStartTime,
            challengeStatus: "off"
          });
          if(!(stateObj.activeWalk.tutorial && stateObj.pathIndex == 0)) {
            this.setupActivePlace();  
          }
          this.walkTracker();
          this.initInfoStream(); 
          return;
        }        
      }
    });
  }


  /** walks and places **/

  getStartTimeForWalkIndex(index) {
    let walkStartTime = this.state.walkStartTime;
    let totalDuration = 0;
    for(let i = 0; i < index; i++) {
      totalDuration += this.state.activePath.places[i].duration;
    }
    let r = walkStartTime + (totalDuration * 60 * 1000);
    return r;
  }

  getEndTimeForWalkIndex(index) {
    let walkStartTime = this.state.walkStartTime;
    let totalDuration = 0;
    for(let i = 0; i <= index; i++) {
      totalDuration += this.state.activePath.places[i].duration;
    }
    let r = walkStartTime + (totalDuration * 60 * 1000);
    return r; 
  }

  getMinutesUntilWalkIndex(index) {
    return (this.getStartTimeForWalkIndex(index) - soundService.getSyncTime()) / 60000;
  }

  walkTracker = ()=>{
    if(this.state.gameMode == "walk" && this.state.activeWalk && this.state.activePath && this.state.walkStatus == "ongoing") {

      // update pathIndex to correct time
      let oldPathIndex = this.state.pathIndex;
      let now = soundService.getSyncTime();
      let pathIndexUpdated = false;
      for(let i = 0; i < this.state.pathLength; i++) {
        if(now < this.getEndTimeForWalkIndex(i)) {
          this.setReactive({ pathIndex: i });
          pathIndexUpdated = true;
          break;
        }
      }
      if(!pathIndexUpdated) this.setReactive({ pathIndex: this.state.pathLength });
      
      // if pathIndex changed, leave the challenge
      if(this.state.pathIndex != oldPathIndex) {
        this.leaveChallenge();
      }

      // update time display
      if(this.state.pathIndex > -1 && this.state.pathIndex < this.state.activePath.places.length) {
        let minutesToNextStage = this.getMinutesUntilWalkIndex(this.state.pathIndex + 1);
        this.setReactive({minutesToEnd: minutesToNextStage});
      }
    }
  }

  jumpToPlaceInWalk = (index) => {
    this.setReactive({
      pathIndex: index
    });
    this.setupActivePlace(); 
  }

	setupActivePlace = ()=> {
		// check if there are still places in path
		if(this.state.pathIndex >= this.state.activePath.places.length) {
      this.setReactive({
				activePlaceReference: null,
				activePlace: null,
				activeChallenge: null,
				walkStatus: "ended",
        challengeStatus: "off",
			});
      this.initInfoStream();
			return;
		}

		let placeReference = this.state.activePath.places[this.state.pathIndex];
		let place = storageService.findPlace(placeReference.place, this.state.activeWalk.tag);
		this.setReactive({
			walkStatus: "ongoing",
			activePlaceReference: placeReference,
			activePlace: place,
      allowCheckInButton: false,
      allowPlaceExit: false
		});

    let challenge
    if (placeReference.challenge) {
       challenge = storageService.findChallengeByShorthand(placeReference.challenge);
    } else {
      challenge = storageService.findChallenge(place.challenge_id);
    }
    if(!challenge) {
      console.warn("no challenge found, aborting")
      return;
    }
    console.log(placeReference, challenge)
		
		this.setActiveChallenge(challenge);
    this.walkTracker();
    this.saveGameStateToFile();
    this.initInfoStream();
	}

  backToNavigation() {
    this.setReactive({challengeStatus :"navigate"});
    clearTimeout(this.checkInTimeout);
    this.initInfoStream(); 
  }


  /** challenges **/

	// called when user enters a challenge 
  // note: useChallengeConnection is set to false for installation mode where connection is specified in installation obj
	setActiveChallenge = (challenge, useChallengeConnection=true, installationId=null)=> {

    if(!challenge) {
      this.showNotification("challenge not found, aborting...");
      return;
    }

		this.setReactive({
			activeChallenge: challenge,
      numChallengeParticipants: 1,
      numChallengeParticipantsWithInstrument: 0,
      challengeStageIndex: 0
		});

    if(this.state.gameMode == "walk") {
      this.setReactive({challengeStatus: "navigate"});
    } else {
      this.setReactive({challengeStatus: "prepare"});
    }

    sequenceService.setSequence(challenge.sequence_id);

    if(useChallengeConnection) {
      const connection = storageService.findServer(challenge.relay_server_id)
      relayService.setServer(challenge.relay_server_id);
      networkService.setConnection(connection || undefined);
    }
    
    this.setReactive({
      statusBarTitle: sequenceService.getLocalizedSequenceAttribute("title"),
      statusBarSubtitle: sequenceService.getLocalizedSequenceAttribute("subtitle")
    })
    
    relayService.emitMessage({
      code: "joinChallenge", 
      challengeId: challenge._id, 
      challengeShorthand: challenge.shorthand,
      placeId: this.state.activePlace ? this.state.activePlace._id : null, 
      installationId: installationId, 
      deviceId: storageService.getDeviceId()});
    this.activateRelayCallbacks();
	}

  joinChallengeInstallation = (challenge)=> {
    this.setActiveChallenge(challenge, false, this.state.activeInstallation._id);
    this.initInfoStream(); 
    peakService.invalidateStill();
  }

  getActiveChallengeStage = () => {
    if(!this.state.activeChallenge) return null;
    let stages = storageService.getChallengeStages(this.state.activeChallenge);
    if(!stages) return null;
    if(this.state.challengeStageIndex < stages.length) {
      return stages[this.state.challengeStageIndex];
    } else {
      return null;
    }
  }

  getStageInstruments = () => {
    let stage = this.getActiveChallengeStage();
    if(!stage) return [];
    return stage.instruments;
  }

  instrumentAllowedInStage(instrument) {
    let permittedInstruments = this.getStageInstruments();
    //console.warn(permittedInstruments, instrument);
    if(!permittedInstruments || permittedInstruments.length == 0) return true;
    return permittedInstruments.includes(instrument)
  }

  incrementChallengeStage = () => {
    if(!this.state.activeChallenge) return null;
    let stages = storageService.getChallengeStages(this.state.activeChallenge);
    if(!stages) return;
    if(this.state.challengeStageIndex < stages.length - 1) { // always stay on last stage
      this.setReactive({challengeStageIndex: this.state.challengeStageIndex + 1})
    }

    // deselect track if not allowed in new stage
    if(sequenceService.state.currentTrack) {
      if(!this.instrumentAllowedInStage(sequenceService.state.currentTrack.name)) {
        this.trackSelect(null);
      }  
    }
  }

  leaveChallenge() {
    if(!this.state.activeChallenge) return;
    relayService.emitMessage({
      code: "leaveChallenge", 
      challengeId: this.state.activeChallenge ? this.state.activeChallenge._id : null, 
      installationId: this.state.activeInstallation ? this.state.activeInstallation._id : null,
      deviceId: storageService.getDeviceId()
    });  
    
    sequenceService.stopSequence();
    soundService.unloadSoundfiles();

    this.setReactive({
      showInstrumentSelector: false
    })
    
    if(this.state.gameMode == "walk") {
      this.setupActivePlace();
    }

    if(this.state.gameMode == "installation") {
      this.setReactive({
        activeChallenge: null,
        challengeStatus: "off",
        statusBarTitle: storageService.t('installation-choose-a-passage')
      });
    }

    this.initInfoStream();

  }

  updateInstallationActivity = (deviceMap) => {
    this.state.installationActivityMap = null;
    if(deviceMap)
      Object.keys(deviceMap).forEach((key)=>{
        if(storageService.installationContainsChallenge(this.state.activeInstallation, deviceMap[key].challengeId)) {
          if(!this.state.installationActivityMap) this.state.installationActivityMap = {};
          this.state.installationActivityMap[deviceMap[key].challengeId] = "active"    
        }        
      });
    this.setReactive({
      installationActivityMap: this.state.installationActivityMap,
      installationConencted: true,
    })
    // set tutorial to complete if people are there and we haven't started the tutorial
    if((!this.state.tutorialStatus || 
      (this.state.tutorialStatus == "tutorial-installation-1" && peakService.state.still)) 
      && this.state.installationActivityMap) {
      this.setReactive({tutorialStatus: "tutorial-installation-complete"});
    }
    // reset the tutorial if we connect or are still and no one is there
    if((!this.state.tutorialStatus || peakService.state.still) && !this.state.installationActivityMap && !this.state.debugMode) {
     this.setReactive({tutorialStatus: "tutorial-installation-1"}); 
    }
    this.initInfoStream();
  }

  onMessageReceived = (msgObj) => {
    //console.warn(msgObj);

    if(msgObj.code == "installationInfo" && msgObj.payload) {
      //console.warn("installationInfo");
      //console.warn(msgObj);
      if(msgObj.payload.deviceMap) {
        this.updateInstallationActivity(msgObj.payload.deviceMap);
      }
    }

    if(msgObj.code == "challengeParticipantUpdate") {
      if(this.state.activeChallenge) {
        if(msgObj.challengeId == this.state.activeChallenge._id 
          + (this.state.activeInstallation ? "@" + this.state.activeInstallation._id : "")
          + (this.state.activePlace ? "@" + this.state.activePlace._id : "")
          ) {
          //console.warn(msgObj);
          this.setReactive({
            numChallengeParticipants: msgObj.numParticipants,
            selectedTracks: msgObj.selectedTracks
          })
          if(typeof msgObj.numParticipantsWithInstrument != "undefined") {
            this.setReactive({
              numChallengeParticipantsWithInstrument: msgObj.numParticipantsWithInstrument,  
            })            
          }
          //console.warn(msgObj);
          this.initInfoStream();
        }  
      } else {
        if(this.state.gameMode == "installation") {
          //this.state.installationActivityMap[msgObj.challengeId] = msgObj.numParticipants > 0 ? "active" : "inactive";
          //this.setReactive({installationActivityMap:this.state.installationActivityMap});
          if(msgObj.deviceMap) {
            this.updateInstallationActivity(msgObj.deviceMap);
          }
        }
      }
    }
        
    // if this is start sequence message
    if(msgObj.code == "startSequence") {
      if(this.state.activeChallenge) {
        if(msgObj.challengeId == this.state.activeChallenge._id
           && (this.state.activePlace ? msgObj.placeId == this.state.activePlace._id : true)
           && (this.state.activeInstallation ? msgObj.installationId == this.state.activeInstallation._id : true)
          ) {
          this.startSequenceRemotely(msgObj.startTime)  
        }  
      }
    }
  }

  // clear to start sequence
  enoughChallengeParticipantsReady = ()=> {
    let stage = this.getActiveChallengeStage();
    //console.warn(stage);

    if(this.state.debugMode) return true;

    if(!stage) return true;
    if(!stage.minParticipants) return true;

    return this.state.numChallengeParticipantsWithInstrument >= stage.minParticipants;
  }
  
  activateRelayCallbacks() {
    relayService.listenForMessages(this.onMessageReceived);
  }

	setActiveChallengeStatus = (status)=> {
		this.setReactive({challengeStatus: status});
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

  // called from TrackSelector when user selects track
  trackSelect = (track)=> {
    sequenceService.trackSelect(track);
    if(track) {
      this.setReactive({numChallengeParticipantsWithInstrument: this.state.numChallengeParticipantsWithInstrument + 1});  
    } else {
      this.setReactive({numChallengeParticipantsWithInstrument: this.state.numChallengeParticipantsWithInstrument - 1});
    }
    this.initInfoStream();
    relayService.emitMessage({code: "selectTrack", 
      deviceId: storageService.getDeviceId(), 
      challengeId: this.state.activeChallenge._id, 
      placeId: this.state.activePlace ? this.state.activePlace._id : null,
      installationId: this.state.activeInstallation ? this.state.activeInstallation._id : null,      
      track: track ? track.name : null
    });
  }

  startSequence = () => {

      if(this.state.challengeStatus == "play" && this.enoughChallengeParticipantsReady()) {
        //this.showNotification("starting sequence...");
        //this.showInfoStreamAlert(storageService.t("starting"));
        
        let nowTime = soundService.getSyncTime();
        let startTime = nowTime + 5000; // set time for sequence to start
        sequenceService.startSequence(startTime, true); // set local start flag to true 

        // send start_sequence message to all players connected via nearby
        relayService.emitMessage({
          code: "startSequence", 
          challengeId: this.state.activeChallenge._id, 
          installationId: this.state.activeInstallation ? this.state.activeInstallation._id : null,
          placeId: this.state.activePlace ? this.state.activePlace._id : null,
          startTime: startTime
        });  
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
      //console.warn("startSequenceRemotely: shifting timing")
      //sequenceService.shiftSequenceToNewStartTime(startTime);
    }
    // should this request start the sequence?
    // yes, if sequence is ready to play
    else if (sequenceService.state.controlStatus === "idle") {
      //console.warn("startSequenceRemotely: starting sequence")
      sequenceService.startSequence(startTime, false)
    } else {
      console.log("startSequenceRemotely: ignored, time diff:", startTime, sequenceService.state.playbackStartedAt)
    }
    return null
  }

  handleMissedCue() {
    if(this.state.activeChallenge.item_manual_mode == "assisted") {
      this.showInfoStreamAlert(storageService.t("too-late"), "red");
      //this.showNotification("too late! skipping sound...");   
      sequenceService.skipNextItem();
    }
  }

  handleMissedGuitarHeroCue() {
    this.showInfoStreamAlert(storageService.t("too-late"), "red");
    //this.showNotification("guitar hero too late!");
    //console.warn("guitar hero missed cue");
    sequenceService.stopCurrentSound();
  }

	// manual start of items - also called by gestures
	handlePlayNextItem = ()=> {

		// if the sequence isn't running, start the sequence and inform other players
		if(sequenceService.getControlStatus() == "idle") {
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
				
        //console.warn("handlePlayNextItem with difference: " + difference);
        console.log(sequenceService.state.currentItem);

        if(this.state.activeChallenge.item_manual_mode == "guitar hero") {
            if(difference <= -this.guitarHeroThreshold.pre) {
              if(sequenceService.state.scheduledItem.startTime == 0 && sequenceService.state.loopCounter == 0) {
                sequenceService.approveScheduledOrCurrentItem(); // always approve first item at start of sequence
              } else {
                this.showInfoStreamAlert(storageService.t("too-early"));  
              }
              
              //this.showNotification("guitar hero: too early!");    
            }
            if(difference > -this.guitarHeroThreshold.pre && difference <= this.guitarHeroThreshold.post) {
              this.showInfoStreamAlert(storageService.t("good"));
              //this.showNotification("guitar hero: good!");   
              sequenceService.approveScheduledOrCurrentItem();
            }
        } else {
  				if(this.state.activeChallenge.item_manual_mode == "assisted") {
  					if(difference <= -this.assistanceThreshold) {
  						this.showInfoStreamAlert(storageService.t("too-early"), "red");
              //this.showNotification("too early! try again");		
  					}
  					if(difference > -this.assistanceThreshold && difference <= 0) {
              this.showInfoStreamAlert(storageService.t("good"));
              //this.showNotification("good!");		
  					  sequenceService.scheduleSoundForNextItem(officialTime); 			
  					}
  					if(difference > 0) {
  						this.showInfoStreamAlert(storageService.t("too-late"), "red");
              //this.showNotification("too late! skipping sound...");		
  						sequenceService.skipNextItem();
  					}
  				} else {
  					sequenceService.scheduleSoundForNextItem(now); 		
  				}
        }		
			}	else {
        this.showNotification("couldn't start sequence - still loading?"); // this should only appear when files missing
      }
		}

		sequenceService.updateActionInterface();
  }

  handleSkipItem() {
  	sequenceService.skipNextItem();
  }

  // confusing - investigate & rename?
  handleStopItem() {
   	sequenceService.stopCurrentSound();
  }

  backToLobby() {
    //sequenceService.cancelItemsAndSounds()
    sequenceService.turnOffVolumeCurrentItem();
    this.setReactive({challengeStatus :"prepare"});
    this.initInfoStream();
  }

  
  /** interface actions **/

  handleStillEvent = ()=> {
    //console.warn("still");
    if(this.state.gameMode == "installation" && this.state.activeChallenge && !this.state.debugMode) {
      this.leaveChallenge();
    }
    if(this.state.gameMode == "installation" && !this.state.installationActivityMap && !this.state.debugMode) {
      this.setReactive({
        tutorialStatus: "tutorial-installation-1"
      });
      this.initInfoStream();
    }
  }

  handleMoveEvent = ()=> {
    //console.warn("move");
    if(this.state.gameMode == "installation" && this.state.tutorialStatus == "tutorial-installation-1" && !this.state.debugMode) {
      this.setReactive({
        tutorialStatus: "tutorial-installation-2"
      });
      this.initInfoStream();
    }
  } 

  // big left button on game container
  handleLeftButton = ()=> {
    switch(this.state.challengeStatus) {
      case "play":
        this.backToLobby();
        break;
      case "prepare":
        if(this.state.gameMode == "walk") {
          this.backToNavigation();  
        }
        if(this.state.gameMode == "installation") {
          this.leaveChallenge();
        }
        break;
      default:
        this.showNotification("no current function");
    }
  }

  // center button for instrument selection
  handleMidButton = ()=> {
    if((this.state.challengeStatus == "prepare" || this.state.challengeStatus == "play") 
      && this.state.tutorialStatus != "practice-sequence"
      && this.state.walkStatus != "final-challenge") {
      this.setReactive({
        showInstrumentSelector: !this.state.showInstrumentSelector
      });  
    } else {
      //this.showNotification("no current function");
    }
  }

  // center button to close instrument selection modal
  handleCloseModal = (cancel=false)=> {
    this.setReactive({
      showInstrumentSelector: false
    });
    /*if(!cancel && sequenceService.state.currentTrack && this.state.challengeStatus == "prepare") {
      this.handleRightButton();  
    }*/
  }

  // big right button on game container
  handleRightButton = ()=> {
    // decide what to do depending on our current challengeStatus
    switch(this.state.challengeStatus) {
      case "tutorial":
        if(this.state.tutorialStatus == "tutorial-intro") {
          this.setReactive({tutorialStatus: "step-1"});
        }
        this.initInfoStream();
        break;
      case "navigate":
        this.setReactive({
          challengeStatus: "prepare"
        });            
        clearTimeout(this.checkInTimeout);
        this.initInfoStream();
        break;
      case "prepare":
        this.setReactive({
          challengeStatus: "play",
        });
        sequenceService.resetTrack();  
        this.activateRelayCallbacks();
        this.initInfoStream();
        break;
      default:
        //this.showNotification("no current function");
    }
  }

  // info stream management
  clearInfoStream = ()=> {
    this.setReactive({
      infoStream: [],
      infoStreamVideo: null
    });
  }

  addItemToInfoStream = (title, content) => {
    let infoStream = this.state.infoStream;
    infoStream.push({title: title, content: content});
    this.setReactive({
      infoStream: infoStream
    });
  }

  showInfoStreamAlert = (text, color="blue", duration=2000) => {
    //console.warn(soundService.getSyncTime() + " showInfoStreamAlert: ", text);
    this.setReactive({
      infoAlert: {
        text: text,
        color: color
      }
    });
    if(this.infoAlertTimeout) {
      clearTimeout(this.infoAlertTimeout);
    }
    this.infoAlertTimeout = setTimeout(()=>{
      //console.warn(soundService.getSyncTime() + " infoAlert: null");
      this.setReactive({infoAlert: null});
    }, duration)
  }

  initInfoStream = ()=> {
    this.clearInfoStream();    

    // special case - intro for installation
    if(this.state.gameMode == "installation" && this.state.installationConencted) {
      switch(this.state.tutorialStatus) {
        case "tutorial-installation-1":
          this.addItemToInfoStream(storageService.t("welcome"), storageService.t("tutorial-installation-1"));
          break;
        case "tutorial-installation-2":
          soundService.preloadSoundfiles([this.getPracticeSoundFile("1", this.state.installationStartInstrument)], ()=>{
            //console.warn("practice sound loaded");
          });
          this.addItemToInfoStream(storageService.t("welcome"), storageService.t("tutorial-installation-2"));
          this.activatePeakTutorial(()=>{
            this.playPracticeSound(this.getPracticeSoundFile("1", this.state.installationStartInstrument), storageService.t("info"), storageService.t("tutorial-installation-playing"), "tutorial-installation-complete", "tutorial-installation-playing");
            this.showInfoStreamAlert(storageService.t("good"), "blue", 4000);
          });
          break;
      }
    }
    
    if(this.state.gameMode == "manual" || this.state.gameMode == "walk" || this.state.gameMode == "installation") {

      switch(this.state.challengeStatus) {
        case "tutorial": 
          this.updateTutorial();
          break;
        case "navigate":
          let navText = storageService.t("navigation-1");
          let description = this.state.activePlace ? this.state.activePlace["description_" + storageService.state.language] : null;
          if(description) {
            if(description != "new" && description != "neu") {
              navText = description;
            }
          }
          this.addItemToInfoStream(storageService.t("navigation"), navText);
          clearTimeout(this.checkInTimeout);
          this.checkInTimeout = setTimeout(()=>{
            this.addItemToInfoStream(storageService.t("navigation"), storageService.t("navigation-2"));  
            this.setReactive({allowCheckInButton: true});
          }, this.debugMode ? 500 : this.checkInButtonDelay );
          break;
        case "prepare":
          let stage = this.getActiveChallengeStage();
          if(stage) {
            ["text1", "text2"].forEach(key=> {
              let textItem = stage[key + "_" + storageService.state.language]
              if(textItem) {
                this.addItemToInfoStream(storageService.t("info"), textItem);  
              } else {
                if(key == "text1") this.addItemToInfoStream(null, storageService.t("translation-missing"));  
              } 
            });
            let video = this.getVideoPathForActiveChallengeStage();
            if(video) {
              this.setReactive({
                infoStreamVideo: video
              })
            }
          }
          break;
        case "play":
          sequenceService.updateActionInterface();
          break;
      }

      // special case - end of walk - todo: add before walk here?
      if(this.state.walkStatus == "ended") {
        this.addItemToInfoStream("navigation", "you are at the end of your path. please give back the device"); 
      }
    
    }
    
    
  }

  updateTutorial = ()=> {
    switch(this.state.tutorialStatus) {
      case "tutorial-intro":
        this.addItemToInfoStream(storageService.t("welcome"), storageService.t("tutorial-intro-1"));
        this.addItemToInfoStream(storageService.t("info"), storageService.t("tutorial-intro-2"));
        break;
      case "step-1":
        this.addItemToInfoStream(storageService.t("info"), storageService.t("tutorial-instructions-1a"));  
        this.addItemToInfoStream(storageService.t("tutorial"), storageService.t("tutorial-instructions-1b"));  
        this.preloadPracticeSound(1);
        this.preloadPracticeSound(2);
        this.activatePeakTutorial(()=>{
          this.playPracticeSound(this.getPracticeSoundFile("1"), storageService.t("info"), storageService.t("tutorial-instructions-playing-1"), "step-2", "step-1-playing");
          this.showInfoStreamAlert(storageService.t("good"), "blue", 4000);
        });
        break;
      case "step-2":
        this.clearInfoStream();
        this.addItemToInfoStream(storageService.t("tutorial"), storageService.t("tutorial-instructions-2"));  
        this.activatePeakTutorial(()=>{
          this.playPracticeSound(this.getPracticeSoundFile("2"), storageService.t("info"), storageService.t("tutorial-instructions-playing-2"), "ready-for-practice", "step-2-playing");
          this.showInfoStreamAlert(storageService.t("good"), "blue", 4000);
        });
        break;
      case "ready-for-practice":
        this.clearInfoStream();
        this.addItemToInfoStream(storageService.t("info"), storageService.t("tutorial-complete"));
        break;  
    }
  }

  getPracticeSoundFile = (index, instrument=null) => {
    if(!instrument) {
      instrument = this.state.walkInstrument  
    }
    if(!instruments[instrument]) {
      this.showNotification("practice instrument sound file not found for " + instrument);
      return null;
    }
    return instruments[instrument]["practiceSoundPath" + index]; 
  }

  preloadPracticeSound = (index) => {
    soundService.preloadSoundfiles([this.getPracticeSoundFile(index)], ()=>{
      //console.warn("practice sound loaded");
    }); 
  }

  playPracticeSound = (path, playInstructionsHeader, playInstructions, endStatus, playingStatus=null) => {
    if(!path) return;
    soundService.scheduleSound(path, soundService.getSyncTime(), {
      onPlayStart: ()=>{
        if(playingStatus) this.setReactive({tutorialStatus: playingStatus});
        this.addItemToInfoStream(playInstructionsHeader, playInstructions);
      },
      onPlayEnd: ()=>{
        this.setReactive({tutorialStatus: endStatus});
        this.updateTutorial();
      }
    });
  }

  activatePeakTutorial = (callback)=> {
    peakService.waitForStart(() => {
        peakService.stopWaitingForStart();
        peakService.stopWaitingForStop();
        callback();
    });
    peakService.waitForStop(()=>
      peakService.stopWaitingForStop();
      peakService.stopWaitingForStart();
      callback();
    });
  }

  // video

  getVideoPathForActiveChallengeStage = () => {
    let stage = this.getActiveChallengeStage();

    let video = stage["video_" + storageService.state.language];
    let thumb = stage["video_thumb"];
    if(video) {
      return {video: "/video/" + video, thumb: thumb ? "/video/" + thumb : "/video/testvideo.png"}  
    } else {
      return null;
    }
    
  }

  startVideo = (video) => {
    this.setReactive({activeVideo: video});
  }

  stopVideo = () => {
    this.setReactive({activeVideo: null});
  }

}

const gameService = new GameService();

export {gameService};