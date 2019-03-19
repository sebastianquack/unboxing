import Service from './Service';

import {soundService, gameService, gestureService, peakService, storageService } from './';

class SequenceService extends Service {

	constructor() {

		// reactive vars - used in interface component
		super("sequenceService", {
			controlStatus: "idle", // idle -> loading -> ready -> playing
			currentSequence: null, // sequence object
      currentTrack: null, // track object
			playbackStartedAt: null, // start time of first loop of this sequence
			loopStartedAt: null, // absolute start time of current sequence (in each loop)
			nextItem: null, // next item to play, if available
			scheduledItem: null, // item scheduled for play
			currentItem: null, // current item playing, if available
			showPlayItemButton: false, // should play button be shown
			beatTickActive: false, // should beat be played on the beat
			nextUserAction: {}, // information about the next user action such as gesture start/end time
			loopCounter: 0,
			sequenceTimeVisualizer: 0,
			endedFlag: false // set to true when sequence ended
		});

		// not reactive - used for internal calculations
		this.localStart = false;
		this.beatTimeout = null;

		// bind
		this.activateNextUserAction = this.activateNextUserAction.bind(this)
		this.deactivateUserAction = this.deactivateUserAction.bind(this)
	}



	/** HELPER FUNCTIONS **/

	getControlStatus = ()=> {
		return this.state.controlStatus;
	}

  getSequenceName = ()=> {
    if(this.state.currentSequence) {
      return this.state.currentSequence.name;
    }
    return null;
  }

  getCurrentTrackName = ()=> {
    return this.state.currentTrack ? this.state.currentTrack.name : null;
  }

	// return the first item of a specified track in the current Sequence
	firstItemInTrack = (track)=> {
		let items = this.state.currentSequence.items;
		for(let i = 0; i < items.length; i++) {
			if(items[i].track == track) {
				return items[i];
			}
		}
		return null	
	}

	getNextItemStartTimeAbsolute = ()=> {
		return this.getStartTimeAbsolute(this.state.nextItem);
	}

	getStartTimeAbsolute = (item)=> {
		if (!item) return
		const startTime = this.state.loopStartedAt + item.startTime;
		return startTime;	
	}

	sequenceStartingLocally = ()=> {
		return this.localStart && this.state.loopCounter == 0;
	}

	// check if next item should be autoplayed
	autoPlayNextItem = ()=> {
		return(this.autoPlayItem(this.state.nextItem));
	}

	autoPlayItem = (item) => {
		if(!item) return false;

		if(item.autoplay == "off") {
			return false;
		}

		if(item.autoplay == "first" && this.state.loopCounter == 0) {
			return true;
		}

		if(item.autoplay == "on") {
			return true;
		}

		// we shouldn't reach this point
		return false;	
	}




	/** UPDATES ON EVERY BEAT **/


	toggleBeatTick = ()=> {
		this.setReactive({beatTickActive: !this.state.beatTickActive});
	}

	doBeatUpdate = ()=> {
		
		// calculate time to next item
		const currentTime = soundService.getSyncTime();
    const currentTimeInSequence = currentTime - this.state.loopStartedAt;

		this.setReactive({sequenceTimeVisualizer: 
        currentTimeInSequence >= 0 || this.state.loopCounter == 0 ? currentTimeInSequence : 
        currentTimeInSequence + this.state.currentSequence.custom_duration
    });      
    
    //console.log("beat update - currentTimeInSequence", currentTimeInSequence);

		// beat calculations
		const durationOfBeat = (60000 / this.state.currentSequence.bpm);
		const currentBeatInSequence = Math.floor(currentTimeInSequence / durationOfBeat);
		const timeOfThisBeat = this.state.loopStartedAt + (currentBeatInSequence * durationOfBeat);

		// determine next startime to count down to
		let startTime = null;
    if(this.state.nextItem) {
    	startTime = this.state.nextItem.startTime;
    }
    
    if(startTime != null) {

	    const timeToNextItem = startTime - currentTimeInSequence;	
	    
	    // calculate this in beats
			const beatsToNextItem = Math.floor(timeToNextItem / durationOfBeat) - 1;

			// check if beats should be shown
			if(beatsToNextItem > 0 && !this.state.currentItem && !this.autoPlayNextItem()) {
				this.setReactive({beatsToNextItem: beatsToNextItem});	
			} else {
				this.setReactive({beatsToNextItem: ""});	

				// check if we are already past the next item, skip item
				if(beatsToNextItem < -1 && currentTimeInSequence > 0 && !this.autoPlayNextItem()) {
						gameService.handleMissedCue();		
						this.doBeatUpdate(); // jump back to start of beatUpdate, because sequence might have shifted to next loop
						return;
				}
			}
		} else {
			this.setReactive({beatsToNextItem: ""});				
		}

    // calculate time to next update
    const timeOfNextBeat = this.state.loopStartedAt + ((currentBeatInSequence + 1) * durationOfBeat);
    //console.log("beat", currentBeatInSequence);

    if(this.state.beatTickActive) {
    	soundService.click(timeOfNextBeat);	
    }
		
    let timeToNextBeat = timeOfNextBeat - soundService.getSyncTime();

		if(this.state.controlStatus == "playing") {
			if(!timeToNextBeat) {
				timeToNextBeat = 1000;
			}
			this.beatTimeout = setTimeout(this.doBeatUpdate, timeToNextBeat);		
		}

		this.updateActionInterface();
	}


	/** INTERFACE UPDATES **/

	togglePlayButton = (value)=> {
		this.setReactive({showPlayItemButton: value});
	}

	setActionMessage = (msg)=> {
		this.setReactive({nextActionMessage: msg});
    
    if(gameService.getChallengeStatus() == "play") { // filter out action messages unless in pay mode
      gameService.clearInfoStream();
      gameService.addItemToInfoStream("info", msg);  
    }
	}

	// analyse current state and display appropriate action message
	// called on every beat and at special events (setupNextSequenceItem, sound ended)
	updateActionInterface = ()=> {
		console.log("updateActionInterface");

		// sequence hasn't started yet
		if(this.state.controlStatus == "ready" && this.state.currentTrack) {
			const firstItem = this.firstItemInTrack(this.state.currentTrack.name);
			if(firstItem) {
				if(firstItem.startTime == 0) {				
					this.setActionMessage("your part is right at the beginning of this sequence. perform the start gesture to start the sequence for everyone here!");
					this.activateNextUserAction();
					
				} else {
					this.setActionMessage("you don't have anything to play at the beginning of this sequence. wait for another player to start the sequence, then join at the right moment!");
					this.deactivateUserAction();
				}
			} else {
				this.setActionMessage("your instrument has nothing to play in this sequence");
				this.deactivateUserAction();
			}
		}
		
		// sequence is playing
		if(this.state.controlStatus == "playing") {

			if(this.state.currentItem) { // currently playing

				// activate stop gesture
				peakService.waitForStop(() => {
					gameService.handleStopButton()
				});				
				
				if(this.state.currentItem.sensorModulation == "off") {
					this.setActionMessage("you're playing! try to point your instrument in a good direction!");	
					this.deactivateUserAction();
				} else {
					this.setActionMessage("you're playing! see how you can modulate the sound...");	
					this.deactivateUserAction();
				}

				// check if the start time of the next item is directly after end of current item
				if(this.state.nextItem) {
					let nextStartTime = this.getStartTimeAbsolute(this.state.nextItem);
					let currentEndTime = this.getStartTimeAbsolute(this.state.currentItem) + this.state.currentItem.duration;
					// check if loop has already moved to future
					if(this.state.loopStartedAt > soundService.getSyncTime()) {
						currentEndTime -= this.state.currentSequence.custom_duration;
					}
					console.log("currentEnd vs. nextStart", currentEndTime, nextStartTime);

					if(nextStartTime < currentEndTime + 100) {
						if(!this.autoPlayNextItem()) {
							this.setActionMessage(this.state.nextActionMessage +
								" also prepare to play your next sound with the start gesture!");	
							this.activateNextUserAction();
						}
					}
				}

			
			}	else { // currently not playing

				// deactivate stop gesture
				peakService.stopWaitingForStop();
				
				// next sound has been scheduled
				if(this.state.scheduledItem) {
					if(this.autoPlayItem(this.state.scheduledItem) // only show this if the item is being autoplayed
						&& !(this.state.scheduledItem.startTime == 0 && this.sequenceStartingLocally())) { 
						this.setActionMessage("wait for your next sound to start playing automatically");	
						this.deactivateUserAction();
					} else {
						this.setActionMessage("preparing to play...");	
						this.togglePlayButton(false);
					}
				} else {

					// no sound scheduled, but a next item has been set that is not on autoplay 
					if(this.state.nextItem && !this.autoPlayNextItem()) {
						this.setActionMessage("use the gesture to start playing at the right moment!");
						this.activateNextUserAction();
					}
				}	
			}		
		}

		// sequence has ended
		if(this.state.controlStatus == "idle") {
			if(this.state.currentSequence) {
				if(this.state.currentSequence.endedFlag) {
					this.setActionMessage("sequence ended")
					this.deactivateUserAction();
				}	
			}
		}
		
	}

	activateNextUserAction() {
		if (this.state.nextItem) {
			const nextItemStartTimeInSequence = this.state.nextItem.startTime
			const startTime = nextItemStartTimeInSequence - gameService.assistanceThreshold
			const stopTime = nextItemStartTimeInSequence
			
			let obj = { type: null };

			// update Gesture listening
			if (this.state.nextItem.sensorStart) {
				obj = { type: "peak" };
				peakService.waitForStart(() => {
					gameService.handlePlayNextItemButton()
					peakService.stopWaitingForStart()
					this.deactivateUserAction()
				})	
			}	
			if (this.state.nextItem.gesture_id) {					
				obj = { type: "gesture" };
				gestureService.waitForGesture(nextItem.gesture_id, () => {
					gestureService.stopWaitingForGesture()
					gameService.handlePlayNextItemButton()
					this.deactivateUserAction()
				})
			}

			this.setReactive({
				nextUserAction: {
					type: obj.type,
					startTime,
					stopTime,
					duration: stopTime - startTime
				}
			})

			// activate play button in debug mode
			this.togglePlayButton(true);
						
		}
	}

	deactivateUserAction() {
		this.togglePlayButton(false);
		gestureService.stopWaitingForGesture();
		this.setReactive({nextUserAction: {}})
	}	

	
	
	/** CONTROL INTERFACE **/

	setSequence(sequence_id) {
		const sequence = storageService.findSequence(sequence_id);

		// if sequence has changed
		if(sequence != this.state.currentSequence) {
			this.stopSequence(); 		
			this.setReactive({currentSequence: sequence});

			// preload all sounds from this sequence
			let soundfilesToLoad = [];
			sequence.items.forEach((item)=>{
				soundfilesToLoad.push(item.path);
			});
			this.setReactive({controlStatus: "loading"});
			soundService.preloadSoundfiles(soundfilesToLoad, ()=>{
				console.log("finished loading sound files for this track");
				this.setReactive({
					controlStatus: "ready",
					endedFlag: false
				});
				this.updateActionInterface();
			});
		}
		
	}

	// invoked from track selector component
	trackSelect = (track)=> {
		
  	this.setReactive({currentTrack: track});

  	// if sequence is already running - just this.setupNextSequenceItem(); and quit
  	if(this.state.controlStatus == "playing") {
  		this.setupNextSequenceItem();
  		return;
  	}

  	// vvvvv from here on we assume that sequence has not started yet vvvvv

		// listen for gestures if first item in track is at beginning of sequence
		console.log("checking firstItem in track " + track.name);
		const firstItem = this.firstItemInTrack(track.name);
		console.log(firstItem);
		if(firstItem) {
			if(firstItem.startTime == 0) {				
				
				if(firstItem.gesture_id) {
					gestureService.waitForGesture(firstItem.gesture_id, () => {
						gameService.handlePlayNextItemButton()
						gestureService.stopWaitingForGesture()
					});
				}
				if(firstItem.sensorStart) {
					peakService.waitForStart(() => {
						gameService.handlePlayNextItemButton()
						peakService.stopWaitingForStart()
					})	
				}
			}
		}

		this.updateActionInterface();

  }

  // start sequence playback - localStart marks if sequence was started on this device
 	startSequence = (startTime, localStart) => {
		if(this.state.controlStatus != "ready") {
			console.log("cannot start - sequence not ready to play");
			return;
		}

		let time = startTime;
		if(!time) {
			soundService.getSyncTime();
		}

		this.setReactive({
		 	controlStatus: "playing",
		 	playbackStartedAt: time,
	    loopStartedAt: time
    });

  	console.log("started sequence at", this.state.loopStartedAt);
    this.showNotification("sequence started");
  	this.localStart = localStart;

		this.setupNextSequenceItem();
		this.doBeatUpdate();
	}

	// identifies next item and schedules for playback if autoplay is activated
	/* called from:
	- startSequence
	- trackSelect (if track is changed)
	- scheduleSoundForNextItem (wehn playback starts and after playback ends)
	- skipNextItem
	- stopCurrentSound
	- setupNextSequenceItem (if end of loop reached)

	set up next item based on:
	- check where we are in sequence
	- check which track is activated

	-> doesn't matter if called multiple times
	*/
	setupNextSequenceItem = ()=> {
			console.log("setupNextSequenceItem");

			if(!this.state.currentSequence) {
				console.log("sequence has ended, aborting");
				return;
			}

			if(!this.state.currentTrack) {
				console.log("no track found, aborting");
				return;
			}


			this.deactivateUserAction()

			// calculate total time in playback
			const currentTime = soundService.getSyncTime();
    	const currentTimeInPlayback = currentTime - this.state.playbackStartedAt;

    	console.log("currentTimeInPlayback", currentTimeInPlayback);
    	
    	// figure out what loop we are on
    	this.setReactive({loopCounter: Math.floor(currentTimeInPlayback / this.state.currentSequence.custom_duration)});

    	if(this.state.loopCounter < 0) {
    		this.setReactive({loopCounter: 0});
    	}
    	
    	console.log("loopCounter", this.state.loopCounter);

    	this.setReactive({
			  loopStartedAt: this.state.playbackStartedAt + (this.state.loopCounter * this.state.currentSequence.custom_duration)
  		});
  		console.log("new loopStartedAt", this.state.loopStartedAt);

  		// figure out what time inside the sequence we are on
    	const currentTimeInSequence = currentTime - this.state.loopStartedAt;
    	console.log("currentTimeInSequence", currentTimeInSequence);

			// get items sorted by start time
			let items = this.state.currentSequence.items;
			if(!items.length) return;
			items.sort((a,b) => (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0)); 

    	// get item with first starttime in the future and of this track
    	let nextItem = null;
    	for(let i = 0; i < items.length; i++) {
    		if(items[i].startTime > currentTimeInSequence && items[i].track == this.state.currentTrack.name) {
    			nextItem = items[i];
    			break;
    		}
    	}

    	// if we don't find an item on first pass, take the first item in next loop
    	if(!nextItem) {    		
    		if(gameService.isChallengeLooping()) {
    			console.log("looking in next loop");
					for(let i = 0; i < items.length; i++) {
		    		if(items[i].track == this.state.currentTrack.name) {
		    			nextItem = items[i];

		    			// update sequence loop info
		    			this.setReactive({loopCounter: this.state.loopCounter + 1});
		    			this.setReactive({
			  				loopStartedAt: this.state.playbackStartedAt + (this.state.loopCounter * this.state.currentSequence.custom_duration)
  						});
  						console.log("updated loopCounter", this.state.loopCounter, this.state.loopStartedAt);
  						
		    			break;
		    		}
		    	}	
				}
    	}

    	console.log("nextItem", nextItem);

    	if(nextItem) {
    		this.setReactive({
    			nextItem: nextItem
    		});
    	
    		// schedule sound for item, if necessary
				if(this.state.controlStatus == "playing" && (
								this.autoPlayNextItem() || 
								// special case where we use the play button to start sequence _and_ start first item
								(this.sequenceStartingLocally() && this.state.nextItem.startTime == 0) 
							)
					) {					
					let targetTime = this.state.loopStartedAt + this.state.nextItem.startTime;
					if(!this.state.scheduledItem) {
						this.scheduleSoundForNextItem(targetTime);
					} else {
						console.log("there is already a sound scheduled, abort scheduling");
					}
				}
				
    	} else {
    		this.stopSequence();
    	}

    	this.updateActionInterface();
	}
		
	skipNextItem() {
		console.log(this.state.nextItem);
		if(this.state.nextItem) {
			this.setupNextSequenceItem();
		}
	}

	// call sound service to schedule sound for next item, set callback to setup next item after playback
	scheduleSoundForNextItem(targetTime) {
		if (!this.state.nextItem) return
		soundService.scheduleSound(this.state.nextItem.path, targetTime, {
			onPlayStart: () => {
				this.setReactive({
					scheduledItem: null,
					currentItem: this.state.scheduledItem,
				});
				this.setupNextSequenceItem();
			},
			onPlayEnd: () => {
				this.setReactive({currentItem: null});
				this.setupNextSequenceItem();
				this.updateActionInterface();
			}
		});
		this.setReactive({
			scheduledItem: this.state.nextItem,
			nextItem: null,
		});
	}

	stopCurrentSound() {
		if(this.state.currentItem) {
			console.log(this.state.currentItem);
			soundService.stopSound(this.state.currentItem.path);
			this.setReactive({currentItem: null});
			this.setupNextSequenceItem();
			this.updateActionInterface();
		}
	}

	// stops all sounds and removes all planned items - used in preparation for track switch
	cancelItemsAndSounds() {
		this.setReactive({
	    nextItem: null,
			scheduledItem: null,
	    currentItem: null
	  });
	  soundService.stopAllSounds();
	}
	
	// stops sequence playback and sound
	stopSequence() {
			soundService.stopAllSounds();
			this.deactivateUserAction();

	    this.setReactive({
	    	controlStatus: "idle",
	    	currentSequence: null,
	    	currentTrack: null,
				nextItem: null,
				scheduledItem: null,
	    	currentItem: null,
				playbackStartedAt: null,	    	
	    	loopStartedAt: null,
				showPlayItemButton: false,
				beatsToNextItem: "",
				loopCounter: 0,
				sequenceTimeVisualizer: 0,
				endedFlag: true,
				nextUserAction: {}
	    });

	    if(this.beatTimeout) {
	    	clearTimeout(this.beatTimeout);
	    	this.beatTimeout = null
	    }
  	}

}

const sequenceService = new SequenceService();

export {sequenceService};