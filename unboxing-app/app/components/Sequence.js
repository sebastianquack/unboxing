import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import Gesture from './Gesture';

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
    this.handleEinsatz = this.handleEinsatz.bind(this);
  }

  componentDidMount() {
    this.updateInterval = setInterval(this.updateSequenceInfo, 200);
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval);
  }

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
          {this.props.services.sequence.showPlayItemButton &&
            <TouchableOpacity style={styles.bigButton} onPress={gameService.handlePlayNextItemButton}>
                <Text>Play</Text>
            </TouchableOpacity>
          }

          {this.props.services.sequence.currentItem &&
            <TouchableOpacity style={styles.bigButton} onPress={gameService.handleStopButton}>
                <Text>Stop</Text>
            </TouchableOpacity>
          }

        </View>

        {this.renderSequenceInfo()}
        
        <View style={globalStyles.buttons}>
          <Gesture onEinsatz={this.handleEinsatz}/>
        </View>
                    
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
