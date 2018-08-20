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
  Switch,
  Slider
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import {globalStyles} from './config/globalStyles';

import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';

import Gesture from './components/Gesture';
import Sequences from './components/Sequences';
import AttributeSlider from './components/AttributeSlider';

import SoundManager from './helpers/SoundManager';
var soundManager = new SoundManager();

/* doesn't work - cannot resolve services for some reason
import Zeroconf from 'react-native-zeroconf';
const zeroconf = new Zeroconf();
zeroconf.scan(type = 'http', protocol = 'tcp', domain = 'local.');
zeroconf.on('start', () => console.log('The scan has started.'));
zeroconf.on('update', () => console.log("update " + JSON.stringify(zeroconf.getServices())));
zeroconf.on('resolved', data => console.log("resolved " + JSON.stringify(data)));
zeroconf.on('error', data => console.log("error " + JSON.stringify(data)));*/

var RNFS = require('react-native-fs');

const uuidv4 = require('uuid/v4');
const userUuid = uuidv4();

var autoStartSequence = false;
var autoPlayItems = true;
var challengeMode = false;
var failedAlertShown = false;

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
      currentServer: "",
      serverInput: "192.168.178.150",
      displayEinsatzIndicator: false,
      testClick: false,
      autoStartSequence: false,
      autoPlayItems: true,
      challengeMode: false,
      
      currentSequence: null,
      currentTrack: null,
      nextItemIndex: -1,
      nextItem: null,
      currentSequencePlaying: false,
      currentSequenceStartedAt: null,
      currentTimeInSequence: 0,
      timeToNextItem: null
    };
    this.timeSettings = {
      interval: 10,
      sequenceDisplayInterval: 200
    };
    this.updateTicker = this.updateTicker.bind(this);
    this.handleTrackSelect = this.handleTrackSelect.bind(this);
    this.updateServer = this.updateServer.bind(this);
    this.handleSyncPress = this.handleSyncPress.bind(this);
    this.correctSync = this.correctSync.bind(this);
    this.getSyncTime = this.getSyncTime.bind(this);
    this.handleStartSequence = this.handleStartSequence.bind(this);
    this.handlePlayNow = this.handlePlayNow.bind(this);
    this.handleEinsatz = this.handleEinsatz.bind(this);
    this.handleTestClickSwitch = this.handleTestClickSwitch.bind(this);
    this.handleAutoStartSequenceSwitch = this.handleAutoStartSequenceSwitch.bind(this);
    this.handleAutoPlayItemsSwitch = this.handleAutoPlayItemsSwitch.bind(this);
    this.handleChallengeModeSwitch = this.handleChallengeModeSwitch.bind(this);
    this.loadLocalConfig = this.loadLocalConfig.bind(this);
    this.updateSequenceDisplay = this.updateSequenceDisplay.bind(this);
    this.handlePlayStop = this.handlePlayStop.bind(this);
    this.setupNextSequenceItem = this.setupNextSequenceItem.bind(this);

    this.loadLocalConfig();
  }

  componentDidMount() {
    setInterval(this.updateTicker, this.timeSettings.interval);
    setInterval(this.updateSequenceDisplay, this.timeSettings.sequenceDisplayInterval);
  }

  // read default server ip address from file on device
  loadLocalConfig() {
    RNFS.readFile(RNFS.ExternalDirectoryPath + "/localConfig.json", 'utf8')
    .then((contents) => {
      // log the file contents
      console.log(contents);
      this.localConfig = JSON.parse(contents);
      console.log(this.localConfig);
      this.setState({
        serverInput: this.localConfig.defaultServerIp,
        currentServer: this.localConfig.defaultServerIp
      }, ()=>this.updateServer());
    })
    .catch((err) => {
      console.log(err.message, err.code);
    });
  }

  updateServer() {
    console.log("updating server to " + this.state.serverInput);
    this.state.currentServer = this.state.serverInput;

    Meteor.disconnect();
    if(this.state.currentServer) {
      Meteor.connect('ws://'+this.state.currentServer+':3000/websocket');  
    }    
  }

  getSyncTime() {
    return new Date().getTime() - this.state.delta;
  }

  // time sync controls
  handleSyncPress() {
    console.log("sync button pressed, calling server " + this.state.currentServer);
    avgTimeDeltas((delta)=>{
      this.setState({delta: delta});
      alert("Time sync completed");
    });
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

  correctSync(d) {
    this.setState({delta: this.state.delta + d});
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

      soundManager.setVolume(this.state.volume);
      soundManager.playSound();
      soundManager.setSpeed(this.state.speed);
      
      // schedule next click or sequence item
      if(this.state.testClick) {
        soundManager.scheduleNextSound(Math.ceil(this.getSyncTime()/1000)*1000);  
      } else {
        this.setupNextSequenceItem();  
      }
      
    }
  }

  // called when user selects a track in a sequence
  handleTrackSelect(sequence, track) {
    this.setState({
      currentSequencePlaying: false,
      currentSequence: sequence,
      currentTrack: track,
      currentTimeInSequence: 0,
      nextItemIndex: -1
    }, ()=>this.setupNextSequenceItem());
  }

  // called on loading a sequence and after playback of an item
  setupNextSequenceItem() {

    console.log("setting up next sequence item");

    let items = this.state.currentSequence.items;
    if(!items.length) {
      return;
    }

    let newIndex = this.state.nextItemIndex + 1; // initialized with -1
    let newItem = null;
    let newItemTrack = null;

    while(!newItem && newIndex < items.length) { 
      console.log("newIndex: " + newIndex);
      if(items[newIndex].track == this.state.currentTrack.name) {
        newItem = items[newIndex];  
        newItemTrack = items[newIndex].track  
      }
      newIndex++;
    } 

    if(newItem) {

      this.setState({
        nextItemIndex: newIndex - 1,
        nextItem: newItem,
        selectedSound: newItem.path
      });

      // load first item
      soundManager.loadSound(newItem.path);
      
      if(this.state.currentSequencePlaying) {
        this.scheduleNextSequenceItem();
      }

    } else {

      console.log("no next item found");
      console.log(items);

       this.setState({
        nextItemIndex: -1,
        nextItem: null,
        selectedSound: null
      });
    }
  }

  scheduleNextSequenceItem = () => {    
    if(this.state.autoPlayItems) {
      soundManager.scheduleNextSound(this.state.currentSequenceStartedAt + this.state.nextItem.startTime);          
    }
  }
  
  // starts a sequence manually
  handleStartSequence() {
    if(this.currentSequencePlaying) {
      console.log("ignoring, you can only press start once");
      return;
    }

    let currentTime = this.getSyncTime();
    
    this.setState({
      currentSequencePlaying: true,
      currentSequenceStartedAt: currentTime
    }, ()=>this.scheduleNextSequenceItem()); // schedule first item for playback
    
    /*
    if(autoStartSequence) {
      let nextSoundTargetTime = this.getSyncTime() + 2000; // add time for message to traverse network
      soundManager.scheduleNextSound(nextSoundTargetTime);
      Meteor.call("action", {sequence: this.state.currentSequence, targetTime: nextSoundTargetTime, userUuid: userUuid});    
    }
    */    
  }

  // this is only called once every second or so
  updateSequenceDisplay() {
    const currentTime = this.getSyncTime(); // get the synchronized time

    if(this.state.currentSequencePlaying) {
      let currentTimeInSequence = currentTime - this.state.currentSequenceStartedAt;
      this.setState({currentTimeInSequence: currentTimeInSequence});
    }

    if(this.state.nextItem) {
      let timeToNextItem = this.state.nextItem.startTime - (currentTime - this.state.currentSequenceStartedAt)
      this.setState({timeToNextItem: timeToNextItem});   
    } else {
      this.setState({timeToNextItem: null});   
    }
  }

  // starts playback of a sound manually
  handlePlayNow() {
    if(soundManager.playScheduled) {
      console.log("ignoring, you can only press play now once");
      return;
    }
    // check if challenge mode is on
    if(this.state.challengeMode) {
      failedAlertShown = false;
      Meteor.call("attemptChallenge", this.props.challenge._id, userUuid);
    
    // regular play mode
    } else {
        let nextSoundTargetTime = this.getSyncTime(); // instant playback
        soundManager.scheduleNextSound(nextSoundTargetTime);
    }
  }

  // handle stop button press
  handlePlayStop() {
    soundManager.stopSound();
    //console.log("zeroconf " + JSON.stringify(zeroconf.getServices()));

    this.setState({
      currentSequencePlaying: false,
      currentTimeInSequence: 0,
      nextItem: null,
      nextItemIndex: -1
    }, ()=>this.setupNextSequenceItem());
  }

  handleEinsatz() {
    console.log("Gesture deteced!");
    this.handlePlayNow();
    this.setState({displayEinsatzIndicator: true}, ()=>{
      setTimeout(()=>this.setState({displayEinsatzIndicator: false}), 1000)
    })
    //setTimeout(()=>/*this.setState({displayEinsatzIndicator: false})*/alert(2), 1000)
  }
  
  handleAutoStartSequenceSwitch(value) {
   this.setState({ autoStartSequence: value });
   autoStartSequence = value;
  }

  handleAutoPlayItemsSwitch(value) {
   this.setState({ autoPlayItems: value });
   autoPlayItems = value;
  }

  handleChallengeModeSwitch(value) {
    this.setState({ challengeMode: value });
    challengeMode = value;
    Meteor.call("setupChallenge", userUuid, value);
  }

  renderEinsatzIndicator() {
    if (!this.state.displayEinsatzIndicator) return null
    return (<Text style={styles.einsatzIndicator}>
      Einsatz!
    </Text>)
  }

  renderSequenceInfo = () => {
    return (
      <Text style={globalStyles.titleText}>
          Selected sequence: {this.state.currentSequence ? this.state.currentSequence.name : "none"} / {this.state.currentTrack ? this.state.currentTrack.name : "none"} {"\n"}
          Sequence playback position: {Math.floor(this.state.currentTimeInSequence / 1000)} {"\n"}
          Next item: {this.state.nextItem ? this.state.nextItem.path : "none"} ({this.state.currentSequencePlaying ? Math.floor(this.state.timeToNextItem / 1000) : ""})
      </Text>
    );
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
        <Text>Status: { this.props.connected ? "connected" : "disconnected"}</Text>
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
        {this.renderSequenceInfo()}
        
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.bigButton} onPress={this.handleStartSequence}>
              <Text>Start sequence</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bigButton} onPress={this.handlePlayNow}>
              <Text>Play item now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bigButton} onPress={this.handlePlayStop}>
              <Text>Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttons}>
          
          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Sync start sequence</Text>
            <Switch value={this.state.autoStartSequence} onValueChange={this.handleAutoStartSequenceSwitch}/>
          </View>
          
          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Autoplay items</Text>
            <Switch value={this.state.autoPlayItems} onValueChange={this.handleAutoPlayItemsSwitch}/>
          </View>
          
          <Gesture onEinsatz={this.handleEinsatz}/>
          
          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Challenge</Text>
            <Switch value={this.state.challengeMode} onValueChange={this.handleChallengeModeSwitch}/>
            <Text>{this.props.challenge && this.state.challengeMode ? "players: " + Object.keys(this.props.challenge.uuids).length : ""}</Text>
          </View>
        </View>

        <AttributeSlider
          attributeName={"Volume"}
          initialValue={0.5}
          minValue={0.1}
          maxValue={1}
          onValueChange={value=>soundManager.setVolume(value)}
          sensorTranslate={(data, props)=>{
            let sensorValue = data.x;
            if(sensorValue > 5) sensorValue = 5;
            if(sensorValue < -5) sensorValue = -5;
            let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
            return Math.floor(100*result)/100;      
          }}
        />

        <AttributeSlider
          attributeName={"Speed"}
          initialValue={1.0}
          minValue={0.8}
          maxValue={1.2}
          onValueChange={value=>soundManager.setSpeed(value)}
          sensorTranslate={(data, props)=>{
            let sensorValue = data.y;
            if(sensorValue > 5) sensorValue = 5;
            if(sensorValue < -5) sensorValue = -5;
            let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
            return Math.floor(100*result)/100;      
          }}
        />

        <Text>{this.state.challengeMode ? JSON.stringify(this.props.challenge) : ""}</Text>

        <Sequences onSelect={this.handleTrackSelect} />
      
      </ScrollView>
    );
  }
}

export default createContainer(params=>{
  
  Meteor.subscribe('events.all', () => {
    Meteor.ddp.on("added", message => {
      //console.log(message);
      // check if event originated from this user
      if(message.fields.userUuid == userUuid) {
        return;
      }
      // event originated from someone else
      if(message.fields.type == "button pressed") {
        if(!soundManager.playScheduled) {
          console.log("received message to start playing from other device");
          if(autoStartSequence) {
            soundManager.scheduleNextSound(message.fields.targetTime);
          }
        }
      }
    });
  });

  Meteor.subscribe('challenges.latest', () => {
    Meteor.ddp.on("changed", message => {
      //console.log(message);
      if(challengeMode && message.msg == "changed" && message.fields.status == "completed") {
        let challengeCompleted = Meteor.collection('challenges').findOne(message.id);
        soundManager.scheduleNextSound(challengeCompleted.targetTime);  
      }
      if(challengeMode && message.msg == "changed" && message.fields.status == "failed") {
        if(!failedAlertShown) {
          failedAlertShown = true;
          alert("challenge failed");  
          setInterval(()=>{
            failedAlertShown = false;
          }, 5000);
        }
      }
    });
  });

  let challenge = Meteor.collection('challenges').findOne();

  const connected = Meteor.status().connected

  return {
    challenge,
    connected
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
    marginLeft: 20,
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
