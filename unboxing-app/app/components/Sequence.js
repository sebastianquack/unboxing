import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import Gesture from './Gesture';

/*
todo: move to challenge service
const uuidv4 = require('uuid/v4');
const userUuid = uuidv4();
var autoStartSequence = false;
var challengeMode = false;
var failedAlertShown = false;
*/

import {withServices} from './ServiceConnector';
import {soundService} from '../services/soundService';
import {sequenceService} from '../services/sequenceService';

class Sequence extends React.Component { 
  constructor(props) {
    super(props);
    
    this.state = {
      displayEinsatzIndicator: false,
      currentTimeInSequence: 0,
      timeToNextItem: null,
      timeInCurrentItem: null
    };
    
    this.updateSequenceInfo = this.updateSequenceInfo.bind(this);
    this.handleEinsatz = this.handleEinsatz.bind(this);
  }

  componentDidMount() {
    this.updateInterval = setInterval(this.updateSequenceInfo, 200);
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

  // starts a sequence manually
  handleStartSequence() {
    sequenceService.startSequence();
  }

  handlePlayNow() {
    
    /*
    TODO: move to challenge service
    // check if challenge mode is on
    if(this.state.challengeMode) {
      failedAlertShown = false;
      Meteor.call("attemptChallenge", this.props.challenge._id, userUuid);
    } else
    */
    
    sequenceService.playNextItem();
  }

  handleStop() {
    sequenceService.stopSequence();
  }

  /*
  TODO: move to challenge service
  handleAutoStartSequenceSwitch(value) {
   this.setState({ autoStartSequence: value });
   autoStartSequence = value; 
  }

  handleChallengeModeSwitch(value) {
    this.setState({ challengeMode: value });
    challengeMode = value;
    Meteor.call("setupChallenge", userUuid, value);
  }
  */

  handleEinsatz() {
    console.log("Gesture deteced!");
    this.handlePlayNow();
    this.setState({displayEinsatzIndicator: true}, ()=>{
      setTimeout(()=>this.setState({displayEinsatzIndicator: false}), 1000)
    })
  }

  renderEinsatzIndicator() {
    if (!this.state.displayEinsatzIndicator) return null
    return (<Text style={styles.einsatzIndicator}>
      Einsatz!
    </Text>)
  }

  // called every second to calculate sequence info
  updateSequenceInfo() {
    const currentTime = soundService.getSyncTime(); // get the synchronized time
    const currentTimeInSequence = currentTime - this.props.services.sequence.startedAt;

    if(this.props.services.sequence.controlStatus == "playing") {
      this.setState({currentTimeInSequence: currentTimeInSequence});
    } else {
      this.setState({currentTimeInSequence: 0});
    }

    if(this.props.services.sequence.nextItem) {
      let timeToNextItem = this.props.services.sequence.nextItem.startTime - currentTimeInSequence
      this.setState({timeToNextItem: timeToNextItem});   
    } else {
      this.setState({timeToNextItem: null});   
    }

    if(this.props.services.sequence.currentItem) {
      let timeInCurrentItem = currentTimeInSequence - this.props.services.sequence.currentItem.startTime
      this.setState({timeInCurrentItem: timeInCurrentItem});   
    } else {
      this.setState({timeInCurrentItem: null});   
    }
  }

  // renders current sequence display, called when info changes
  renderSequenceInfo() {
    const currentSequence = this.props.services.sequence.currentSequence;
    const currentTrack = this.props.services.sequence.currentTrack;
    const currentItem = this.props.services.sequence.currentItem;
    const nextItem = this.props.services.sequence.nextItem;
    const controlStatus = this.props.services.sequence.controlStatus;
    
    return(
      <Text>
        currentSequence: {currentSequence ? currentSequence.name : "none"} {"\n"}
        controlStatus: { controlStatus } {"\n"}
        currentTrack: {currentTrack ? currentTrack.name : "none"} {"\n"}
        Sequence playback position: {Math.floor(this.state.currentTimeInSequence / 1000)} {"\n"}
        custom_duration: { currentSequence ? currentSequence.custom_duration : "?" } {"\n"}
        Current item: {currentItem ? currentItem.path : "none"} ({this.props.services.sequence.controlStatus == "playing" ? Math.floor(this.state.timeInCurrentItem / 1000) : ""}) {"\n"}
        Next item: {nextItem ? nextItem.path : "none"} ({this.props.services.sequence.controlStatus == "playing" ? Math.floor(this.state.timeToNextItem / 1000) : ""}) {"\n"}
      </Text>
    )
  }

  render() {

    return (
      <View> 
        {this.renderEinsatzIndicator()}

        <View style={globalStyles.buttons}>
          <TouchableOpacity style={styles.bigButton} onPress={this.handleStartSequence}>
              <Text>Start sequence</Text>
          </TouchableOpacity>

          {this.props.services.sequence.showPlayItemButton &&
            <TouchableOpacity style={styles.bigButton} onPress={this.handlePlayNow}>
                <Text>Play next item now</Text>
            </TouchableOpacity>
          }

          <TouchableOpacity style={styles.bigButton} onPress={this.handleStop}>
              <Text>Stop sequence</Text>
          </TouchableOpacity>
        </View>

        {this.renderSequenceInfo()}
        
        <View style={globalStyles.buttons}>
          
          {/*
          TODO: hook up to challenge service
          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Sequence Challenge</Text>
            <Switch value={this.state.challengeMode} onValueChange={this.handleChallengeModeSwitch}/>
            <Text>{this.props.challenge && this.state.challengeMode ? "players: " + Object.keys(this.props.challenge.uuids).length : ""}</Text>
          </View>

          <View style={styles.control}>
            <Text style={globalStyles.titleText}>Autostart sequence</Text>
            <Switch value={this.state.autoStartSequence} onValueChange={this.handleAutoStartSequenceSwitch}/>
          </View>

          <Text>{this.state.challengeMode ? JSON.stringify(this.props.challenge) : ""}</Text>
          */}

          <Gesture onEinsatz={this.handleEinsatz}/>
        </View>
                    
      </View>
    );
  }
}

export default withServices(Sequence);

/*  
TODO: move to challenge service

export default withTracker(params=>{
  Meteor.subscribe('events.all', () => {
    Meteor.ddp.on("added", message => {
      //console.log(message);
      // check if event originated from this user
      if(message.fields.userUuid == userUuid) {
        return;
      }
      // event originated from someone else
      if(message.fields.type == "button pressed") {
        if(!playScheduled) {
          console.log("received message to start playing from other device");
          if(autoStartSequence) {
            // HOW TO ACCESS METHOD HERE?
            //this.handleStartSequence(message.fields.startTime);
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
})(Sequencer); */

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
