import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withStorageService} from './ServiceConnector';

import {gameService} from '../services';

class ChallengeSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderPlace = this.renderPlace.bind(this)
    this.renderChallenge = this.renderChallenge.bind(this)
  }

  renderPlace(place) {
    return (
      <TouchableOpacity
          style={styles.button}
          key={place._id}
          onPress={()=>{
            console.log("place selected", place);
            gameService.setupMinimalWalk(place);
          }}
        >
        <Text>{place.description} (place)</Text>
      </TouchableOpacity>
    )
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
        <Text>{challenge.name} (challenge)</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const challenges = this.props.storageService.collections.challenges ? this.props.storageService.collections.challenges : [];
    const places = this.props.storageService.collections.places ? this.props.storageService.collections.places : [];
    return (
      <View style={{width: "50%", marginTop: 100, paddingBottom: 50}}>
        {places.map(this.renderPlace)}
        {challenges.map(this.renderChallenge)}
      </View>
    );
  }
}

export default withStorageService(ChallengeSelector);

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
