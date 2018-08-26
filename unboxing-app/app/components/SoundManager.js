import React, { Component } from 'react';
import {
  View,
} from 'react-native';

import TimeSync from './TimeSync';
import Sequencer from './Sequencer';
import SensorControls from './SensorControls';
import {globalStyles} from '../../config/globalStyles';

// Import the react-native-sound module
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

const pathPrefix = '/sdcard/unboxing';

export default class SoundManager extends React.Component {

  constructor(props) {
    super(props);
    
    this.sound = null;
    this.isPlaying = false;
    this.filename = null;
    this.playScheduled = false;
    this.nextSoundTargetTime = null;
    this.tickerInterval = null;
    this.volume = this.props.volume;
    this.speed = this.props.speed;
    this.afterPlaybackCallback = null;

    this.timeSettings = {
      tickerInterval: 10,
    };

    this.state = {
      delta: 0,
      testClick: false,
    }
  }

  componentDidMount() {
    this.tickerInterval = setInterval(()=>{this.updateTicker()}, this.timeSettings.tickerInterval);
  }

  getSyncTime = () => {
    return new Date().getTime() - this.state.delta;
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

  // turn on or off test clicking
  setTestClick = (value) => {
    this.testClick = value;
    console.log("testClick set to", this.testClick);
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

  setVolume = (v) => {
    if(this.sound && typeof(v) == "number") {
      if(v != this.volume) {
        this.volume = v;
        this.sound.setVolume(v);          
      }
    }
  }

  setSpeed = (s) => {
    if(this.sound && this.isPlaying && typeof(s) == "number") {
      if(s != this.speed) {
        this.speed = s;
        this.sound.setSpeed(s);    
      }
    }
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

  render() {
    return( 
      <View>
        <TimeSync
          delta={this.state.delta}
          setDelta={v=>{this.setState({delta: v})}}
          getSyncTime={this.getSyncTime}
          testClick={this.state.testClick}
          setTestClick={v=>{this.setState({testClick: v})}}
          loadSound={this.loadSound}
          scheduleNextSound={this.scheduleNextSound}
        />
        <SensorControls
          setVolume={this.setVolume}
          setSpeed={this.setSpeed}
        />
        <Sequencer
          loadSound={this.loadSound}
          scheduleNextSound={this.scheduleNextSound}
          getSyncTime={this.getSyncTime}
          playScheduled={this.playScheduled}
          stopSound={this.stopSound}
        />
      </View>
    );
  }

}