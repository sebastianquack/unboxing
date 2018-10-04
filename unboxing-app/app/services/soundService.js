import Service from './Service';

// Import the react-native-sound module
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalDirectoryPath + '/downloads';

class SoundSevice extends Service {

	constructor() {

		// reactive vars
		super("sound", {
			delta: 0,
			volume: 1,
			speed: 0.5
		});

		// not reative

	    this.sounds = [];
	    /* array of objects with form
	    { 
			filename: string 
			path: string 	// full system path
			status: string 	// "pending" -> "loading" -> "ready" -> "scheduled" -> "starting" -> playing"
			soundObj: obj
			targetTime: bool
	    	onPlayStart: function
	    	onPlayEnd: function
	    }
	    */

	    this.volume = 0.5;
	    this.speed = 1;
	    
	    this.tickerInterval = null;
	    this.tickerIntervalTime = 10;
	    this.startTicker();
	}

	// delta and sync time
	getSyncTime() {
		return new Date().getTime() - this.getDelta();
	}

	getDelta() {
		return this.getReactive("delta");
	}

	setDelta(d) {
		this.setReactive("delta", d);
	}

	modifyDelta(d) {
		this.setDelta(this.getDelta() + d);
	}
	
	// start the main ticker loop
	startTicker() {
		this.tickerInterval = setInterval(()=>{this.updateTicker()}, this.tickerIntervalTime);	
	}

	// this is called tickerInterval times, very often, 10ms!
	updateTicker() {
		const currentTime = this.getSyncTime(); // get the synchronized time
		// check if any of the sounds scheduled and should be played
		for(let i = 0; i < this.sounds.length; i++) {
			if(this.sounds[i].status == "scheduled") {
				if(currentTime >= this.sounds[i].targetTime) {
					this.runStartingLoop(i);	
				}
			}
		}
	}

	// utility function to find a sound that has already been loaded, return -1 if not found
	findLoadedSoundIndex(filename) {
		for(let i = 0; i < this.sounds.length; i++) {
			if(this.sounds[i].filename == filename) {
				return i;
			}
		}
		return -1;
	}

	// preload an array of soundfiles, callback is called when all are ready
	preloadSoundfiles(filenames, callback) {
		console.log("loading filenames");
		console.log(filenames);
		filenames.forEach((filename)=>{
			// only load sounds we don't know about yet 
			// question: are there use cases where we want to preload the same sound file multiple times?
			if(this.findLoadedSoundIndex(filename) == -1) { 
				console.log("adding pending sound");
				this.sounds.push({
					filename: filename,
					status: "pending",
					soundObj: null
				});	
			}
		});
		this.loadNextSoundfile(0, callback); // this iterates over all and loads what is needed
	}

	// preload a single soundfile
	preloadSoundfile(filename, callback) {
		this.preloadSoundfiles([filename], callback);
	}

	// preload a soundfile from this.sounds array at index
	// if successful or sound already loaded, proceeds to next sound
	// when last sound loaded, execute callback
	loadNextSoundfile(index, callback) {
		console.log("checking sound at index " + index);
		if(index >= this.sounds.length) {
			console.log("no more sounds to load, finishing...");
			if(typeof callback === 'function') {
				callback();	
			}
			return;
		}
		if(this.sounds[index].status != "pending") {
			console.log("sound status past pending, skip loading");
			this.loadNextSoundfile(index + 1, callback);
			return;	
		}
		let filename = this.sounds[index].filename;
		if(!filename) {
			console.log("no filename for sound speficied, aborting");
			return;
		}
		if (filename.substr(0,1) == "/") {
		  filename = filename.substr(1);
		}
		filename = pathPrefix + '/' + filename;
		console.log("loading sound from file " + filename);
		this.sounds[index].status = "loading";

		var newSound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
		  if (error) {
		    console.log('aborting, failed to load sound ' + filename, error);
		    return;
		  }
		  // loaded successfully
		  console.log('succesfully loaded ' + this.sounds[index].filename + ' duration in seconds: ' + newSound.getDuration() + 'number of channels: ' + newSound.getNumberOfChannels());
		  this.sounds[index].status = "ready";
		  this.sounds[index].soundObj = newSound;
		  this.sounds[index].soundObj.setVolume(this.getReactive("volume"));	
		  this.loadNextSoundfile(index + 1, callback);
		});
	}

	// release memory for all currently loaded sound files
	unloadSoundfiles() {
		this.sounds.forEach((sound)=>{
			if(sound.soundObj) {
				sound.soundObj.stop();
				sound.soundObj.release();
			}
			sound.soundObj = null;
			sound = null;
		});
  		this.sounds = [];
	}

	// public - check what a sound's status is
	getSoundStatus(filename) {
		let index = this.findLoadedSoundIndex(filename);
		if(index > -1) {
			return this.sounds[index].status;
		} else {
			return null;
		}
	}

	// schedule playback of preloaded soundfile
	scheduleSound(soundfile, targetTime, callbacks={}) {

		//find sound index
		let index = this.findLoadedSoundIndex(soundfile);
		if(index == -1) {
			console.log("aborting scheduling, soundfile not found - sound needs to be preloaded first");
			return;
		}

		this.sounds[index].status = "scheduled";
		this.sounds[index].targetTime = targetTime;
	    this.sounds[index].onPlayEnd = callbacks.onPlayEnd;
	    this.sounds[index].onPlayStart = callbacks.onPlayStart;  
	    
	    if(this.sounds[index].status == "scheduled") {
	      console.log("scheduled sound " + soundfile + " for " + targetTime);  
	    }
  	}

  	// run loop for preloaded, scheduled sound at index to playback precisely at target time + 200ms
  	runStartingLoop(index) {
		const currentTime = this.getSyncTime(); // get the synchronized time
		this.sounds[index].status = "starting";
		let targetStartTime = this.sounds[index].targetTime + 200;
		let counter = 0;
		let now = null;
		do {
			now = this.getSyncTime();
			if(counter == 0) {
  				console.log("went into loop at " + now);
			}
			counter++;
		} while(now < targetStartTime && (now - currentTime < 400));
		console.log("leaving loop after " + counter + " cycles at " + now);
		this.playSound(index);
	}

  	// finally, initiate playback of sound and call callback on comepletion
	playSound(index) {
		if(!this.sounds[index]) return;
		console.log("starting to play " + JSON.stringify(this.sounds[index]));
		this.sounds[index].status = "playing";
		this.sounds[index].soundObj.play((success) => {
		  	if (success) {
		    	console.log('successfully finished playing');
		    	// todo: reset sound for next playback?
		  	} else {
		    	console.log('playback failed due to audio decoding errors');
		  	}		  
		  	// calling callback
	    	if(typeof this.sounds[index].onPlayEnd == "function") {
	      		this.sounds[index].onPlayEnd();
	    	}
		});
	    if(typeof this.sounds[index].onPlayStart == "function") {
	    	console.log("onPlayStart callback");
	      	this.sounds[index].onPlayStart();
	    }
	}

	// public - stops playback of all sounds
	stopAllSounds() {
		console.log("stopping all sounds");
		this.sounds.forEach((sound)=>{
			this.stopSound(sound.filename);
		});
	}

	// public - stops playback of a single sound and removes callback
	stopSound(filename) {
		console.log("stopping sound", filename);
		let index = this.findLoadedSoundIndex(filename);
		if(index > -1) {
			if(this.sounds[index].soundObj) {
				this.sounds[index].soundObj.stop();
			}
			this.sounds[index].onPlayEnd = undefined;
			this.sounds[index].onPlayStart = undefined;
			this.sounds[index].status = "ready";
		} else {
			console.log("cannot stop sound, filename not found");
		}
	}

	setVolume(v) {
		if(typeof(v) == "number") {
		  if(v != this.getReactive("volume")) {
		  	if(this.sound) {
		  		this.sound.setVolume(v);	
		  	}
		    
		    console.log("setting reactive volume to" + v);          
		    this.setReactive("volume", v);
		  }
		}
	}

	setSpeed(s) {
		if(typeof(s) == "number") {
		  if(s != this.getReactive("speed")) {
		  	if(this.sound && this.isPlaying) {
		  		this.sound.setSpeed(s);    	
		  	}
		    this.setReactive("speed", s);
		  }
		}
	}	
}

const soundService = new SoundSevice();

export {soundService};