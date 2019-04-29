import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService, withSequenceService} from './ServiceConnector';

import SequenceVisualizer from './SequenceVisualizer';
import TrackSelector from './TrackSelector';
import SensorModulator from './SensorModulator';

import {gameService, sequenceService} from '../services';

class ChallengeView extends React.PureComponent { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const walkStatus = this.props.gameService.walkStatus;
    const place = this.props.gameService.activePlace;
    const challenge = this.props.gameService.activeChallenge;
    const challengeStatus = this.props.gameService.challengeStatus;
    const sequence = this.props.sequenceService.currentSequence;

    return (
      <View> 
        
        {challengeStatus == "navigate" && walkStatus == "ongoing" &&
          <Image
              source={{uri: "file:///sdcard/unboxing/files/places/" + this.props.gameService.activePlace.tag + "/" + this.props.gameService.activePlace.navigationDiagram}}
              style={{
                height: "100%",
                width: "100%"
              }}
            />
        }

        {challengeStatus == "prepare" &&       
          <View style={{opacity:0.25}}>
            <SequenceVisualizer />
          </View>
        }
        
        {challengeStatus == "play" &&       
          <View>
            <SequenceVisualizer magnification />
            <SensorModulator mode={"volume tilt"} item={this.props.sequenceService.currentItem}/>
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
