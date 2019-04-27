import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import UIText from './UIText'

import {gameService} from '../services';

class InstallationOverview extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderChallenge = (challenge) => {
    return(
      <TouchableOpacity
        key={challenge._id}
        onPress={()=>{
          gameService.joinChallengeInstallation(challenge);
        }}
        style = {{marginTop: 20, marginLeft: 20, width: 200, height: 100, backgroundColor: "blue", alignItems: "center", justifyContent: "center"}}
      >
        <UIText>{challenge.name}</UIText>    
      </TouchableOpacity>
    )
  }
  

  render() {

    const challenges = this.props.installation ? this.props.installation.challenges : [];
    const challengeButtons = challenges.map(this.renderChallenge);
    
    return (
      <View style={{width: "100%", height: "100%", backgroundColor: "red"}}> 
        {challengeButtons}
      </View>
    );
  }
}

export default InstallationOverview;