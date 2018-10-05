import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withServices} from './ServiceConnector';

import Sequence from './Sequence';
import TrackSelector from './TrackSelector';

class ChallengeView extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const challenge = this.props.services.game.activeChallenge;
    return (
      <View>
        <Text style={globalStyles.titleText}>Challenge {challenge.name}</Text>
        <Text>{challenge.instructions}</Text>

        <TrackSelector sequence_id={challenge.sequence_id}/>
        <Sequence/>

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
  },  
  buttonSelected: {
    color: 'green'
  }
});
