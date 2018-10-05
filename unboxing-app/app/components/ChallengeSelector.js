import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withServices} from './ServiceConnector';

import {gameService} from '../services';

class ChallengeSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderChallenge = this.renderChallenge.bind(this)
  }

  renderChallenge(challenge) {
    return (
      <TouchableOpacity
          style={styles.button}
          key={challenge._id}
          onPress={()=>{
            console.log("challenge selected", challenge);
            gameService.setActiveChallenge(challenge);
          }}
        >
        <Text>{challenge.name}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const challenges = this.props.services.storage.collections.challenges ? this.props.services.storage.collections.challenges : [];
    return (
      <View style={{width: "50%"}}>
        <Text style={globalStyles.titleText}>Challenge List</Text>
        {challenges.map(this.renderChallenge)}
      </View>
    );
  }
}

export default withServices(ChallengeSelector);

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
