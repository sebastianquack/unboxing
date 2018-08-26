import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import TrackSelector from './TrackSelector';
import Gesture from './Gesture';

const uuidv4 = require('uuid/v4');
const userUuid = uuidv4();

var autoStartSequence = false;
var challengeMode = false;
var failedAlertShown = false;

class Sequencer extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      displayEinsatzIndicator: false,
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
  }

  componentDidMount() {
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
      this.props.loadSound(newItem.path);
      
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
      this.props.scheduleNextSound(this.state.currentSequenceStartedAt + this.state.nextItem.startTime);          
    }
  }
  
  // starts a sequence manually
  handleStartSequence() {
    if(this.currentSequencePlaying) {
      console.log("ignoring, you can only press start once");
      return;
    }

    let currentTime = this.props.getSyncTime();
    
    this.setState({
      currentSequencePlaying: true,
      currentSequenceStartedAt: currentTime
    }, ()=>this.scheduleNextSequenceItem()); // schedule first item for playback
    
    /*
    if(autoStartSequence) {
      let nextSoundTargetTime = this.props.getSyncTime() + 2000; // add time for message to traverse network
      this.props.scheduleNextSound(nextSoundTargetTime);
      Meteor.call("action", {sequence: this.state.currentSequence, targetTime: nextSoundTargetTime, userUuid: userUuid});    
    }
    */    
  }

  // this is only called once every second or so
  updateSequenceDisplay() {
    const currentTime = this.props.getSyncTime(); // get the synchronized time

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
    if(this.props.playScheduled) {
      console.log("ignoring, you can only press play now once");
      return;
    }
    // check if challenge mode is on
    if(this.state.challengeMode) {
      failedAlertShown = false;
      Meteor.call("attemptChallenge", this.props.challenge._id, userUuid);
    
    // regular play mode
    } else {
        let nextSoundTargetTime = this.props.getSyncTime(); // instant playback
        this.props.scheduleNextSound(nextSoundTargetTime, this.setupNextSequenceItem);
    }
  }

  // handle stop button press
  handlePlayStop() {
    this.props.stopSound();
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

  render() {

    return (
      <View> 
        {this.renderEinsatzIndicator()}

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
            <Text style={globalStyles.titleText}>Sequence Challenge</Text>
            <Switch value={this.state.challengeMode} onValueChange={this.handleChallengeModeSwitch}/>
            <Text>{this.props.challenge && this.state.challengeMode ? "players: " + Object.keys(this.props.challenge.uuids).length : ""}</Text>
          </View>

          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Autostart sequence</Text>
            <Switch value={this.state.autoStartSequence} onValueChange={this.handleAutoStartSequenceSwitch}/>
          </View>
          
          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Autoplay items</Text>
            <Switch value={this.state.autoPlayItems} onValueChange={this.handleAutoPlayItemsSwitch}/>
          </View>
        
          <Gesture onEinsatz={this.handleEinsatz}/>
        </View>
                    
        {this.renderSequenceInfo()}

        <Text>{this.state.challengeMode ? JSON.stringify(this.props.challenge) : ""}</Text>

        <TrackSelector onSelect={this.handleTrackSelect} />
       
      </View>
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
        if(!this.props.playScheduled) {
          console.log("received message to start playing from other device");
          if(autoStartSequence) {
            this.props.scheduleNextSound(message.fields.targetTime);
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
        this.props.scheduleNextSound(challengeCompleted.targetTime);  
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
  
}, Sequencer);

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
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
