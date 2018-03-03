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

const uuidv4 = require('uuid/v4');
const userUuid = uuidv4();

var waitingForManualEinsatz = false;

function measureDelta(callback) {
  let sendTimeStamp = (new Date()).getTime();
  Meteor.call("getTime", (err, serverTime) => {
    if(err) {
        alert("error retrieving time from server");
        console.log(err);
        return;
    }
    let receiveTimeStamp = (new Date()).getTime();
    let latency = (receiveTimeStamp - sendTimeStamp) / 2.0;
    let delta = receiveTimeStamp - (serverTime + latency);
    callback({latency: latency, delta: delta});
  });
}

function avgTimeDeltas(callback) {
  let deltas = [];
  let timeout = 1000;
  let num = 10;

  // send num requests to server, save deltas
  console.log("starting measurement of time deltas");
  for(let i = 0; i < num; i++) {
    
    setTimeout(()=>{
      measureDelta((delta)=>{
        deltas.push(delta)
        if(i == num - 1) {
          console.log("measurement complete");
          console.log(JSON.stringify(deltas));
          console.log("sorting by latency");
          deltas.sort(function(a, b){return a.latency - b.latency});
          console.log(JSON.stringify(deltas));
          console.log("calculating average delta for fastest half of reponses:");
          let sum = 0;
          let counter = 0;
          for(let j = 0; j < deltas.length / 2.0; j++) {
            sum += deltas[j].delta;
            counter++;
          }
          let avg = sum / counter;
          console.log("result: " + avg);
          callback(avg);
        }
      });  
    }, i * timeout); 
  
  }  
}

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    this.state = {
      delta: 0,
      currentServer: "192.168.1.131",
      serverInput: "192.168.1.131",
      displayEinsatzIndicator: false
    };
    this.timeSettings = {
      interval: 10
    };
    this.updateTicker = this.updateTicker.bind(this);
    this.handleSelectButtonPress = this.handleSelectButtonPress.bind(this);
    this.updateServer = this.updateServer.bind(this);
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

    if(!waitingForManualEinsatz && soundManager.playScheduled && currentTime > soundManager.nextSoundTargetTime) {
      console.log("initiating playback loop");
      let nextSound = this.state.selectedSound; //soundManager.playScheduled;
      let targetStartTime = soundManager.nextSoundTargetTime + 200;

      soundManager.scheduleNextSound(null);
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

      soundManager.playSound();
    }
    
  }

  componentDidMount() {
    console.log("componentDidMount");
    setInterval(this.updateTicker, this.timeSettings.interval);
    this.updateServer();
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
    
    avgTimeDeltas((delta)=>{
      this.setState({delta: delta});
      alert("Time sync completed");
    });

  }

  updateServer() {
    console.log("updating server to " + this.state.serverInput);
    this.state.currentServer = this.state.serverInput;

    Meteor.disconnect();
    Meteor.connect('ws://'+this.state.currentServer+':3000/websocket');
  }

  handleSelectButtonPress(filename) {
    console.log("sound selected: " + filename);
    soundManager.stopSound();
    soundManager.loadSound(filename);
    this.setState({selectedSound: filename});
  }

  renderEinsatzIndicator() {
    if (!this.state.displayEinsatzIndicator) return null
    return (<Text style={styles.einsatzIndicator}>
      Einsatz!
    </Text>)
  }

  handlePlayNow() {
    if(soundManager.playScheduled) {
      console.log("ignoring, you can only press play now once");
      return;
    }
    let nextSoundTargetTime = this.getSyncTime() + 2000; // add time for message to traverse network

    if(waitingForManualEinsatz) {
      if(nextSoundTargetTime > soundManager.nextSoundTargetTime + 5000) {
        alert("too late!");
      }
      waitingForManualEinsatz = false;
    } else {
      soundManager.scheduleNextSound(nextSoundTargetTime);
      Meteor.call("action", {sample: this.state.selectedSound, targetTime: nextSoundTargetTime, userUuid: userUuid});  
    }

    dict.set("testValue", dict.get("testValue") + 1);
  }

  render() {
    const { testDictValue } = this.props;

    return (
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <KeepAwake />
        {this.renderEinsatzIndicator()}
        <Text style={styles.welcome}>
          Unboxing
        </Text>
        <Text style={{marginTop: 20}}>Server: {this.state.currentServer}</Text>
        <TextInput
          underlineColorAndroid='transparent'
          style={{width: 150, height: 40, borderColor: 'gray', borderWidth: 1}}
          value={this.state.serverInput}
          onChangeText={(text) => this.setState({serverInput: text})}
          onSubmitEditing={this.updateServer}
        />
        <Text>Time delta: {this.state.delta}</Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={this.handleSyncPress}>
            <Text>Sync Time</Text>
          </TouchableOpacity>
        </View>
        <Text>Tap the next sound to play:</Text>
        <Text style={{marginBottom: 20}}>next sound: {this.state.selectedSound}</Text>
        
        <TouchableOpacity style={styles.button} onPress={this.handlePlayNow}>
            <Text>Play Now!</Text>
        </TouchableOpacity>

        <Gesture onEinsatz={this.handleEinsatz}/>
        <Files onSelectSound={this.handleSelectButtonPress} />
      
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
      // check if event originated from this user
      if(message.fields.userUuid == userUuid) {
        return;
      }

      // event originated from someone else
      if(message.fields.type == "button pressed") {
        dict.set("testValue", dict.get("testValue") + 1);

        if(!soundManager.playScheduled) {
          console.log("received message to start playing from other device");
          //soundManager.scheduleNextSound(message.fields.targetTime);

          waitingForManualEinsatz = true;
          setTimeout(()=>{
            if(waitingForManualEinsatz) {
              alert("resetting challenge");
              waitingForManualEinsatz = false;
            }
          }, 10000);

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
