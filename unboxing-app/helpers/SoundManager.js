// Import the react-native-sound module
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

const pathPrefix = '/sdcard/unboxing';

export default class SoundManager {

  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.filename = null;
    this._playScheduled = null;
    this._nextSoundTargetTime = null;
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

  setVolume(v) {
    if(this.sound && typeof(v) == "number") {
      this.sound.setVolume(v);  
    }
  }

  setSpeed(s) {
    if(this.sound && this.isPlaying && typeof(s) == "number") {
      this.sound.setSpeed(s);  
    }
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

  scheduleNextSound(targetTime) {
    this._playScheduled = (targetTime === null ? false : true);
    this._nextSoundTargetTime = targetTime;
    console.log("scheduled sound " + this.filename + " for " + this._nextSoundTargetTime);
  }

  get playScheduled() {
    return this._playScheduled;
  }

  get nextSoundTargetTime() {
    return this._nextSoundTargetTime;
  }

  stopSound() {
    console.log("stopping sound");
    this.isPlaying = false;
    if (this.sound) {
      this.sound.stop();
    }
  }

}