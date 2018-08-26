/**
 * Main App Component - Todo: move out most functionality into sub components
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

import Meteor, { createContainer, MeteorListView } from 'react-native-meteor';

import ServerConnector from './app/components/ServerConnector';
import TimeSync from './app/components/TimeSync';
import SequenceSelector from './app/components/SequenceSelector';
import Gesture from './app/components/Gesture';
import AttributeSlider from './app/components/AttributeSlider';
import Files from './app/components/Files'

import SoundManager from './app/services/SoundManager';

const uuidv4 = require('uuid/v4');
const userUuid = uuidv4();

var autoStartSequence = false;
var challengeMode = false;
var failedAlertShown = false;

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    
    this.state = {
      delta: 0,
      displayEinsatzIndicator: false,
      autoStartSequence: false,
      autoPlayItems: true,
      challengeMode: false,
      testClick: false,
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
    this.handleTrackSelect = this.handleTrackSelect.bind(this);
    this.handleStartSequence = this.handleStartSequence.bind(this);
    this.handlePlayNow = this.handlePlayNow.bind(this);
    this.handleEinsatz = this.handleEinsatz.bind(this);
    this.handleAutoStartSequenceSwitch = this.handleAutoStartSequenceSwitch.bind(this);
    this.handleAutoPlayItemsSwitch = this.handleAutoPlayItemsSwitch.bind(this);
    this.handleChallengeModeSwitch = this.handleChallengeModeSwitch.bind(this);
    this.updateSequenceDisplay = this.updateSequenceDisplay.bind(this);
    this.handlePlayStop = this.handlePlayStop.bind(this);
    this.setupNextSequenceItem = this.setupNextSequenceItem.bind(this);
    this.soundManager = new SoundManager({
      onDeltaChange: delta => this.setState({delta})
    });
  }

  componentDidMount() {
    this.soundManager.startTicker(this.timeSettings.interval);
    setInterval(this.updateSequenceDisplay, this.timeSettings.sequenceDisplayInterval);
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
        nextItem: newItem
      });

      // load first item
      this.soundManager.loadSound(newItem.path);
      
      if(this.state.currentSequencePlaying) {
        this.scheduleNextSequenceItem();
      }

    } else {

      console.log("no next item found");
      console.log(items);

       this.setState({
        nextItemIndex: -1,
        nextItem: null
      });
    }
  }

  scheduleNextSequenceItem = () => {    
    if(this.state.autoPlayItems) {
      this.soundManager.scheduleNextSound(this.state.currentSequenceStartedAt + this.state.nextItem.startTime);          
    }
  }
  
  // starts a sequence manually
  handleStartSequence() {
    if(this.currentSequencePlaying) {
      console.log("ignoring, you can only press start once");
      return;
    }

    let currentTime = this.soundManager.getSyncTime();
    
    this.setState({
      currentSequencePlaying: true,
      currentSequenceStartedAt: currentTime
    }, ()=>this.scheduleNextSequenceItem()); // schedule first item for playback
    
    /*
    if(autoStartSequence) {
      let nextSoundTargetTime = soundManager.getSyncTime() + 2000; // add time for message to traverse network
      soundManager.scheduleNextSound(nextSoundTargetTime);
      Meteor.call("action", {sequence: this.state.currentSequence, targetTime: nextSoundTargetTime, userUuid: userUuid});    
    }
    */    
  }

  // this is only called once every second or so
  updateSequenceDisplay() {
    const currentTime = this.soundManager.getSyncTime(); // get the synchronized time

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
    if(this.soundManager.playScheduled) {
      console.log("ignoring, you can only press play now once");
      return;
    }
    // check if challenge mode is on
    if(this.state.challengeMode) {
      failedAlertShown = false;
      Meteor.call("attemptChallenge", this.props.challenge._id, userUuid);
    
    // regular play mode
    } else {
        let nextSoundTargetTime = this.soundManager.getSyncTime(); // instant playback
        this.soundManager.scheduleNextSound(nextSoundTargetTime, this.setupNextSequenceItem);
    }
  }

  // handle stop button press
  handlePlayStop() {
    this.soundManager.stopSound();
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

  translateMovementAmount = (data, props, dataBuffer)=>{
    if (dataBuffer.length == 0) return 0
    const speedBufferSize = 5
    const speedX = Math.abs(data.x-dataBuffer[0].x)
    const speedY = Math.abs(data.y-dataBuffer[0].y)
    const speedZ = Math.abs(data.z-dataBuffer[0].z)
    const currentSpeed = speedX + speedY + speedZ
    if (typeof(this.speedBuffer) == "undefined") {
      this.speedBuffer = []
      this.speedBuffer.fill(0,0,speedBufferSize)
    }

    //FIFO in
    if (this.speedBuffer.length <= speedBufferSize) {
      this.speedBuffer.push(currentSpeed)
    }
    //FIFO out
    if (this.speedBuffer.length > speedBufferSize) {
      this.speedBuffer.shift()
    }    

    const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
    const avg = average(this.speedBuffer)

    // console.log(currentSpeed, avg)

    let result = 0.1 * ((currentSpeed + avg) / 2);
    return Math.floor(100*result)/100;      

  }

  render() {
    return (
      
      <ScrollView contentContainerStyle={styles.container}>
        
        <KeepAwake />
        {this.renderEinsatzIndicator()}
        <Text style={globalStyles.titleText}>
          Unboxing
        </Text>
        
        <ServerConnector/>

        <TimeSync
          soundManager={this.soundManager}
          delta = {this.state.delta}
        />
        
        {this.renderSequenceInfo()}
        
        <View style={globalStyles.buttons}>
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

        <View style={globalStyles.buttons}>
          
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
          onValueChange={value=>this.soundManager.setVolume(value)}
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
          onValueChange={value=>this.soundManager.setSpeed(value)}
          sensorTranslate={(data, props)=>{
            let sensorValue = data.y;
            if(sensorValue > 5) sensorValue = 5;
            if(sensorValue < -5) sensorValue = -5;
            let result = (((sensorValue + 5.0) / 10.0) * (props.maxValue - props.minValue)) + props.minValue;
            return Math.floor(100*result)/100;      
          }}
        />

        <AttributeSlider
          attributeName={"Volume"}
          initialValue={0.5}
          minValue={0.1}
          maxValue={1}
          dataBufferSize={1}
          updateInterval={200}
          onValueChange={value=>this.soundManager.setVolume(value)}
          sensorTranslate={this.translateMovementAmount}
        />

        <Text>{this.state.challengeMode ? JSON.stringify(this.props.challenge) : ""}</Text>

        <SequenceSelector onSelect={this.handleTrackSelect} />

        <Files />
      
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
        if(!this.soundManager.playScheduled) {
          console.log("received message to start playing from other device");
          if(autoStartSequence) {
            this.soundManager.scheduleNextSound(message.fields.targetTime);
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
        this.soundManager.scheduleNextSound(challengeCompleted.targetTime);  
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

  return {
    challenge
  };
}, App);


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
  control: {
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20
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
