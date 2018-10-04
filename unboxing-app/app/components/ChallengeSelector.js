import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withServices} from './ServiceConnector';

class ChallengeSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderChallenge = this.renderChallenge.bind(this)
  }

  renderChallenge(challenge) {
    return (
      <TouchableOpacity
          key={challenge._id}
          onPress={(challenge)=>{console.log("challenge selected: " + challenge.name)}}
        >
        <Text>{challenge.name}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    //const challenges = this.props.services.storage.collections.challenges.map(this.renderChallenge);
    const challenges = [{_id: "1", name: "test challenge"}].map(this.renderChallenge);
    return (
      <View style={{width: "50%"}}>
        <Text style={globalStyles.titleText}>Challenges</Text>
        {challenges}
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
