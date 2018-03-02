// Import the react-native-sound module
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

export default class SoundManager {

  constructor() {
    this.sounds = {};
    this.sounds.click = this.loadSound("click.mp3");
    this.sounds.piano = this.loadSound("mozart_piano.mp3");
    this.sounds.violin = this.loadSound("mozart_violin.mp3");
    this.sounds.cello = this.loadSound("mozart_cello.mp3");
    console.log(Object.keys(this.sounds));

    this._nextSoundToStartPlaying = null;
    this._nextSoundTargetTime = null;
  }

  // preload a soundfile
  loadSound(filename) {
    console.log("loading " + filename);
    let s = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load sound ' + filename, error);
        return;
      }
      // loaded successfully
      console.log('succesfully loaded ' + filename + ' duration in seconds: ' + s.getDuration() + 'number of channels: ' + s.getNumberOfChannels());
    });
    return s;
  }

  getKeys() {
    let keys = Object.keys(this.sounds);
    return keys;  
  }

  playSound(key) {
    let soundObj = this.sounds[key];
    console.log("starting to play " + JSON.stringify(soundObj));
    soundObj.play((success) => {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
        soundObj.reset();
      }
    });
  }

  scheduleNextSound(sound, targetTime) {
    this._nextSoundToStartPlaying = sound;
    this._nextSoundTargetTime = targetTime;
    console.log("scheduled sound " + this._nextSoundToStartPlaying + " for " + this._nextSoundTargetTime);
  }

  get nextSoundToStartPlaying() {
    return this._nextSoundToStartPlaying;
  }

  get nextSoundTargetTime() {
    return this._nextSoundTargetTime;
  }

  stopSounds() {
    console.log("stopping all sounds");
    Object.keys(this.sounds).forEach((key)=>{
      this.sounds[key].stop();
    })
  }

}