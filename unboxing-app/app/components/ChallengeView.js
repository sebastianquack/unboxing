import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService} from './ServiceConnector';

import Sequence from './Sequence';
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
            <Text style={globalStyles.titleText}>Select your instrument!</Text>
            <TrackSelector sequence_id={challenge.sequence_id}/>
            <TouchableOpacity style={styles.button} onPress={()=>{
              gameService.setActiveChallengeStatus("play");            
            }}>
              <Text>ready to play</Text>
            </TouchableOpacity>
          </View>
        }
        
        {challengeStatus == "play" &&        
          <Sequence/>
        }

        <TouchableOpacity style={styles.button} onPress={()=>{
          if(challengeStatus == "play") {
            gameService.setActiveChallengeStatus("prepare");
          } else {
            gameService.leaveChallenge();
          }
        }}>
          <Text>back</Text>
        </TouchableOpacity>
        
          
      </View>
    );
  }
}

export default withGameService(ChallengeView);

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
