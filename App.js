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

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {

  constructor(props) {
    super(props);
    this.clock = new clockSync({});
    this.lastTick = 0,
    this.state = {
      localTime: 0,
      syncTime: 0,
      drift: 0,
      counter: 0,
    };
    this.updateTicker = this.updateTicker.bind(this)
  }

  updateTicker() {
    const syncTime = this.clock.getTime();
    
    const syncTimeString = syncTime.toString();
    const newTimeString = syncTimeString.substr(0,syncTimeString.length-4) + "0000"
    const newTime = Number.parseInt(newTimeString)

    if (this.lastTick + 5000 < newTime) {
      this.lastTick = syncTime;
      this.setState((props)=>{props.counter++; return props})
    }
  }

  componentDidMount() {

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
        <Text>counter: {this.state.counter}</Text>
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

