import Service from './Service';

import {soundService} from '../services/soundService';

class SequenceService extends Service {

	constructor() {

		// reactive vars - used in interface component
		super("sequence", {
			controlStatus: "idle", // idle -> loading -> ready -> playing
			currentSequence: null, // sequence object
      		currentTrack: null, // track object
			startedAt: null, // start time of current sequence
			nextItem: null, // next item to play, if available
			currentItem: null, // current item playing, if available
			autoPlayItems: true, // automatically play all items after sequence was started
		});

		// not reative - used for internal calculations
		this.sequenceCursor = 0; // runs through the items in the sequence during playback
	}

	// invoked from track selector component - sets up new sequence
	trackSelect(sequence, track) {
		this.stopSequence();
    	this.setStateReactive({
	      currentSequence: sequence,
	      currentTrack: track,
    	});

    	console.log("track selected, analysing sequence");
    	//console.log(sequence);

		// preload all sounds from this track in sequence
		let soundfilesToLoad = [];
		sequence.items.forEach((item)=>{
			if(item.track == track.name) {
				soundfilesToLoad.push(item.path);
			}
		});
		this.setReactive("controlStatus", "loading");
		soundService.preloadSoundfiles(soundfilesToLoad, ()=>{
			console.log("finished loading sound files for this track");
			this.setReactive("controlStatus", "ready");
		});
  	}

  	// start sequence playback
	startSequence() {
		if(this.state.controlStatus != "ready") {
			console.log("cannot start - sequence not ready to play");
			return;
		}

		this.setStateReactive({
		  controlStatus: "playing",
	      startedAt: soundService.getSyncTime()
    	});

		this.setupNextSequenceItem();
	}

	// identifies next item and schedules for playback if autoplay is activated
	setupNextSequenceItem() {
	    console.log("setting up next sequence item");
	    
	    let items = this.state.currentSequence.items;
	    if(!items.length) {
	      return;
	    }

	    // go through sequence to finde the next item
	    let nextItemIndex = this.sequenceCursor;
	    let nextItem = null;
	    
	    while(!nextItem && nextItemIndex < items.length) { 
	      if(items[nextItemIndex].track == this.state.currentTrack.name) {
	        nextItem = items[nextItemIndex];  
	      }
	      nextItemIndex++;
	    } 

	    if(nextItem) {
	    	this.setReactive("nextItem", nextItem); // show next item to interface
	    	
	     	// schedule sound for item
			if(this.state.controlStatus == "playing" && this.state.autoPlayItems) {
				console.log("scheduling next track item in sequence");
				console.log(this.state.nextItem);
				console.log(this.state.targetTime);
				let targetTime = this.state.startedAt + this.state.nextItem.startTime;
				this.scheduleSoundForNextItem(targetTime);
			}

			this.sequenceCursor = nextItemIndex; // save index for later
	    } else {
			console.log("no next item found");
			this.sequenceCursor = 0;
			this.setReactive("nextItem", null);
	    }
	}
	
	// manually start playback of next item if autoplay is deactivated
	playNextItem() {
		if(!this.state.autoPlayItems) {
			this.scheduleSoundForNextItem(soundService.getSyncTime()); 	
		} else {
			console.log("manual playback deactivated when item autoplay is on");
		}
	}

	// call sound service to schedule sound for next item, set callback to setup next item after playback
	// needs to wait because currently soundService can only save one targetTime per sound
	// also useful if we want to be able to turn autoplay on and off
	scheduleSoundForNextItem(targetTime) {
		soundService.scheduleSound(this.state.nextItem.path, targetTime, {
			onPlayStart: () => {
				this.setReactive("currentItem", this.state.nextItem);
				this.setReactive("nextItem", null);
			},
			onPlayEnd: () => {
				this.setReactive("currentItem", null);
				this.setupNextSequenceItem();
			}
		});
	}
	
	// stops sequence playback and sound
	stopSequence() {
	    soundService.stopAllSounds();
	    this.setReactive("controlStatus", "ready");
	    this.setReactive("currentItem", null);
	    this.setReactive("nextItem", null);
	    this.setReactive("startedAt", null);
	    this.sequenceCursor = 0;
  	}

	setAutoPlayItems(value) {
		this.setReactive("autoPlayItems", value);
	}

}

const sequenceService = new SequenceService();

export {sequenceService};