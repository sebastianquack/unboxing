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
  TouchableOpacity,
  Switch
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import {globalStyles} from './config/globalStyles';

import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';

import Gesture from './components/Gesture';
import Files from './components/Files';

import SoundManager from './helpers/SoundManager';
var soundManager = new SoundManager();

const uuidv4 = require('uuid/v4');
const userUuid = uuidv4();

var waitingForManualEinsatz = false;
var autoPlayFromRemote = false;

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
      displayEinsatzIndicator: false,
      testClick: false,
      autoPlayFromRemote: false
    };
    this.timeSettings = {
      interval: 10
    };
    this.updateTicker = this.updateTicker.bind(this);
    this.handleSelectButtonPress = this.handleSelectButtonPress.bind(this);
    this.updateServer = this.updateServer.bind(this);
    this.handleSyncPress = this.handleSyncPress.bind(this);
    this.correctSync = this.correctSync.bind(this);
    this.getSyncTime = this.getSyncTime.bind(this);
    this.handlePlayNow = this.handlePlayNow.bind(this);
    this.handleEinsatz = this.handleEinsatz.bind(this);
    this.handleTestClickSwitch = this.handleTestClickSwitch.bind(this);
    this.handleAutoPlaySwitch = this.handleAutoPlaySwitch.bind(this);
  }

  getSyncTime() {
    return new Date().getTime() + this.state.delta;
  }

  // this is called very often - every 10ms
  updateTicker() {
    const currentTime = this.getSyncTime(); // get the synchronized time

    if(soundManager.playScheduled && currentTime > soundManager.nextSoundTargetTime) {
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
      // schedule next click
      if(this.state.testClick) {
        soundManager.scheduleNextSound(Math.ceil(this.getSyncTime()/1000)*1000);  
      }
    }
    
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
  }

  handlePlayStop() {
    soundManager.stopSound();
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

  correctSync(d) {
    this.setState({delta: this.state.delta + d});
  }

  handleTestClickSwitch(value) {
    this.setState({ testClick: value })
    if(value) {
      // schedule click to the next second
      soundManager.scheduleNextSound(Math.ceil(this.getSyncTime()/1000)*1000);
    } else {
      soundManager.scheduleNextSound(null);
    }
  }

  handleAutoPlaySwitch(value) {
   this.setState({ autoPlayFromRemote: value });
   autoPlayFromRemote = value;
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

  render() {
    const { testDictValue } = this.props;

    return (
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <KeepAwake />
        {this.renderEinsatzIndicator()}
        <Text style={globalStyles.titleText}>
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
          <TouchableOpacity style={styles.button} onPress={()=>this.correctSync(5)}>
            <Text>+5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={()=>this.correctSync(-5)}>
            <Text>-5</Text>
          </TouchableOpacity>
          <View>
            <Text>Test Click</Text>
            <Switch value={this.state.testClick} onValueChange={this.handleTestClickSwitch}/>
          </View>
        </View>
        <Text style={globalStyles.titleText}>Next sound: {this.state.selectedSound}</Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.bigButton} onPress={this.handlePlayNow}>
              <Text>Play Now!</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bigButton} onPress={this.handlePlayStop}>
              <Text>Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttons}>
          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Auto Play</Text>
            <Switch value={this.state.autoPlayFromRemote} onValueChange={this.handleAutoPlaySwitch}/>
          </View>
          <Gesture onEinsatz={this.handleEinsatz}/>
        </View>

        <Files onSelectSound={this.handleSelectButtonPress} />
      
      </ScrollView>
    );
  }
}

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
        
        if(!soundManager.playScheduled) {
          console.log("received message to start playing from other device");

          if(autoPlayFromRemote) {
            soundManager.scheduleNextSound(message.fields.targetTime);
          }
          
          /*
          waitingForManualEinsatz = true;
          setTimeout(()=>{
            if(waitingForManualEinsatz) {
              alert("resetting challenge");
              waitingForManualEinsatz = false;
            }
          }, 10000);
          */

        }
      }
    });
  
  });
  
  return {
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
  control: {
    marginRight: 20,
    marginBottom: 20
  },
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
  },
  bigButton: {
    margin: 20,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 80,
    paddingRight: 80,
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
