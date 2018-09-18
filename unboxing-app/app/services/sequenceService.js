import Service from './Service';

import {soundService} from '../services/soundService';

class SequenceService extends Service {

	constructor() {

		// reactive vars - used in interface component
		super("sequence", {
			playing: false, // playback status
			currentSequence: null, // sequence object
      		currentTrack: null, // track object
			startedAt: null, // start time of current sequence
			nextItem: null, // next item to play, if available
			autoPlayItems: true, // automatically play all items after sequence was started
		});

		// not reative - used for internal calculations
		this.nextItemIndex = -1;
	}

	// invoked from track selector component - sets up new sequence
	trackSelect(sequence, track) {
		this.stopSequence();
    	this.setStateReactive({
	      currentSequence: sequence,
	      currentTrack: track,
    	});
  	}

  	// start sequence playback
	startSequence() {
		if(this.state.currentSequencePlaying) {
			console.log("cannot start - sequence already playing");
			return;
		}

		if(!this.state.currentSequence || !this.state.currentTrack) {
			console.log("no sequence or track selected");
			return;
		}

		this.setStateReactive({
	      playing: true,
	      startedAt: soundService.getSyncTime()
    	});

		this.setupNextSequenceItem();
	}

	setupNextSequenceItem() {
	    console.log("setting up next sequence item");
	    console.log(this.state);

	    let items = this.state.currentSequence.items;
	    if(!items.length) {
	      return;
	    }

	    let newIndex = this.nextItemIndex + 1; // initialized with -1
	    let newItem = null;
	    let newItemTrack = null;

	    while(!newItem && newIndex < items.length) { 
	      console.log("newIndex: " + newIndex);
	      if(items[newIndex].track == this.state.currentTrack.name) {
	        newItem = items[newIndex];  
	        newItemTrack = items[newIndex].track  
	      }
	      newIndex++;
	    } 

	    if(newItem) {
	    	this.nextItemIndex = newIndex - 1;
	     	this.setReactive("nextItem", newItem);

	     	// preload sound file
			soundService.loadSound(newItem.path);
			
			// schedule sound for next item
			if(this.state.playing && this.state.autoPlayItems) {
				let targetTime = this.state.startedAt + this.state.nextItem.startTime;
				this.scheduleNextSound(targetTime);
			}
			
	    } else {
			console.log("no next item found");
			this.nextItemIndex = -1;
			this.setReactive("nextItem", null);
	    }
	}
	
	// call sound service with callback 
	scheduleNextSound(targetTime) {
		soundService.scheduleNextSound(targetTime, () => {this.setupNextSequenceItem();});
	}

	// manually start playback of next sound now
	playNextItem() {
		if(!this.state.autoPlayItems) {
			this.scheduleNextSound(soundService.getSyncTime()); 	
		} else {
			console.log("manual playback deactivated when item autoplay is on");
		}
	}

	// stops sequence playback and sound
	stopSequence() {
	    soundService.stopSound();
	    this.setReactive("playing", false);
	    this.setReactive("nextItem", false);
	    this.nextItemIndex = -1;
  	}

	setAutoPlayItems(value) {
		this.setReactive("autoPlayItems", value);
	}

}

const sequenceService = new SequenceService();

export {sequenceService};