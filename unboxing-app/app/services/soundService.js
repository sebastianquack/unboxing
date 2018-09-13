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
			testClick: false,
			volume: 1,
			speed: 0.5
		});

		// not reative
		this.sound = null;
	    this.isPlaying = false;
	    this.filename = null;
	    this.playScheduled = false;
	    this.nextSoundTargetTime = null;
	    this.volume = 0.5;
	    this.speed = 1;
	    this.afterPlaybackCallback = null;
	    
		this.tickerInterval = null;
	    this.tickerIntervalTime = 10;
	}

	// delta and sync time
	setDelta(d) {
		this.setReactive("delta", d);
	}

	getDelta() {
		return this.getReactive("delta");
	}

	modifyDelta(d) {
		this.setDelta(this.getDelta() + d);
	}
	
	getSyncTime() {
		return new Date().getTime() - this.getDelta();
	}

	// turn on or off test clicking
	setTestClick = (value) => {
	   	this.setReactive("testClick", value);
	   	console.log("testClick set to", this.testClick);
	}

	// playback scheduling
	startTicker() {
		this.tickerInterval = setInterval(()=>{this.updateTicker()}, this.tickerIntervalTime);	
	}

	scheduleNextSound = (targetTime, callback) => {
	    this.playScheduled = (targetTime === null ? false : true);
	    this.nextSoundTargetTime = targetTime;
	    if(callback) {
	      this.afterPlaybackCallback = callback;  
	    }
	    
	    if(this.playScheduled) {
	      console.log("scheduled sound " + this.filename + " for " + this.nextSoundTargetTime);  
	      console.log("set callback to", this.afterPlaybackCallback);
	    }
  	}

	// this is called tickerInterval times, very often, 10ms!
	updateTicker = () => {
		const currentTime = this.getSyncTime(); // get the synchronized time

		if(this.playScheduled && currentTime > this.nextSoundTargetTime) {
		  console.log("initiating playback loop");
		  let targetStartTime = this.nextSoundTargetTime + 200;

		  this.scheduleNextSound(null);
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

		  this.playSound();
		}
	}

	// preload a soundfile
	loadSound = (filename) => {
		if (!filename) {
		  console.log("no file to load!")
		  return;
		}
		if (filename.substr(0,1) == "/") {
		  filename = filename.substr(1);
		}
		filename = pathPrefix + '/' + filename;
		console.log("loading " + filename);

		this.filename = filename;
		this.sound = null;
		var newSound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
		  if (error) {
		    console.log('failed to load sound ' + filename, error);
		    return;
		  }
		  // loaded successfully
		  console.log('succesfully loaded ' + this.filename + ' duration in seconds: ' + newSound.getDuration() + 'number of channels: ' + newSound.getNumberOfChannels());
		  this.sound = newSound;
		});
	}

	playSound = () => {
		if(!this.sound) {
		  console.log("no sound selected");
		  return;
		}
		console.log("starting to play " + JSON.stringify(this.sound));
		this.isPlaying = true;
		this.sound.play((success) => {
		  if (success) {
		    console.log('successfully finished playing');
		  } else {
		    console.log('playback failed due to audio decoding errors');
		  }
		  if(this.sound) {
		    this.sound.release();  
		  }
		  this.sound = null;

		  // schedule next click or sequence item 
		  if(this.state.testClick) {
		    this.loadSound("/misc/click.mp3");
		    this.scheduleNextSound(Math.ceil(this.getSyncTime()/1000)*1000);  
		  } else {
		    console.log(this.afterPlaybackCallback);
		    if(typeof(this.afterPlaybackCallback) == "function") {
		      this.afterPlaybackCallback();
		    }
		  }
		});
	}

	stopSound = () => {
		console.log("stopping sound");
		this.isPlaying = false;
		if (this.sound) {
		  this.sound.stop();
		  this.sound.release();
		  this.sound = null;
		}
	}

	setVolume = (v) => {
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

	setSpeed = (s) => {
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