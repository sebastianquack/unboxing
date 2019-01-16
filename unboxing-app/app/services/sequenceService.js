import Service from './Service';

import {soundService, gameService, gestureService, peakService } from './';

class SequenceService extends Service {

	constructor() {

		// reactive vars - used in interface component
		super("sequence", {
			controlStatus: "idle", // idle -> loading -> ready -> playing
			currentSequence: null, // sequence object
      currentTrack: null, // track object
			playbackStartedAt: null, // start time of first loop of this sequence
			startedAt: null, // start time of current sequence (in each loop)
			nextItem: null, // next item to play, if available
			scheduledItem: null, // item scheduled for play
			currentItem: null, // current item playing, if available
			showPlayItemButton: false, // should play button be shown
			beatTickActive: false // should beat be played on the beat
		});

		// not reative - used for internal calculations
		this.loopCounter = 0;
		this.localStart = false;
		this.beatTimeout = null;
	}

	/* HELPER FUNCTIONS */

	getControlStatus = ()=> {
		return this.state.controlStatus;
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
		if (!this.state.nextItem) return
		const startTime = this.state.startedAt + this.state.nextItem.startTime;
		return startTime;
	}

	toggleBeatTick = ()=> {
		this.setReactive({beatTickActive: !this.state.beatTickActive});
	}

	doBeatUpdate = ()=> {
		// calculate time to next item
		const currentTime = soundService.getSyncTime();
    const currentTimeInSequence = currentTime - this.state.startedAt;

    console.log("currentTimeInSequence", currentTimeInSequence);

		// beat calculations
		const durationOfBeat = (60000 / this.state.currentSequence.bpm);
		const currentBeatInSequence = Math.floor(currentTimeInSequence / durationOfBeat);
		const timeOfThisBeat = this.state.startedAt + (currentBeatInSequence * durationOfBeat);

		// determine next startime to count down to
		let startTime = null;
    if(this.state.nextItem) {
    	startTime = this.state.nextItem.startTime;
    }
    // also countdown to scheduled items 
    if(this.state.scheduledItem) {
    	startTime = this.state.scheduledItem.startTime;
    }

    if(startTime != null) {

	    const timeToNextItem = startTime - currentTimeInSequence;	
	    
	    // calculate this in beats
			const beatsToNextItem = Math.floor(timeToNextItem / durationOfBeat) - 1;

			// update beatsToNextItem
			if(beatsToNextItem > 0) {
				this.setReactive({beatsToNextItem: beatsToNextItem});	
			} else {
				this.setReactive({beatsToNextItem: ""});	
			}
			
		}
    
    // calculate time to next update
    const timeOfNextBeat = this.state.startedAt + ((currentBeatInSequence + 1) * durationOfBeat);
    console.log("beat", currentBeatInSequence);

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
	}

	sequenceStartingLocally = ()=> {
		return this.localStart && this.loopCounter == 0;
	}

	// check if next item should be autoplayed
	autoPlayNextItem = ()=> {
		if(!this.state.nextItem) return false;

		if(this.state.nextItem.autoplay == "off") {
			return false;
		}

		if(this.state.nextItem.autoplay == "first" && this.loopCounter == 0) {
			return true;
		}

		if(this.state.nextItem.autoplay == "on") {
			return true;
		}

		// we shouldn't reach this point, don't play anything
		return false;
	}

	// updates if play button should be shown in interface
	updatePlayButton = ()=> {
		this.setReactive({
	    	showPlayItemButton: (this.state.controlStatus == "playing" && this.state.nextItem && !this.autoPlayNextItem())
		}); 
	}

	/* CONTROL INTERFACE */

	// invoked from track selector component - sets up new sequence
	trackSelect = (sequence, track)=> {
		
		if(this.state.controlStatus == "loading") {
			this.showNotification("track switch during loading not possible");
			return;
		}

		if(sequence != this.state.currentSequence) {
			this.stopSequence(); 
		}
		
  	this.setReactive({currentTrack: track});

  	// if sequence is already running - just this.setupNextSequenceItem(); and quit
  	if(this.state.controlStatus == "playing") {
  		this.setupNextSequenceItem();
  		return;
  	}

  	// vvvvv from here on we assume that sequence has not started yet vvvvv

		// if sequence has changed
		if(sequence != this.state.currentSequence) {
		
			this.setReactive({currentSequence: sequence});

			// preload all sounds from this track in sequence 
			let soundfilesToLoad = [];
			sequence.items.forEach((item)=>{
				soundfilesToLoad.push(item.path);
			});
			this.setReactive({controlStatus: "loading"});
			soundService.preloadSoundfiles(soundfilesToLoad, ()=>{
				console.log("finished loading sound files for this track");
				this.setReactive({
					controlStatus: "ready",
					showPlayItemButton: false
				});
			});
		}
		
		// listen for gestures if first item in track is at beginning of sequence
		console.log("checking firstItem in track " + track.name);
		const firstItem = this.firstItemInTrack(track.name);
		console.log(firstItem);
		if(firstItem) {
			if(firstItem.startTime == 0) {				
				this.setReactive({
					showPlayItemButton: true,
					nextActionMessage: "your part is right at the beginning of this sequence. perform the start gesture to start the sequence for everyone here!"
				});

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
			} else {
				this.setReactive({
					showPlayItemButton: false,
					nextActionMessage: "you don't have anything to play at the beginning of this sequence. wait for another player to start the sequence, then join at the right moment!"
				});	
			}
		} else {
			this.setReactive({
				nextActionMessage: "your instrument has nothing to do in this sequence. listen or choose a different one!"
			});
		}

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
	    startedAt: time
    });

  	console.log("started sequence at", this.state.startedAt);
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

			gestureService.stopWaitingForGesture();

			// calculate total time in playback
			const currentTime = soundService.getSyncTime();
    	const currentTimeInPlayback = currentTime - this.state.playbackStartedAt;

    	console.log("currentTimeInPlayback", currentTimeInPlayback);
    	
    	// figure out what loop we are on
    	this.loopCounter = Math.floor(currentTimeInPlayback / this.state.currentSequence.custom_duration);

    	if(this.loopCounter < 0) {
    		this.loopCounter = 0;
    	}
    	
    	console.log("loopCounter", this.loopCounter);

    	this.setReactive({
			  startedAt: this.state.playbackStartedAt + (this.loopCounter * this.state.currentSequence.custom_duration)
  		});
  		console.log("new startedAt", this.state.startedAt);

  		// figure out what time inside the sequence we are on
    	const currentTimeInSequence = currentTime - this.state.startedAt;
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
		    			this.loopCounter++;
		    			this.setReactive({
			  				startedAt: this.state.playbackStartedAt + (this.loopCounter * this.state.currentSequence.custom_duration)
  						});
  	
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
					let targetTime = this.state.startedAt + this.state.nextItem.startTime;
					if(this.state.scheduledItem != nextItem) {
						this.scheduleSoundForNextItem(targetTime);	
					}
				}
				
				this.updatePlayButton();

				// update Gesture listening
				
				if (nextItem.sensorStart) {
					this.setReactive({nextActionMessage: "get ready to do the start gesture to start playing at the right moment!"});
					peakService.waitForStart(() => {
						gameService.handlePlayNextItemButton()
						peakService.stopWaitingForStart()
					})	
				}				
				if (nextItem.gesture_id) {					
					gestureService.waitForGesture(nextItem.gesture_id, () => {
						gestureService.stopWaitingForGesture()
						gameService.handlePlayNextItemButton()
					})
				}
    	
    	} else {
    		this.stopSequence();
				this.setReactive({nextActionMessage: "sequence ended"});
    	}
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
			}
		});
		this.setReactive({
			scheduledItem: this.state.nextItem,
			nextItem: null,
		});
		this.updatePlayButton();
	}

	stopCurrentSound() {
		console.log(this.state.currentItem);
		soundService.stopSound(this.state.currentItem.path);
		this.setReactive({currentItem: null, scheduledItem: null});
		this.setupNextSequenceItem();
	}
	
	// stops sequence playback and sound
	stopSequence() {
			soundService.stopAllSounds();
			gestureService.stopWaitingForGesture();
	    this.setReactive({
	    	controlStatus: "idle",
	    	currentSequence: null,
	    	currentTrack: null,
				nextItem: null,
				scheduledItem: null,
	    	currentItem: null,
				playbackStartedAt: null,	    	
	    	startedAt: null,
				showPlayItemButton: false,
				beatsToNextItem: ""

	    });
	    this.loopCounter = 0;
	    if(this.beatTimeout) {
	    	clearTimeout(this.beatTimeout);
	    	this.beatTimeout = null
	    }
  	}

}

const sequenceService = new SequenceService();

export {sequenceService};