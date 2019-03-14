import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService, withSequenceService} from './ServiceConnector';

import Sequence from './Sequence';
import SequenceVisualizer from './SequenceVisualizer';
import TrackSelector from './TrackSelector';

import {gameService, sequenceService} from '../services';

class ChallengeView extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const place = this.props.gameService.activePlace;
    const challenge = this.props.gameService.activeChallenge;
    const challengeStatus = this.props.gameService.challengeStatus;
    const sequence = this.props.sequenceService.currentSequence;

    return (
      <View>

        {sequence &&
          <Text style={globalStyles.titleText}>{sequence.name}</Text>
        }
        <Text style={globalStyles.subTitleText}>{challenge.name}</Text>
        
        {challengeStatus == "navigate" &&
          <View>
            <Text style={globalStyles.subtitleText}>Navigate to {place.description}. Tap 'I'm here' when you're there.</Text>
            
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
                currentTime={this.props.sequenceService.sequenceTimeVisualizer}
              />
            <Text style={globalStyles.titleText}>Select your instrument!</Text>
            <TrackSelector sequence={this.props.sequenceService.currentSequence}/>
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
              sequenceService.cancelItemsAndSounds()
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
