import Service from './Service';

// Import the react-native-sound module
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

const clickFilename = '/misc/click.mp3';

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
		status: string 	// "pending" -> "loading" -> "ready" -> "starting" -> playing"
		soundObj: obj
    */

    this.volume = 0.5;
    this.speed = 1;

    this.schedulingIntervals = [];
    
    this.preloadSoundfiles([clickFilename], ()=>{
    	console.log("click loaded");
    });
	}

	// delta and sync time
	getSyncTime() {
		return new Date().getTime() - this.getDelta();
	}

	getDelta() {
		return this.getReactive("delta");
	}

	setDelta(d) {
		this.setReactive({delta: d});
	}

	modifyDelta(d) {
		this.setDelta(this.getDelta() + d);
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

    console.log(this.getSyncTime() + ": scheduled sound " + soundfile + " for " + targetTime);  

    const timeToRunStartingLoop = targetTime - this.getSyncTime();

    this.schedulingIntervals.push(setTimeout(()=>{
			this.runStartingLoop(index, targetTime, callbacks);
    }, timeToRunStartingLoop - 34)); // set timeout to a bit less to allow for loop
  }

  // run loop for preloaded, scheduled sound at index to playback precisely at target time
  runStartingLoop(index, targetTime, callbacks) {
		const loopStartTime = this.getSyncTime(); // get the synchronized time
		this.sounds[index].status = "starting";
		let targetSoundStartTime = targetTime + 34; // aim for a bit later to allow for loop to be precise
		let counter = 0;
		let now = null;
		let loopCutoff = 5000;
		do {
			now = this.getSyncTime();
			if(counter == 0) {
  				console.log("went into loop at " + now);
			}
			counter++;
		} while(now < targetSoundStartTime && (now - loopStartTime < loopCutoff));
		console.log("left loop after " + counter + " cycles at " + now);
		
		if(now - loopStartTime >= loopCutoff) {
			console.log("aborting playback - loop cutoff exceeded");
		} else {
			this.playSound(index, callbacks);	
		}
	}

  // finally, initiate playback of sound and call callback on comepletion
	playSound(index, callbacks) {
		if(!this.sounds[index]) return;

		// check if sound is ready to play? maybe not necessary
		if(!this.sounds[index].status == "ready") {
			console.log("sound obj not ready to play - trying anyway...")
		}

		console.log("starting to play " + JSON.stringify(this.sounds[index]));
		this.sounds[index].status = "playing";
		this.sounds[index].soundObj.play((success) => {
		  	this.sounds[index].status = "ready";
		  	if (success) {
		    	console.log('successfully finished playing at', this.getSyncTime());
		    	// todo: reset sound for next playback?
		  	} else {
		    	console.log('playback failed due to audio decoding errors');
		    	this.showNotification('playback error - resetting player - restart app?');
		    	//this.sounds[index].soundObj.reset();
		  	}		  
		  	// calling callback
	    	if(typeof callbacks.onPlayEnd == "function") {
	    		callbacks.onPlayEnd();
	    	}
		});
    
		this.setVolumeFor(this.sounds[index].filename, 1);
		this.setSpeedFor(this.sounds[index].filename, 1);
		
    if(typeof callbacks.onPlayStart == "function") {
    	console.log("onPlayStart callback");
      callbacks.onPlayStart();
    }
    		
	}

	// public - stops playback of all sounds
	stopAllSounds() {
		console.log("stopping all sounds");
		this.sounds.forEach((sound)=>{
			this.stopSound(sound.filename);
		});
		this.schedulingIntervals.forEach((interval)=> {
			clearInterval(interval);
		});
		this.schedulingIntervals = [];
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

	setVolumeFor(filename, v) {
		let index = this.findLoadedSoundIndex(filename);
		if(index > -1) {
			if(this.sounds[index].soundObj) {
				this.sounds[index].soundObj.setVolume(v);
			}
		}
	}

	setSpeedFor(filename, s) {
		let index = this.findLoadedSoundIndex(filename);
		if(index > -1) {
			if(this.sounds[index].soundObj) {
				if(this.sounds[index] == "playing") {
					this.sounds[index].soundObj.setSpeed(s);
				}
			}
		}
	}

	setVolume(v) {
		if(typeof(v) == "number") {
		  if(v != this.getReactive("volume")) {
		  	this.sounds.forEach((sound)=>{
					if(sound) {
		  			sound.soundObj.setVolume(v);	
		  		}
				});
		    console.log("setting reactive volume to" + v);          
		    this.setReactive({volume: v});
		  }
		}
	}

	setSpeed(s) {
		if(typeof(s) == "number") {
		  if(s != this.getReactive("speed")) {
		  	this.sounds.forEach((sound)=>{
			  	if(sound.status == "playing") {
			  		sound.soundObj.setSpeed(s);    	
			  	}
			  });
		    this.setReactive({speed: s});
		  }
		}
	}	

	click = (targetTime) => {
		if(!targetTime) {
			targetTime = this.getSyncTime();
		}
    this.scheduleSound(clickFilename, targetTime);
  }
}

const soundService = new SoundSevice();

export {soundService};