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
  View
} from 'react-native';

import clockSync from 'react-native-clock-sync'

// Import the react-native-sound module
import Sound from 'react-native-sound';

console.log("loading sound file...");
// Load the sound file 'sound1.mp3' from the app bundle
// See notes below about preloading sounds within initialization code below.
var sound1 = new Sound('click.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  console.log('duration in seconds: ' + sound1.getDuration() + 'number of channels: ' + sound1.getNumberOfChannels());
});

// Enable playback in silence mode
Sound.setCategory('Playback');

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
      "servers" : [{"server": "pool.ntp.org", "port": 123}],
      //"servers" : [{"server": "192.168.1.176", "port": 123}]
    });
    this.lastTick = 0,
    this.state = {
      localTime: 0,
      syncTime: 0,
      drift: 0,
      counter: 0,
    };
    this.updateTicker = this.updateTicker.bind(this)
  }

  // this is called very often - every 10ms
  updateTicker() {
    const currentTime = this.clock.getTime(); // get the synchronized time
    
    const currentTimeString = currentTime.toString();
    const currentTickTimeString = currentTimeString.substr(0, currentTimeString.length - 3) + "000";
    const currentTick = Number.parseInt(currentTickTimeString); // this is the current time rounded down to last 10s
    
    if (currentTick > this.lastTick) {
      this.lastTick = currentTick; // save currentTick to lastTick
      this.setState((props)=>{props.counter++; props.lastTickTime = currentTick; return props}) // update counter on screen
      // Play the sound with an onEnd callback
      //console.log('started playing at ' + currentTick);

      sound1.play((success) => {
        if (success) {
          //console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
          // reset the player to its uninitialized state (android only)
          // this is the only option to recover after an error occured and use the player again
          sound1.reset();
        }
      });      
    }
  }

  componentDidMount() {
    console.log("componentDidMount");

    setInterval(this.updateTicker, 10);

    setInterval(()=> {
      const localTime = new Date().getTime();
      const syncTime = this.clock.getTime();
      const drift = parseInt(localTime) - parseInt(syncTime);
      //console.log('SyncTime:' + syncTime + ' vs LocalTime: ' + localTime + ' Difference: ' + drift + 'ms');

      this.setState({
        localTime, syncTime,drift
      })

    }, 100);

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
        <Text style={styles.instructions}>
          {instructions}
        </Text>
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
});
