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
    const showInstrumentSelector = this.props.gameService.showInstrumentSelector;

    return (
      <View>
        
        {challengeStatus == "navigate" &&
          <View>
            <Text style={globalStyles.subtitleText}>Navigate to {place.description}. Tap 'Play' when you're there.</Text>
          </View>
        }

        {challengeStatus == "prepare" && !showInstrumentSelector &&       
          <View>
            <Text>{challenge.instructions}</Text>
            <SequenceVisualizer 
              sequence={this.props.sequenceService.currentSequence}
              track={this.props.sequenceService.currentTrack}
              item={this.props.sequenceService.currentItem}
              controlStatus={this.props.sequenceService.controlStatus}
              currentTime={this.props.sequenceService.sequenceTimeVisualizer}
            />
          </View>
        }
        
        {challengeStatus == "play" && !showInstrumentSelector &&       
          <View>
            <Sequence/>
          </View>
        }

        {challengeStatus != "navigate" && showInstrumentSelector &&
          <View>
            <TrackSelector sequence={this.props.sequenceService.currentSequence}/>
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
