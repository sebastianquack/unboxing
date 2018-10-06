import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withServices} from './ServiceConnector';

import Sequence from './Sequence';
import TrackSelector from './TrackSelector';
import NearbyStatus from './NearbyStatus';

import {gameService} from '../services';

class ChallengeView extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const challenge = this.props.services.game.activeChallenge;
    return (
      <View>
        <TouchableOpacity style={styles.button} onPress={()=>{gameService.leaveChallenge()}}>
          <Text>back</Text>
        </TouchableOpacity>
        <Text style={globalStyles.titleText}>{challenge.name}</Text>
        <Text>{challenge.instructions}</Text>
        <Text>
          sequence_item_autoplay: { challenge.sequence_item_autoplay } {"\n"}
          sequence_loop: { challenge.sequence_loop.toString() }
        </Text>
        

        <TrackSelector sequence_id={challenge.sequence_id}/>
        <Sequence/>
        <NearbyStatus/>

      </View>
    );
  }
}

export default withServices(ChallengeView);

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
