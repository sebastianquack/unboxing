import Service from './Service';

// Import the react-native-sound module
import Sound from 'react-native-sound';

import { storageService } from './storageService';
import { gameService } from './gameService';

// Enable playback in silence mode
Sound.setCategory('Playback');

import RNFS from 'react-native-fs';
const pathPrefix = RNFS.ExternalStorageDirectoryPath + '/unboxing/files';

const clickFilename = '/misc/click.mp3';

class SoundSevice extends Service {

	constructor() {

		// reactive vars
		super("soundService", {
			delta: 0,
			volume: 1,
			speed: 0.5,
			soundCounter: 0,
      errorLog: []
		});

		// not reative

    this.sounds = [];
    /* array of objects with form
    { 
		filename: string 
		path: string 	// full system path
		status: string 	// "pending" -> "loading" -> "ready" -> "starting" -> playing"
    */
    // save the players separately at same index
    this.soundPlayers = [];

    this.volume = 0.5;
    this.speed = 1;

    this.schedulingIntervals = [];
    
    setTimeout(()=>{
	    this.preloadSoundfiles([clickFilename], ()=>{
	    	//console.warn("click loaded");
	    });	
    }, 1000);


    this.preloadSoundfiles = this.preloadSoundfiles.bind(this);
	}

  runSoundTest() {
    console.warn("starting sound service test");

    let testSounds = storageService.state.collections.files
      .map(f=>f.path)
      .filter(f=>f.endsWith(".mp3"))
      .slice(0, 20);

    console.warn(testSounds);

    this.preloadSoundfiles(testSounds, ()=>{
      console.warn(this.getSyncTime() + ": loaded callback");
      for(let i = 0; i < testSounds.length; i++) {
        this.scheduleSound(testSounds[i], this.getSyncTime(), {
          onPlayEnd: ()=>{
            //console.warn("onPlayEnd " + testSounds[i]); 
            this.scheduleSound(testSounds[i], this.getSyncTime());
          }
        });  
      }

      setTimeout(()=>{
        this.preloadSoundfiles(testSounds, ()=>{
          console.warn(this.getSyncTime() + ": loaded callback 2");
          for(let i = 0; i < testSounds.length; i++) {
            this.scheduleSound(testSounds[i], this.getSyncTime(), {
              onPlayEnd: ()=>{
                //console.warn("onPlayEnd " + testSounds[i]); 
                this.scheduleSound(testSounds[i], this.getSyncTime());
              }
            });  
          }
        }, true); 
      }, 5000);

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
	
	// utility function to find sounds with a given filename, optional: specify status 
	findSoundIndices (filename, status=null) {
    //console.warn(this.getSyncTime() + " findSoundIndices: ", filename, status);
    let indices = []
		for(let i = 0; i < this.sounds.length; i++) {
      if(filename && !status) {
        //console.warn(this.getSyncTime() + ": ", this.sounds[i].filename, filename);
        if(this.sounds[i].filename == filename) {
          indices.push(i);
        }
      }
      if(!filename && status) {
        if(this.sounds[i].status == status) {
          indices.push(i);
        }
      }
      if(filename && status) {
        if(this.sounds[i].filename == filename && this.sounds[i].status == status) {
          indices.push(i);
        }
      }
		}
		return indices;
	}
	// -> todo: give back array of indices if multiple sounds are found

	// preload an array of soundfiles, callback is called when all are ready
	preloadSoundfiles (filenames, callback, allowDuplicates=false) {
		//console.warn(this.getSyncTime() + ": preloadSoundfiles", filenames);
    if(!filenames.length) {
      //console.warn(this.getSyncTime() + ": nothing to do, cancelling");
      if(callback)
        callback();
      return;
    }
		filenames.forEach((filename)=>{
			// only load sounds we don't know about yet 
			// unless allowDuplicates specified
      let n = this.findSoundIndices(filename).length;
      //console.warn(this.getSyncTime() + " found " + n + " for " + filename + " allowDuplicates: ", allowDuplicates);
      let n_released = this.findSoundIndices(filename, "released").length;
      //console.warn(this.getSyncTime() + " found " + n_released + " released for " + filename);

      if(allowDuplicates || (n == 0) || (n > 0 && n == n_released)) { 
				this.sounds.push({
					filename: filename,
					status: "pending"
				});
        this.soundPlayers.push(null); // prepare array for sound player

        //console.warn(this.getSyncTime() + " adding new pending sound:" + filename);
        this.setReactive({soundCounter: this.state.soundCounter + 1});	
			} 
		});
		this.loadNextSoundfile(0, callback); // this iterates over all and loads what is needed
	}

	// preload a single soundfile
	preloadSoundfile(filename, callback, allowDuplicates=false) {
		this.preloadSoundfiles([filename], callback, allowDuplicates);
	}

	// preload a soundfile from this.sounds array at index
	// if successful or sound already loaded, proceeds to next sound
	// when last sound loaded, execute callback
	loadNextSoundfile = (index, callback) => {
		//console.warn(this.getSyncTime() + ": checking sound at index " + index + " " + JSON.stringify(this.sounds));

		if(index >= this.sounds.length) {
			if(typeof callback === 'function') {
        //console.warn(this.getSyncTime() + ": no more sounds to load - checking if all are loaded...");
        let allLoaded = true;
        for(let i = 0; i < this.sounds.length; i++) {
          if(this.sounds[i].status == "pending" || this.sounds[i].status == "loading") {
            allLoaded = false;
          }
        }
        if(allLoaded) {
          //console.warn(this.getSyncTime() + ": all loaded! going to callback");
          callback(index - 1);    
        } else {
          //console.warn(this.getSyncTime(), ": nope", this.sounds);
        }
			}
			return;
		}
		if(this.sounds[index].status != "pending") {
			//console.warn(this.getSyncTime() + ": sound status past pending, skip loading");
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
		//console.warn(this.getSyncTime() + ": loading sound from file " + filename);
		this.sounds[index].status = "loading";

    let loadingTimeout = setTimeout(()=>{
      console.warn("sound loading timeout " + this.sounds[index].filename);
      this.releaseSound(index);   
    }, 2000);
		try {
      //if(this.findSoundIndices(null, "playing").length == 0) {
        let newSound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            this.showNotification('aborting, failed to load sound ' + filename, error);
    		    return;
    		  }
    		  // loaded successfully
    		  //console.warn(this.getSyncTime() + ': succesfully loaded index ' + index + " " + this.sounds[index].filename + ' duration in seconds: ' + newSound.getDuration() + 'number of channels: ' + newSound.getNumberOfChannels());
    		  clearTimeout(loadingTimeout);
          this.sounds[index].status = "ready";
    		  this.soundPlayers[index] = newSound
    		  this.soundPlayers[index].setVolume(this.getReactive("volume"));	
    		  this.loadNextSoundfile(index + 1, callback);
    		});
      /*} else {
        console.warn("aborting loading, sound is currently playing");
      }*/
    } catch(e) {
      console.warn(e);
    }
	}

	// release memory for all currently loaded sound files
	unloadSoundfiles() {
		for(let i = 0; i < this.soundPlayers.length; i++) {
      if(this.soundPlayers[i]) {
        this.soundPlayers[i].stop();
        this.soundPlayers[i].release();
      }
    }
  	this.sounds = [];
    this.soundPlayers = [];
	}

	// public - check what a sound's status is - todo: update to findSoundIndices
	/*getSoundStatus(filename) {
		let index = this.findSoundIndex(filename);
		if(index > -1) {
			return this.sounds[index].status;
		} else {
			return null;
		}
	}*/

	// schedule playback of preloaded soundfile
	scheduleSound = (soundfile, targetTime, callbacks={}, startSilent=false, unload=false) => {

    // experiment - reuse playing players
    let indices = this.findSoundIndices(soundfile, "playing");
    if(indices.length) {
      console.warn("reusing player " + indices[0]);
    }
    
		// find sound index of a ready version for this sound
    if(indices.length == 0)
		  indices = this.findSoundIndices(soundfile, "ready");
    
		if(indices.length == 0) {
		  //console.warn(this.getSyncTime() + ": no ready sound found for " + soundfile + " - attempting to load");
      this.preloadSoundfile(soundfile, ()=>{
        //console.warn("finished loading sound, going to scheduling...")
        this.scheduleSound(soundfile, targetTime, callbacks, startSilent);
      }, false); // don't allow duplicates     
			return;
		}
		
    //console.warn(this.getSyncTime() + ": indices found " + indices);
    //console.warn(this.getSyncTime() + ": scheduling sound " + indices[0] + " " + soundfile + " for " + targetTime);  
    const timeToRunStartingLoop = targetTime - this.getSyncTime();

    this.schedulingIntervals.push(setTimeout(()=>{
			this.runStartingLoop(indices[0], targetTime, callbacks, startSilent, unload);
    }, timeToRunStartingLoop - 50)); // set timeout to a bit less to allow for loop
  }

  // run loop for preloaded, scheduled sound at index to playback precisely at target time
  runStartingLoop = (index, targetTime, callbacks, startSilent=false) => {
		const loopStartTime = this.getSyncTime(); // get the synchronized time
		this.sounds[index].status = "starting";
		let targetSoundStartTime = targetTime + 50; // aim for a bit later to allow for loop to be precise
		let counter = 0;
		let now = null;
		let loopCutoff = 5000;
		do {
			now = this.getSyncTime();
			if(counter == 0) {
  				//console.warn("went into loop at " + now);
			}
			counter++;
		} while(now < targetSoundStartTime && (now - loopStartTime < loopCutoff));
		//console.warn("left loop after " + counter + " cycles at " + now);
		
		if(now - loopStartTime >= loopCutoff) {
			console.log("aborting playback - loop cutoff exceeded");
		} else {
			this.playSound(index, callbacks, startSilent);	
		}
	}

  // finally, initiate playback of sound and call callback on comepletion
	playSound = (index, callbacks, startSilent=false) => {
		if(!this.sounds[index]) return;

		// check if sound is ready to play? maybe not necessary
		if(!this.sounds[index].status == "ready") {
			console.log("sound obj not ready to play - trying anyway...")
		}

    console.warn(this.getSyncTime() + ": starting to play " + index + " " + this.sounds[index].filename + " " + startSilent);
		this.sounds[index].status = "playing";
    
		this.soundPlayers[index].setCurrentTime(0).setVolume(startSilent ? 0.0 : 0.3).play((success) => {

        if(gameService.isChallengeLooping()) {
          console.warn("reset sound index " + index);
          this.sounds[index].status = "ready";
          console.warn(JSON.stringify(this.sounds));
        }

        if (success) {
		    	console.warn('successfully finished playing ' + index + ' at ', this.getSyncTime());
          
          // calling callback
          if(typeof callbacks.onPlayEnd == "function") {
            callbacks.onPlayEnd();
          }

        } else {
		    	console.warn(this.getSyncTime() + ': playback error ' + index);		    	
          let errorLog = this.state.errorLog;
          errorLog.push({time: this.getSyncTime(), error: "playback error"});
		  	}

        if(this.sounds[index].filename != clickFilename)
          this.releaseSound(index);

		});
		this.soundPlayers[index].getCurrentTime((seconds) => {
			console.log('getCurrentTime ' + seconds)
			this.soundPlayers[index].setSpeed(1);
		});

    if(typeof callbacks.onPlayStart == "function") {
    	console.log("onPlayStart callback");
      callbacks.onPlayStart(index);
    }
    		
	}

	// public - stops playback of all sounds
	stopAllSounds() {
		console.log("stopping all sounds");
    for(let i = 0; i < this.sounds.length; i++) {
			this.stopSound(i);
    }
		this.schedulingIntervals.forEach((interval)=> {
			clearInterval(interval);
		});
		this.schedulingIntervals = [];
	}

	// public - stops playback of a single sound and removes callback
	stopSound(index) {
		//console.warn("stopping sound at index " + index);
    if(!this.sounds[index]) {
      console.warn("sound at " + index + " not found, aborting");
      return;
    }
    if(this.sounds[index].status == "playing") {
			if(this.soundPlayers[index]) {
        this.soundPlayers[index].stop(); // this weirdly tries to playback sound again
        this.soundPlayers[index].setVolume(0.0); // fix to prevent restart
        this.sounds[index].status = "ready";
			}
			this.sounds[index].onPlayEnd = undefined;
			this.sounds[index].onPlayStart = undefined;
			this.releaseSound(index);
		}
	}

  releaseSound = (index) => {
    if(gameService.isChallengeLooping()) return;

    console.warn(this.getSyncTime() + ": releasing soundObj " + index);
    this.sounds[index].status = "released";
    if(this.soundPlayers[index]) {
      this.soundPlayers[index].release();      
    }
    let soundCounter = 0;
    for(let i = 0; i < this.sounds.length; i++) {
      if(this.sounds[i].status != "released") {
        soundCounter++;
      }
    }
    this.setReactive({soundCounter: soundCounter});
  }

	setVolumeFor(filename, v, onlyWhilePlaying=false) {
		let indices = this.findSoundIndices(filename);
		indices.forEach((index)=>{
			if( (this.soundPlayers[index] && !onlyWhilePlaying)
          || (this.soundPlayers[index] && onlyWhilePlaying && this.sounds[index].status == "playing")) {
				this.soundPlayers[index].setVolume(v);
			}
		});
	}

	setSpeedFor(filename, s) {
		let indices = this.findSoundIndices(filename);
		indices.forEach((index)=>{
			if(this.soundPlayers[index]) {
				if(this.sounds[index].status == "playing" && this.soundPlayers[index].isPlaying()) {
					this.soundPlayers[index].setSpeed(s);
				}
			}
		});
	}

	setVolume(v) {
		if(typeof(v) == "number") {
		  if(v != this.getReactive("volume")) {
        for(let i = 0; i < this.sounds.length; i++) {
          if(this.soundPlayers[i]) {
            this.soundPlayers[i].setVolume(v);  
          }
        }
		    //console.log("setting reactive volume to " + v);          
		    this.setReactive({volume: v});
		  }
		}
	}

	setSpeed(s) {
		if(typeof(s) == "number") {
		  if(s != this.getReactive("speed")) {
		  	for(let i = 0; i < this.sounds.length; i++) {
          if(this.sounds[i].status == "playing") {
            this.soundPlayers[i].setSpeed(s);      
          }
        }
		    this.setReactive({speed: s});
		  }
		}
	}	

	click = (targetTime, callbacks={}) => {
		if(!targetTime) {
			targetTime = this.getSyncTime();
		}
    this.scheduleSound(clickFilename, targetTime, callbacks);
  }
}

const soundService = new SoundSevice();

export {soundService};