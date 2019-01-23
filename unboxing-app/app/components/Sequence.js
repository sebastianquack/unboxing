import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import compose from 'lodash.flowright'

import {globalStyles} from '../../config/globalStyles';
import SequenceVisualizer from './SequenceVisualizer';
import SensorModulator from './SensorModulator';
import {withSequenceService, withGestureService, withGameService, withSoundService} from './ServiceConnector';
import {sequenceService, gameService, soundService} from '../services';

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
    this.countDownDisplayDelay = 1;
  }

  componentDidMount() {
    this.updateInterval = setInterval(this.updateSequenceInfo, 200);
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

  // called every second to calculate sequence info
  updateSequenceInfo() {
    const currentTime = soundService.getSyncTime(); // get the synchronized time
    const currentTimeInSequence = currentTime - this.props.sequenceService.loopStartedAt;
    const playbackTime = currentTime - this.props.sequenceService.playbackStartedAt;

    if(this.props.sequenceService.controlStatus == "playing") {
      this.setState({
        currentTimeInSequence: currentTimeInSequence,
        playbackTime: playbackTime
      });
    } else {
      this.setState({
        currentTimeInSequence: 0,
        playbackTime: 0
      });
    }

    if(this.props.sequenceService.nextItem) {
      
      let timeToNextItem = this.props.sequenceService.nextItem.startTime - currentTimeInSequence
      
      this.setState({
        timeToNextItem: timeToNextItem > 0 ? timeToNextItem + this.countDownDisplayDelay : 0
      });
      
    } else {
      this.setState({timeToNextItem: null});   
    }

    if(this.props.sequenceService.currentItem) {
      let timeInCurrentItem = currentTimeInSequence - this.props.sequenceService.currentItem.startTime
      this.setState({timeInCurrentItem: timeInCurrentItem});   
    } else {
      this.setState({timeInCurrentItem: null});   
    }
  }

  // renders current sequence display, called when info changes
  renderSequenceDebugInfo() {
    const activeChallenge = this.props.gameService.activeChallenge;
    const currentSequence = this.props.sequenceService.currentSequence;
    const currentTrack = this.props.sequenceService.currentTrack;
    const loopCounter = this.props.sequenceService.loopCounter;
    
    const nextItem = this.props.sequenceService.nextItem;
    const currentItem = this.props.sequenceService.currentItem;
    const scheduledItem = this.props.sequenceService.scheduledItem;
    
    const controlStatus = this.props.sequenceService.controlStatus;
    
    return(
      <View>
          <Text>
            activeChallenge: {activeChallenge ? JSON.stringify(activeChallenge) : "none"} {"\n"}{"\n"}
            currentSequence: {currentSequence ? JSON.stringify(currentSequence) : "none"} {"\n"}{"\n"}
            controlStatus: { controlStatus } {"\n"}
            currentTrack: {currentTrack ? currentTrack.name : "none"} {"\n"}{"\n"}
            Playback time: {Math.floor(this.state.playbackTime / 1000)} {"\n"}
            Loop Counter: {loopCounter} {"\n"}
            Sequence playback position: {Math.floor(this.state.currentTimeInSequence / 1000)} {"\n"}
            
            Next item: {nextItem ? JSON.stringify(nextItem) : "none"} ({this.props.sequenceService.controlStatus == "playing" ? Math.floor(this.state.timeToNextItem / 1000) : ""}) {"\n"}
            Scheduled item: {scheduledItem ? JSON.stringify(scheduledItem) : "none"} {"\n"}
            Current item: {currentItem ? JSON.stringify(currentItem) : "none"} ({this.props.sequenceService.controlStatus == "playing" ? Math.floor(this.state.timeInCurrentItem / 1000) : ""}) {"\n"}
            
            Gesture Recognition: { this.props.gestureService.isRecognizing ? "on" : "off" } {"\n"}
            Gesture: { this.props.gestureService.activeGesture ? this.props.gestureService.activeGesture.name : "-" } {"\n"} {"\n"}

            soundService soundCounter: { this.props.soundService.soundCounter }
          </Text>
          {controlStatus == "ready" &&
            <TouchableOpacity style={styles.button} onPress={gameService.startSequence}>
                <Text>Start Sequence</Text>
            </TouchableOpacity>
          }
      </View>
    )
  }

  render() {

    return (
      <View> 
        <SequenceVisualizer 
          sequence={this.props.sequenceService.currentSequence}
          track={this.props.sequenceService.currentTrack}
          item={this.props.sequenceService.currentItem}
          controlStatus={this.props.sequenceService.controlStatus}
          currentTime={this.props.sequenceService.sequenceTimeVisualizer}
        />
          <View><Text style={{fontSize: 30}}>{this.props.sequenceService.nextActionMessage}</Text></View>

          {this.props.sequenceService.showPlayItemButton && this.props.gameService.debugMode &&
              <TouchableOpacity style={styles.bigButton} onPress={gameService.handlePlayNextItemButton}>
                  <Text>Play</Text>
              </TouchableOpacity>
          }

          {this.props.gameService.debugMode && this.props.sequenceService.nextItem && this.state.timeToNextItem < 0 &&
            <TouchableOpacity style={styles.bigButton} onPress={gameService.handleSkipButton}>
                  <Text>Skip</Text>
            </TouchableOpacity>
          }

          {this.props.sequenceService.currentItem &&
            <View>
              <TouchableOpacity style={styles.bigButton} onPress={gameService.handleStopButton}>
                  <Text>Stop</Text>
              </TouchableOpacity>
            </View>
          }
        <Text style={{fontSize: 50}}>{ this.props.sequenceService.beatsToNextItem }</Text>
        {gameService.debugMode &&
          <View style={{width:"25%"}}>
            <Text>Beat Tick Off/On</Text>         
            <Switch value={this.props.sequenceService.beatTickActive} onValueChange={sequenceService.toggleBeatTick}/>
          </View>
        }
        <SensorModulator mode={this.props.sequenceService.currentItem ? this.props.sequenceService.currentItem.sensorModulation : ""}/>
        {this.props.gameService.debugMode ? this.renderSequenceDebugInfo() : null}
      </View> 
    );
  }
}

export default compose(withSequenceService, withGestureService, withGameService, withSoundService)(Sequence);

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
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
