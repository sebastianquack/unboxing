import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService, withSequenceService} from './ServiceConnector';

import Sequence from './Sequence';
import SequenceVisualizer from './SequenceVisualizer';
import TrackSelector from './TrackSelector';
import NearbyStatus from './NearbyStatus';

import {gameService, sequenceService} from '../services';

class ChallengeView extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const challenge = this.props.gameService.activeChallenge;
    const challengeStatus = this.props.gameService.challengeStatus;
    return (
      <View>

        <View><Text style={globalStyles.titleText}>{challenge.name}</Text></View>
        
        
        {challengeStatus == "navigate" &&
          <View>
            <Text>{challenge.instructions}</Text>
            <Text style={globalStyles.titleText}>Here's how to get to {challenge.name}</Text>
            <Text>Navigation placeholder</Text>
            <TouchableOpacity style={styles.button} onPress={()=>{
              gameService.setActiveChallengeStatus("prepare");            
            }}>
              <Text>I'm here!</Text>
            </TouchableOpacity>
          </View>
        }

        {challengeStatus == "prepare" &&        
          <View>
            <Text>{challenge.instructions}</Text>
              <SequenceVisualizer 
                sequence={this.props.sequenceService.currentSequence}
                track={this.props.sequenceService.currentTrack}
                item={this.props.sequenceService.currentItem}
                controlStatus={this.props.sequenceService.controlStatus}
              />
            <Text style={globalStyles.titleText}>Select your instrument!</Text>
            <TrackSelector sequence_id={challenge.sequence_id}/>
            <TouchableOpacity style={styles.button} onPress={()=>{
              gameService.setActiveChallengeStatus("play");            
            }}>
              <Text>ready to play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={()=>{
              gameService.leaveChallenge();
            }}>
              <Text>stop challenge and leave</Text>
            </TouchableOpacity>
          </View>
        }
        
        {challengeStatus == "play" &&        
          <View>
            <Sequence/>
            <TouchableOpacity style={styles.button} onPress={()=>{
              gameService.handleStopButton();
              gameService.setActiveChallengeStatus("prepare");
            }}>
              <Text>switch instrument or leave</Text>
            </TouchableOpacity>
          </View>
        }
                  
      </View>
    );
  }
}

export default withSequenceService(withGameService(ChallengeView));

const styles = StyleSheet.create({
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
    width: "25%"
  },  
  buttonSelected: {
    color: 'green'
  }
});
