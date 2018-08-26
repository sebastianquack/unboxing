// Import the react-native-sound module
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

const pathPrefix = '/sdcard/unboxing';

export default class SoundManager {

  constructor(params) {
    this.sound = null;
    this.isPlaying = false;
    this.filename = null;
    this.delta = 0;
    this.playScheduled = false;
    this.nextSoundTargetTime = null;
    this.tickerInterval = null;
    this.volume = 0;
    this.speed = 0;
    this.testClick = false;
    this.afterPlaybackCallback = null;
    this.params = params
  }

  setDelta(d) {
    this.delta = d;
    this.params.onDeltaChange(this.delta)
  }

  getSyncTime() {
    return new Date().getTime() - this.delta;
  }

  startTicker(interval) {
    this.tickerInterval = setInterval(()=>{this.updateTicker()}, interval);
  }

  // this is called _tickerInterval times, very often, 10ms!
  updateTicker() {
    const currentTime = this.getSyncTime(); // get the synchronized time

    if(this.playScheduled && currentTime > this.nextSoundTargetTime) {
      console.log("initiating playback loop");
      let targetStartTime = this._nextSoundTargetTime + 200;

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
      
      // schedule next click or sequence item 
      if(this.testClick) {
        this.scheduleNextSound(Math.ceil(this.getSyncTime()/1000)*1000);  
      } else {
        if(typeof(this.afterPlaybackCallback) == "function") {
          this.afterPlaybackCallback();
        }
      }
    }
  }

  // turn on or off test clicking
  setTestClick(value) {
    this.testClick = value;
  }

  // preload a soundfile
  loadSound(filename) {
    if (!filename) {
      console.log("no file to load!")
      return;
    }
    if (filename.substr(0,1) == "/") {
      filename = filename.substr(1);
    }
    filename = pathPrefix + '/' + filename;
    console.log("loading " + filename);

    let s = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load sound ' + filename, error);
        return;
      }
      // loaded successfully
      console.log('succesfully loaded ' + filename + ' duration in seconds: ' + s.getDuration() + 'number of channels: ' + s.getNumberOfChannels());
    });
    this.filename = filename;
    this.sound = s;
  }

  playSound() {
    if(!this.sound) {
      console.log("no sound selected");
      return;
    }
    let soundObj = this.sound;
    console.log("starting to play " + JSON.stringify(soundObj));
    this.isPlaying = true;
    soundObj.play((success) => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
        if(soundObj.reset) {
          soundObj.reset();  
        }
      }
    });
  }

  scheduleNextSound(targetTime, callback) {
    this.playScheduled = (targetTime === null ? false : true);
    this.nextSoundTargetTime = targetTime;
    console.log("scheduled sound " + this.filename + " for " + this.nextSoundTargetTime);
    this.afterPlaybackCallback = callback;
  }

  setVolume(v) {
    if(this.sound && typeof(v) == "number") {
      this.volume = v;
      this.sound.setVolume(v);  
    }
  }

  setSpeed(s) {
    if(this.sound && this.isPlaying && typeof(s) == "number") {
      this.speed = s;
      this.sound.setSpeed(s);  
    }
  }

  stopSound() {
    console.log("stopping sound");
    this.isPlaying = false;
    if (this.sound) {
      this.sound.stop();
    }
  }

}