import Service from './Service';

import {sequenceService, soundService, storageService, relayService, networkService, peakService} from './';

import loadNavigationAssets from '../../config/instruments'
const instruments = loadNavigationAssets();

const defaultStatusBarTitle = "Unboxing Mozart";
const defaultStatusBarSubtitle = "Development Version - Testing"

class GameService extends Service {

	constructor() {
		// initialize with reactive vars
		super("gameService", {
			gameMode: "manual",			// manual, walk, installation
			activeWalk: null,
			pathIndex: 0,
			walkStatus: "off",			// off -> tutorial-intro -> ongoing -> ended
      challengeStatus: "off",		// off <-> navigate -> (tutorial->) prepare <-> play 
			activeChallenge: null, 		// active challenge saved here
			tutorialStatus: "off",     // off -> step-1 -> complete
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

    this.earlyLeaveMinutes = 0; // time left in place before force is used
    this.checkInButtonDelay = 100;

    this.walkTrackerInterval = setInterval(this.walkTracker, 10000);

    // automatically resume the last walk saved
    setTimeout(()=>{
      this.resumeWalkFromFile();
    }, 3000);
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
				gameMode: "manual",
        walkStatus: "off"
			});

			this.leaveChallenge();
		}
	}

  /** game mode management **/

  getStartTimeNow() {
    let now = new Date(soundService.getSyncTime());    
    return now.getHours() + ":" + now.getMinutes();
  }

	// for navigation testing
  setupMinimalWalk(place) {
    
    this.setReactive({
        activeWalk: {tag: place.tag, startTime: this.getStartTimeNow()},
        activePath: {places: [{place: place.shorthand, duration: 2}]},
        pathLength: 1,
        pathIndex: 0,
        gameMode: "walk"
      });
    this.walkTracker();
    this.setupActivePlace();
  }

  // sets up a minimal walk with tutorial feature for testing
  setupTutorialWalk() {
    let place1 = storageService.getPlaceAtIndex(4);
    let place2 = storageService.getPlaceAtIndex(0);
    let place3 = storageService.getPlaceAtIndex(1);

    this.setReactive({
        activeWalk: {tag: place1.tag, tutorial: true, startTime: this.getStartTimeNow()},
        activePath: {
          places: [
            {place: place1.shorthand, duration: 5}, 
            {place: place2.shorthand, duration: 5}, 
            {place: place3.shorthand, duration: 5}
          ],
          startInstrument: "viola1"
        },
        pathLength: 3,
        pathIndex: -1,
        gameMode: "walk",
        walkStatus: "tutorial-intro",
        challengeStatus: "off"
    });
    this.initInfoStream();
    this.walkTracker();
    if(this.state.pathIndex > -1) {
      this.setupActivePlace();  
      sequenceService.trackSelectByName(this.state.activePath.startInstrument);
    }
  }

  // called when admin starts walk
	startWalkByTag = (tag, startTime) => {
    let walk = storageService.getWalkByTag(tag);
    walk.startTime = startTime;
    this.setActiveWalk(walk)
  }

  setActiveWalk = (walk)=> {
		
		let activePath = storageService.getActivePath(walk);
		
		if(activePath) {

			this.setReactive({
				activeWalk: walk,
        activePath: activePath,
        pathLength: activePath.places.length,
				pathIndex: walk.tutorial ? -1 : 0,
				gameMode: "walk",
        walkStatus: walk.tutorial ? "tutorial-intro" : "ongoing",
        challengeStatus: "off"
			});

      if(walk.tutorial) {
        this.initInfoStream();
      } else {
        this.setupActivePlace();  
      }

      this.walkTracker();
		}
	}

  /** persist and resume **/

  saveGameStateToFile = () => {
    storageService.saveGameStateToFile(this.state);
  }

  resumeWalkFromFile = () => {
    storageService.loadGameStateFromFile(stateObj=>{
      //console.warn("loaded", stateObj);

      if(stateObj.activeWalk && stateObj.gameMode == "walk") {
        if(stateObj.pathIndex < stateObj.pathLength) {
          this.setReactive({
            activeWalk: stateObj.activeWalk,
            activePath: stateObj.activePath,
            pathLength: stateObj.pathLength,
            pathIndex: stateObj.pathIndex,
            gameMode: stateObj.gameMode,
            walkStatus: stateObj.walkStatus,
            challengeStatus: "off"
          });
          if(!(stateObj.activeWalk.tutorial && stateObj.pathIndex == 0)) {
            this.setupActivePlace();  
          }
          this.walkTracker();
          this.initInfoStream(); 
        }        
      }
    });
  }


  /** walks and places **/

  getWalkStartTime(walk) {
    let hours = walk.startTime.split(":")[0];
    let minutes = walk.startTime.split(":")[1];
    let walkStartTime = new Date();
    walkStartTime.setHours(hours, minutes, 0, 0);
    return walkStartTime.getTime();
  }

  getStartTimeForWalkIndex(index) {
    let walkStartTime = this.getWalkStartTime(this.state.activeWalk);
    let totalDuration = 0;
    for(let i = 0; i < index; i++) {
      totalDuration += this.state.activePath.places[i].duration;
    }
    let r = walkStartTime + (totalDuration * 60 * 1000);
    return r;
  }

  getMinutesUntilWalkIndex(index) {
    return (this.getStartTimeForWalkIndex(index) - soundService.getSyncTime()) / 60000;
  }

  walkTracker = ()=>{
    if(this.state.activeWalk && this.state.activePath) {

      // check if current stage needs to be advanced
      if(this.state.pathIndex > -1 && this.state.pathIndex < this.state.activePath.places.length) {
        let minutesToNextStage = this.getMinutesUntilWalkIndex(this.state.pathIndex + 1);
        
        if(minutesToNextStage < this.earlyLeaveMinutes) {
          //this.setReactive({allowPlaceExit: true});
          //this.backToLobby();
          this.leaveChallenge(); 
          this.moveToNextPlaceInWalk(); // when time in place is up force to lobby, force out of place - needs playtesting
        } else {
          this.setReactive({allowPlaceExit: false});
        }
        this.setReactive({minutesToEnd: minutesToNextStage});
      }
      
      // update minutes until last stage of the path - needs playtesting
      //let minutesToEnd = this.getMinutesUntilWalkIndex(this.state.activePath.places.length - 1);
      //this.setReactive({minutesToEnd: minutesToEnd});
    }
  }

	// called when user leaves place, moves to next one
	moveToNextPlaceInWalk = ()=> {
    this.setReactive({
			pathIndex: this.state.pathIndex + 1
		});
		this.setupActivePlace();
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
	}

  nthPlaceInTutorial = (n) => {
    if(!this.state.activeWalk) return false;
    return (this.state.activeWalk.tutorial && this.state.pathIndex == n);
  }

  backToNavigation() {
    this.setReactive({challengeStatus :"navigate"});
    clearTimeout(this.checkInTimeout);
    this.initInfoStream(); 
  }


  /** challenges **/

	// called when user enters a challenge
	setActiveChallenge = (challenge)=> {

		this.setReactive({
			activeChallenge: challenge,
      numChallengeParticipants: 1,
      numChallengeParticipantsWithInstrument: 0,
      challengeStageIndex: 0
		});

    this.setReactive({challengeStatus: this.state.gameMode == "walk" ? "navigate" : "prepare"});

    sequenceService.setSequence(challenge.sequence_id);

    const connection = storageService.findServer(challenge.relay_server_id)
    relayService.setServer(challenge.relay_server_id);
    networkService.setConnection(connection || undefined);

    this.setReactive({
      statusBarTitle: sequenceService.getSequenceName(),
      statusBarSubtitle: challenge.name
    })
    
    relayService.emitMessage({code: "joinChallenge", challengeId: challenge._id, deviceId: storageService.getDeviceId()});
    this.activateRelayCallbacks();
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
    if(!permittedInstruments || permittedInstruments.length == 0) return true;
    return permittedInstruments.includes(instrument)
  }

  incrementChallengeStage = () => {
    if(!this.state.activeChallenge) return null;
    let stages = storageService.getChallengeStages(this.state.activeChallenge);
    if(!stages) return;
    if(this.state.challengeStageIndex < stages.length) {
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
          this.setReactive({
            numChallengeParticipants: msgObj.numParticipants,
            numChallengeParticipantsWithInstrument: msgObj.numParticipantsWithInstrument,
            selectedTracks: msgObj.selectedTracks
          })
          this.initInfoStream();
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

  // clear to start sequence
  enoughChallengeParticipantsReady = ()=> {
    let stage = this.getActiveChallengeStage();
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
    relayService.emitMessage({code: "selectTrack", deviceId: storageService.getDeviceId(), challengeId: this.state.activeChallenge._id, track: track ? track.name : null});
  }

  startSequence = () => {

      if(this.state.challengeStatus == "play" && this.enoughChallengeParticipantsReady()) {
        //this.showNotification("starting sequence...");
        //this.showInfoStreamAlert(storageService.t("starting"));
        
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
      this.showInfoStreamAlert(storageService.t("too-late"), "red");
      //this.showNotification("too late! skipping sound...");   
      sequenceService.skipNextItem();
    }
  }

  handleMissedGuitarHeroCue() {
    this.showInfoStreamAlert(storageService.t("too-late"), "red");
    //this.showNotification("guitar hero too late!");
    console.log("guitar hero missed cue");
    sequenceService.stopCurrentSound();
  }

	// manual start of items - also called by gestures
	handlePlayNextItem = ()=> {

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
				
        console.log("handlePlayNextItem with difference: " + difference);
        console.log(sequenceService.state.currentItem);

        if(this.state.activeChallenge.item_manual_mode == "guitar hero") {
            if(difference <= -this.guitarHeroThreshold.pre) {
              this.showInfoStreamAlert(storageService.t("too-early"));
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

  // big left button on game container
  handleLeftButton = ()=> {
    switch(this.state.challengeStatus) {
      case "play":
        this.backToLobby();
        break;
      case "prepare":
        this.backToNavigation();
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

  // center button to close instrument selection modal
  handleCloseModal = ()=> {
    this.setReactive({
      showInstrumentSelector: false
    });
    if(sequenceService.state.currentTrack) {
      this.handleRightButton();  
    }
  }

  // big right button on game container
  handleRightButton = ()=> {
    if(this.state.walkStatus == "tutorial-intro") {
      this.moveToNextPlaceInWalk();
      this.initInfoStream();
      return;
    }

    // decide what to do depending on our current challengeStatus
    switch(this.state.challengeStatus) {
      case "navigate":
        let timeForTutorial = this.state.activeWalk.tutorial && this.state.pathIndex == 0;
        this.setReactive({
          challengeStatus: timeForTutorial ? "tutorial" : "prepare",
          tutorialStatus: timeForTutorial ? "step-1" : "off"
        });            
        clearTimeout(this.checkInTimeout);
        this.initInfoStream();
        break;
      case "tutorial":
        this.setReactive({challengeStatus: "prepare"});
        if(this.state.tutorialStatus == "complete") {
          sequenceService.trackSelectByName(this.state.activePath.startInstrument);
        }
        this.initInfoStream();
        break;
      case "prepare":
        this.setReactive({
          challengeStatus: "play",
          tutorialStatus: "first-play"
        });
        if(sequenceService.getControlStatus() == "playing") {
          sequenceService.turnOnVolumeCurrentItem();
        } else {
          sequenceService.resetTrack();  
        }
        
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
      this.setReactive({infoAlert: null});
    }, duration)
  }

  initInfoStream = ()=> {
    this.clearInfoStream();    
    
    // spcial case - intro before beginning of tutorial walk
    if(this.state.walkStatus == "tutorial-intro") {
      this.addItemToInfoStream(storageService.t("welcome"), storageService.t("tutorial-intro-1"));
      this.addItemToInfoStream(storageService.t("info"), storageService.t("tutorial-intro-2"));
    }

    // there is an active challenge
    switch(this.state.challengeStatus) {
      case "navigate":
        this.addItemToInfoStream(storageService.t("navigation"), storageService.t("navigation-1"));
        this.checkInTimeout = setTimeout(()=>{
          this.addItemToInfoStream(storageService.t("navigation"), storageService.t("navigation-2"));  
          this.setReactive({allowCheckInButton: true});
        }, this.checkInButtonDelay);
        break;
      case "tutorial": 
        this.updateTutorial();
        break
      case "prepare":
        if(this.nthPlaceInTutorial(0)) {
          if(!this.state.allowPlaceExit) {
            this.addItemToInfoStream(storageService.t("welcome"), storageService.t("tutorial-place-0-1"));  
          }
        } 

        else if(this.nthPlaceInTutorial(1)) {
          if(!this.state.allowPlaceExit) {
            this.addItemToInfoStream(storageService.t("welcome"), storageService.t("tutorial-place-1-1"));  
          }
        }

        else {

          let stage = this.getActiveChallengeStage();
          if(stage) {
            
            ["text1", "text2"].forEach(key=> {
              let textItem = stage[key + "_" + storageService.state.language]
              if(textItem) {
                this.addItemToInfoStream(storageService.t("info"), textItem);  
              }  
            });

            let video = this.getVideoPathForActiveChallengeStage();
            if(video) {
              this.setReactive({
                infoStreamVideo: video
              })
            }

          }
        }
        
        /*if(!sequenceService.state.currentTrack && !this.state.allowPlaceExit) {
          this.addItemToInfoStream(storageService.t("info"), storageService.t("prompt-select-instrument"));  
        }*/

        /*if(this.state.allowPlaceExit) {
          this.addItemToInfoStream(storageService.t("info"), storageService.t("time-to-go"));   
        }*/
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

  updateTutorial = ()=> {
    switch(this.state.tutorialStatus) {
      case "step-1":
        this.addItemToInfoStream(storageService.t("info"), storageService.t("tutorial-instructions-1a"));  
        this.addItemToInfoStream(storageService.t("tutorial"), storageService.t("tutorial-instructions-1b"));  
        this.preloadPracticeSound(1);
        this.preloadPracticeSound(1);
        this.activatePeakTutorial(()=>{
          this.playPracticeSound("1", storageService.t("info"), storageService.t("tutorial-instructions-playing-1"), "step-2", "step-1-playing");
          this.showInfoStreamAlert(storageService.t("good"));
        });
        break;
      case "step-2":
        this.addItemToInfoStream(storageService.t("tutorial"), storageService.t("tutorial-instructions-2"));  
        this.activatePeakTutorial(()=>{
          this.playPracticeSound("2", storageService.t("info"), storageService.t("tutorial-instructions-playing-2"), "complete", "step-2-playing");
          this.showInfoStreamAlert(storageService.t("good"));
        });
        break;
      case "complete":
        this.addItemToInfoStream(storageService.t("info"), storageService.t("tutorial-complete"));
        break;  
    }
  }

  getPracticeSoundFile = (index) => {
    return instruments[this.state.activePath.startInstrument]["practiceSoundPath" + index]; 
  }

  preloadPracticeSound = (index) => {
    soundService.preloadSoundfiles([this.getPracticeSoundFile(index)], ()=>{
      //console.warn("practice sound loaded");
    }); 
  }

  playPracticeSound = (index, playInstructionsHeader, playInstructions, endStatus, playingStatus=null) => {
    soundService.scheduleSound(this.getPracticeSoundFile(index), soundService.getSyncTime(), {
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
        peakService.stopWaitingForStart()
        callback();
    });  
  }

  // video

  getVideoPathForActiveChallengeStage = () => {
    let stage = this.getActiveChallengeStage();

    let video = stage["video_" + storageService.state.language];
    if(video) {
      return "/video/" + video;  
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