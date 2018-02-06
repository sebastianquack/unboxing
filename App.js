/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import Gesture from './Gesture';

// Import the react-native-sound module
import Sound from 'react-native-sound';

//import NtpClient from 'react-native-ntp-client';
var NtpClient = require('react-native-ntp-client');

// Enable playback in silence mode
Sound.setCategory('Playback');

// function to preload a soundfile
function loadSound(filename) {
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

var sounds = {};
sounds.click = loadSound("click.mp3");
sounds.piano = loadSound("mozart_piano.mp3");
sounds.violin = loadSound("mozart_violin.mp3");
sounds.cello = loadSound("mozart_cello.mp3");
console.log(Object.keys(sounds));

function playSound(soundObj) {
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

function stopSounds() {
  console.log("stopping all sounds");
  Object.keys(sounds).forEach((key)=>{
    sounds[key].stop();
  })
}

export default class App extends Component<{}> {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    this.lastTick = 0,
    this.state = {
      localTime: 0,
      syncTime: 0,
      delta: 0,
      counter: 0,
      nextSoundToStartPlaying: "",
      stats: {},
      currentServer: "192.168.178.150",
      ntpInput: ""
    };
    this.timeSettings = {
      sampling: true,
      sampleAmount: 100,
      interval: 10,
    }
    this.timeStatsData = {
      syncTimeValues: [],
      syncTimeIndex: 0,
      syncTimeLastValue: 0,
    }
    this.updateTicker = this.updateTicker.bind(this);
    this.calculateTickerStatistics = this.calculateTickerStatistics.bind(this);
    this.handleButtonPress = this.handleButtonPress.bind(this);
    this.updateNTPServer = this.updateNTPServer.bind(this);
    this.handleSyncPress = this.handleSyncPress.bind(this);
    this.getSyncTime = this.getSyncTime.bind(this);
  }

  getSyncTime() {
    return new Date().getTime() + this.state.delta;
  }

  // this is called very often - every 10ms
  updateTicker() {
    const currentTime = this.getSyncTime(); // get the synchronized time

    // do statistics
    let data = this.timeStatsData;
    data.syncTimeValues[data.syncTimeIndex] = currentTime - data.syncTimeLastValue;
    data.syncTimeIndex++;
    if (data.syncTimeIndex >= this.timeSettings.sampleAmount) {
      data.syncTimeIndex = 0;
    }
    data.syncTimeLastValue = currentTime;

    // calculate limit
    const currentTimeString = currentTime.toString();
    const currentTickTimeString = currentTimeString.substr(0, currentTimeString.length - 4) + "0000";
    const currentTick = Number.parseInt(currentTickTimeString); // this is the current time rounded down to last 10s

    if (currentTick > this.lastTick) {
      console.log("currentTime: " + currentTime);
      console.log("this.getSyncTime(): " + this.getSyncTime());

      this.lastTick = currentTick; // save currentTick to lastTick
      this.setState((props)=>{props.counter++; props.lastTickTime = currentTick; return props}) // update counter on screen
      // Play the sound with an onEnd callback
      //console.log('started playing at ' + currentTick);

      if(this.state.nextSoundToStartPlaying) {
        console.log(this.state.nextSoundToStartPlaying);

        let targetStartTime = currentTick + 200;

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

        playSound(sounds[this.state.nextSoundToStartPlaying]);

        if(this.state.nextSoundToStartPlaying != "click") {
          this.setState({nextSoundToStartPlaying: null});
        }
      } else {
        console.log("doing nothing on this tick");
      }
    }
  }

  calculateTickerStatistics() {
    const data = this.timeStatsData;
    const amount = this.timeSettings.sampleAmount;
    let sum = 0;
    for (let x of data.syncTimeValues) {
      sum += x;
    }
    const avg = sum / amount
    let varsum = 0;
    for (let x of data.syncTimeValues) {
      varsum += Math.abs(avg-x);
    }
    const varianz = varsum / amount;
    this.setState({stats: {
      avg: Math.round(avg*10)/10,
      varianz: Math.round(varianz*10)/10
    }});
  }

  componentDidMount() {
    console.log("componentDidMount");

    setInterval(this.updateTicker, this.timeSettings.interval);

    setInterval(this.calculateTickerStatistics, this.timeSettings.interval * this.timeSettings.sampleAmount);

    setInterval(()=> {
      const localTime = new Date().getTime();
      const syncTime = this.getSyncTime();
      
      this.setState({
        localTime, syncTime
      })

    }, 100);

  }

  handleEinsatz() {
    alert("Einsatz!")
  }
  
  handleSyncPress() {
    console.log("sync button pressed, calling server " + this.state.currentServer);
    
    NtpClient.getNetworkTime(this.state.currentServer, 123, (err, date)=> {
      if(err) {
          alert("error retrieving time from ntp server");
          console.log(err);
          return;
      }
 
      var tempServerTime = date.getTime();
      var tempLocalTime = (new Date()).getTime();
      this.setState({delta: tempServerTime - tempLocalTime});

      alert("Got back time from server " + this.state.ntpInput + ": " + tempServerTime);
    });
  }

  updateNTPServer() {
    console.log("updating ntp server to " + this.state.ntpInput);
    this.state.currentServer = this.state.ntpInput;
  }

  handleButtonPress(key) {
    console.log("button pressed: " + key);
    stopSounds();
    this.setState({nextSoundToStartPlaying: key});
  }

  renderButtons() {
    let buttons = Object.keys(sounds).map((key)=>
      <TouchableOpacity
        style={styles.button}
        key={"button" + key}
        onPress={()=>{this.handleButtonPress(key);}}
      ><Text>{key}</Text></TouchableOpacity>
    );
    return buttons;
  }

  render() {
    return (
      <View style={styles.container}>
        <KeepAwake />
        <Text style={styles.welcome}>
          Welcome to unboxing!
        </Text>
        <Text>localTime: {this.state.localTime}</Text>
        <Text style={{marginTop: 20}}>NTP server: {this.state.currentServer}:123</Text>
        <TextInput
          underlineColorAndroid='transparent'
          style={{width: 150, height: 40, borderColor: 'gray', borderWidth: 1}}
          value={this.state.ntpInput}
          onChangeText={(text) => this.setState({ntpInput: text})}
          onSubmitEditing={this.updateNTPServer}
        />

        <Text>syncTime: {this.state.syncTime}</Text>
        <Text>delta to localTime: {this.state.delta}</Text>
        <Text>counter: {this.state.counter} ({this.state.lastTickTime})</Text>
        <Text>Interval: {this.timeSettings.interval} ({this.state.stats.avg}±{this.state.stats.varianz/2})</Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={this.handleSyncPress}>
            <Text>Sync Time</Text>
          </TouchableOpacity>
        </View>
        <Text>Tap the next sound to play:</Text>
        <View style={styles.buttons}>{this.renderButtons()}</View>
        <Text style={{marginBottom: 20}}>next sound: {this.state.nextSoundToStartPlaying}</Text>
        <Gesture onEinsatz={this.handleEinsatz}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
  }

});
