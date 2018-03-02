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
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';

import Gesture from './components/Gesture';
import Files from './components/Files';

import SoundManager from './helpers/SoundManager';
var soundManager = new SoundManager();

//import NtpClient from 'react-native-ntp-client';
var NtpClient = require('react-native-ntp-client');

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    this.lastTick = 0;
    this.state = {
      localTime: 0,
      syncTime: 0,
      delta: 0,
      counter: 0,
      stats: {},
      currentServer: "192.168.1.131",
      ntpInput: "192.168.1.131",
      displayEinsatzIndicator: false
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
    this.handleSelectButtonPress = this.handleSelectButtonPress.bind(this);
    this.updateNTPServer = this.updateNTPServer.bind(this);
    this.handleSyncPress = this.handleSyncPress.bind(this);
    this.getSyncTime = this.getSyncTime.bind(this);
    this.handlePlayNow = this.handlePlayNow.bind(this);
    this.handleEinsatz = this.handleEinsatz.bind(this);

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

    if(soundManager.nextSoundToStartPlaying && currentTime > soundManager.nextSoundTargetTime) {
      console.log("initiating playback loop");
      let nextSound = this.state.selectedSound; //soundManager.nextSoundToStartPlaying;
      let targetStartTime = soundManager.nextSoundTargetTime + 200;

      soundManager.scheduleNextSound(null, null);
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

      soundManager.playSound(nextSound);
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

    this.updateNTPServer();

  }

  handleEinsatz() {
    console.log("Gesture deteced!");
    this.handlePlayNow();
    this.setState({displayEinsatzIndicator: true}, ()=>{
      setTimeout(()=>this.setState({displayEinsatzIndicator: false}), 1000)
    })
    //setTimeout(()=>/*this.setState({displayEinsatzIndicator: false})*/alert(2), 1000)
  }
  
  handleSyncPress() {
    console.log("sync button pressed, calling server " + this.state.currentServer);
    
    /*NtpClient.getNetworkTime(this.state.currentServer, 123, (err, date)=> {
      if(err) {
          alert("error retrieving time from ntp server");
          console.log(err);
          return;
      }
 
      var tempServerTime = date.getTime();
      var tempLocalTime = (new Date()).getTime();
      this.setState({delta: tempServerTime - tempLocalTime});

      alert("Got back time from server " + this.state.ntpInput + ": " + tempServerTime);
    });*/

    Meteor.call("getTime", (err, time) => {
      if(err) {
          alert("error retrieving time from ntp server");
          console.log(err);
          return;
      }
      var tempServerTime = time;
      var tempLocalTime = (new Date()).getTime();
      this.setState({delta: tempServerTime - tempLocalTime});
      alert("Got back time from server " + this.state.ntpInput + ": " + tempServerTime);
    });

    
  }

  updateNTPServer() {
    console.log("updating server to " + this.state.ntpInput);
    this.state.currentServer = this.state.ntpInput;

    Meteor.disconnect();
    Meteor.connect('ws://'+this.state.currentServer+':3000/websocket');
  }

  handleSelectButtonPress(key) {
    console.log("button pressed: " + key);
    soundManager.stopSounds();
    this.setState({selectedSound: key});
  }

  renderSelectButtons() {
    let keys = [];
    if(soundManager) {
      keys = soundManager.getKeys();
    }
    let buttons = keys.map((key)=>
      <TouchableOpacity
        style={styles.button}
        key={"button" + key}
        onPress={()=>{this.handleSelectButtonPress(key);}}
      ><Text>{key}</Text></TouchableOpacity>
    );
    return buttons;
  }

  renderEinsatzIndicator() {
    if (!this.state.displayEinsatzIndicator) return null
    return (<Text style={styles.einsatzIndicator}>
      Einsatz!
    </Text>)
  }

  handlePlayNow() {
    if(soundManager.nextSoundToStartPlaying) {
      console.log("ignoring, you can only press play now once");
      return;
    }
    let nextSoundTargetTime = this.state.syncTime + 2000; // add time for message to traverse network
    soundManager.scheduleNextSound(this.state.selectedSound, nextSoundTargetTime);
    Meteor.call("action", {sample: this.state.selectedSound, targetTime: nextSoundTargetTime});
    dict.set("testValue", dict.get("testValue") + 1);
  }

  render() {
    const { testDictValue } = this.props;

    return (
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <KeepAwake />
        {this.renderEinsatzIndicator()}
        <Text style={styles.welcome}>
          Welcome to unboxing!
        </Text>
        <Text>testDictValue: {testDictValue}</Text>
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
        <View style={styles.buttons}>{this.renderSelectButtons()}</View>
        <Text style={{marginBottom: 20}}>next sound: {this.state.selectedSound}</Text>
        
        <TouchableOpacity style={styles.button} onPress={this.handlePlayNow}>
            <Text>Play Now!</Text>
        </TouchableOpacity>

        <Gesture onEinsatz={this.handleEinsatz}/>
        <Files />

      
      </ScrollView>
    );
  }
}

var dict = new ReactiveDict('timeManager');
dict.set("testValue", 0);

export default createContainer(params=>{
  Meteor.subscribe('events.all', () => {

    console.log("setup added event");
    Meteor.ddp.on("added", message => {
      console.log(message);
      if(message.fields.type == "button pressed") {
        dict.set("testValue", dict.get("testValue") + 1);
        if(!soundManager.nextSoundToStartPlaying) {
          console.log("received message to start playing from other device");
          soundManager.scheduleNextSound(message.fields.sample, message.fields.targetTime);
        }
      }
    });
  
  });
  
  return {
    testDictValue: dict.get("testValue")
  };
}, App)


const styles = StyleSheet.create({
  container: {
    //flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20
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
  },
  einsatzIndicator: {
    fontSize: 100,
    position: 'absolute',
    color: 'red',
    width: '100%',
    height: '100%',
    backgroundColor:'rgba(255,0,0,0.5)',
  }

});
