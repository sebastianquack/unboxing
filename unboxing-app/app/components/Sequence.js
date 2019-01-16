import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import {globalStyles} from '../../config/globalStyles';
import SequenceVisualizer from './SequenceVisualizer';

import SensorModulator from './SensorModulator';
import {withServices} from './ServiceConnector';
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
    const currentTimeInSequence = currentTime - this.props.services.sequence.startedAt;
    const playbackTime = currentTime - this.props.services.sequence.playbackStartedAt;

    if(this.props.services.sequence.controlStatus == "playing") {
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

    if(this.props.services.sequence.nextItem) {
      
      let timeToNextItem = this.props.services.sequence.nextItem.startTime - currentTimeInSequence
      
      this.setState({
        timeToNextItem: timeToNextItem > 0 ? timeToNextItem + this.countDownDisplayDelay : 0
      });
      
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
  renderSequenceDebugInfo() {
    const currentSequence = this.props.services.sequence.currentSequence;
    const currentTrack = this.props.services.sequence.currentTrack;
    const currentItem = this.props.services.sequence.currentItem;
    const nextItem = this.props.services.sequence.nextItem;
    const controlStatus = this.props.services.sequence.controlStatus;
    
    return(
      <View>
          <Text>
            currentSequence: {currentSequence ? currentSequence.name : "none"} {"\n"}
            controlStatus: { controlStatus } {"\n"}
            currentTrack: {currentTrack ? currentTrack.name : "none"} {"\n"}
            Playback time: {Math.floor(this.state.playbackTime / 1000)} {"\n"}
            Sequence playback position: {Math.floor(this.state.currentTimeInSequence / 1000)} {"\n"}
            custom_duration: { currentSequence ? currentSequence.custom_duration : "?" } {"\n"}
            Current item: {currentItem ? currentItem.path : "none"} ({this.props.services.sequence.controlStatus == "playing" ? Math.floor(this.state.timeInCurrentItem / 1000) : ""}) {"\n"}
            Next item: {nextItem ? nextItem.path : "none"} ({this.props.services.sequence.controlStatus == "playing" ? Math.floor(this.state.timeToNextItem / 1000) : ""}) {"\n"}
            Gesture Recognition: { this.props.services.gestures.isRecognizing ? "on" : "off" } {"\n"}
            Gesture: { this.props.services.gestures.activeGesture ? this.props.services.gestures.activeGesture.name : "-" }
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
          sequence={this.props.services.sequence.currentSequence}
          track={this.props.services.sequence.currentTrack}
          item={this.props.services.sequence.currentItem}
          controlStatus={this.props.services.sequence.controlStatus}
          currentTime={this.state.currentTimeInSequence}
        />
          <View><Text style={{fontSize: 30}}>{this.props.services.sequence.nextActionMessage}</Text></View>

          {this.props.services.sequence.showPlayItemButton && this.props.services.game.debugMode &&
              <TouchableOpacity style={styles.bigButton} onPress={gameService.handlePlayNextItemButton}>
                  <Text>Play</Text>
              </TouchableOpacity>
          }

          {this.props.services.game.debugMode && this.props.services.sequence.nextItem && this.state.timeToNextItem < 0 &&
            <TouchableOpacity style={styles.bigButton} onPress={gameService.handleSkipButton}>
                  <Text>Skip</Text>
            </TouchableOpacity>
          }

          {this.props.services.sequence.currentItem &&
            <View>
              <TouchableOpacity style={styles.bigButton} onPress={gameService.handleStopButton}>
                  <Text>Stop</Text>
              </TouchableOpacity>
            </View>
          }
        <Text style={{fontSize: 50}}>{ this.props.services.sequence.beatsToNextItem }</Text>
        {gameService.debugMode &&
          <View style={{width:"25%"}}>
            <Text>Beat Tick Off/On</Text>         
            <Switch value={this.props.services.sequence.beatTickActive} onValueChange={sequenceService.toggleBeatTick}/>
          </View>
        }
        <SensorModulator mode={this.props.services.sequence.currentItem ? this.props.services.sequence.currentItem.sensorModulation : ""}/>
        {this.props.services.game.debugMode ? this.renderSequenceDebugInfo() : null}
      </View> 
    );
  }
}

export default withServices(Sequence);

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
