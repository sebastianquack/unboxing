import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService, withSequenceService} from './ServiceConnector';

import Sequence from './Sequence';
import SequenceVisualizer from './SequenceVisualizer';
import TrackSelector from './TrackSelector';

import {gameService, sequenceService} from '../services';

import loadNavigationAssets from '../../config/navigationAssets'
const navigationAssets = loadNavigationAssets();

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
        
        {challengeStatus == "navigate" &&
          <View>
              <Image
                source={navigationAssets.default.navigation}
                style={{
                  height: "100%",
                  width: "100%"
                }}
              />
          </View>
        }

        {challengeStatus == "prepare" &&       
          <View>
            {/*<SequenceVisualizer 
              sequence={this.props.sequenceService.currentSequence}
              track={this.props.sequenceService.currentTrack}
              item={this.props.sequenceService.currentItem}
              controlStatus={this.props.sequenceService.controlStatus}
              currentTime={this.props.sequenceService.sequenceTimeVisualizer}
            >*/}
          </View>
        }
        
        {challengeStatus == "play" &&       
          <View>
            <Sequence/>
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
