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
  Button
} from 'react-native';

import clockSync from 'react-native-clock-sync';

// Import the react-native-sound module
import Sound from 'react-native-sound';

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

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {

  constructor(props) {
    super(props);
    this.clock = new clockSync({
      "syncDelay" : 10,
      "history": 10,
      //"servers" : [{"server": "pool.ntp.org", "port": 123}],
      "servers" : [{"server": "192.168.178.150", "port": 123}]
    });
    this.lastTick = 0,
    this.state = {
      localTime: 0,
      syncTime: 0,
      drift: 0,
      counter: 0,
      nextSoundToStartPlaying: "",
      stats: {},
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
    this.loop = this.loop.bind(this);
    this.handleButtonPress = this.handleButtonPress.bind(this);
  }

  // this is called very often - every 10ms
  updateTicker() {
    const currentTime = this.clock.getTime(); // get the synchronized time

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
      this.lastTick = currentTick; // save currentTick to lastTick
      this.setState((props)=>{props.counter++; props.lastTickTime = currentTick; return props}) // update counter on screen
      // Play the sound with an onEnd callback
      //console.log('started playing at ' + currentTick);

      if(this.state.nextSoundToStartPlaying) {
        console.log(this.state.nextSoundToStartPlaying);
        playSound(sounds[this.state.nextSoundToStartPlaying]);
        this.setState({nextSoundToStartPlaying: null});
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

  loop(func,interval) {
    setTimeout(()=>{this.loop(func,interval)}, interval)
    func();
  }

  componentDidMount() {
    console.log("componentDidMount");

    setInterval(this.updateTicker, this.timeSettings.interval);
    //this.loop(this.updateTicker, this.timeSettings.interval)

    setInterval(this.calculateTickerStatistics, this.timeSettings.interval * this.timeSettings.sampleAmount);

    setInterval(()=> {
      const localTime = new Date().getTime();
      const syncTime = this.clock.getTime();
      const drift = parseInt(localTime) - parseInt(syncTime);
      //console.log('SyncTime:' + syncTime + ' vs LocalTime: ' + localTime + ' Difference: ' + drift + 'ms');

      this.setState({
        localTime, syncTime, drift
      })

    }, 100);

  }

  handleButtonPress(key) {
    console.log("button pressed: " + key);
    stopSounds();
    this.setState({nextSoundToStartPlaying: key});
  }

  renderButtons() {
    let buttons = Object.keys(sounds).map((key)=>
      <Button
        style={styles.button}
        key={"button" + key}
        title={key}
        onPress={()=>{this.handleButtonPress(key);}}
      />
    );
    return buttons;
  }

  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text>localTime: {this.state.localTime}</Text>
        <Text>syncTime: {this.state.syncTime}</Text>
        <Text>drift: {this.state.drift}</Text>
        <Text>counter: {this.state.counter} ({this.state.lastTickTime})</Text>
        <Text>Interval: {this.timeSettings.interval} ({this.state.stats.avg}±{this.state.stats.varianz/2})</Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        {this.renderButtons()}
        <Text>next sound: {this.state.nextSoundToStartPlaying}</Text>
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
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    margin: 10,
  }

});
