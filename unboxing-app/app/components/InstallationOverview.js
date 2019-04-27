import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles, colors} from '../../config/globalStyles';
import UIText from './UIText'

import {gameService, storageService} from '../services';

import challengeBackground from '../../assets/img/Inactive.png'
import userMarker from '../../assets/img/User.png'

const buttonPositions = [{x:10,y:10},{x:200,y:20},{x:400,y:40},{x:20,y:100},{x:10,y:400},{x:180,y:120},{x:450,y:300}] 

class InstallationOverview extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderChallenge = (challenge, index) => {
    return(
      <TouchableOpacity
        key={challenge._id}
        onPress={()=>{
          gameService.joinChallengeInstallation(challenge);
        }}
        style = {{
          margin: 20, 
          alignItems: "center", 
          justifyContent: "center", 
          position: "absolute", 
          left: buttonPositions[index].x, 
          top: buttonPositions[index].y,
          width: 200
        }}
      >
        <ImageBackground 
            imageStyle={{resizeMode: 'stretch'}}
            style={{height: 60, width: 60, alignItems: "center", justifyContent: "center"}}
            source={challengeBackground}>
            <UIText size="xl" verticalCenter>{challenge.shorthand}</UIText>
            <Image style={{position: "absolute", bottom: -8, left: 11}} source={userMarker}/>
        </ImageBackground>
         
        <UIText size="m" style={{textAlign: "center"}}>{storageService.getSequenceNameFromChallenge(challenge).toUpperCase()}</UIText>    
      </TouchableOpacity>
    )
  }
  

  render() {

    const challenges = this.props.installation ? this.props.installation.challenges : [];
    const challengeButtons = challenges.map((challenge, index) => {return this.renderChallenge(challenge, index)});
    
    return (
      <View style={{width: "100%", height: "100%"}}> 
        {challengeButtons}
      </View>
    );
  }
}

export default InstallationOverview;