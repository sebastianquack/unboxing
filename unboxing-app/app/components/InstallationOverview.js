import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles, colors} from '../../config/globalStyles';
import UIText from './UIText'

import {gameService, storageService} from '../services';
import {withGameService} from './ServiceConnector';

import challengeBackground from '../../assets/img/Inactive.png'
import userMarker from '../../assets/img/User.png'

const buttonPositions = [
  {x:15,y:50},  // 1
  {x:200,y:60}, // 2
  {x:400,y:80}, // 3
  {x:30,y:230}, // 4
  {x:10,y:380}, // 5
  {x:180,y:190},// 6
  {x:300,y:300},// 7
  {x:450,y:410} // 8
] 

const selectedIndex = 1;

class InstallationOverview extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.props.installation != nextProps.installation) {
      return true;
    }
    if(JSON.stringify(this.props.gameService.installationActivityMap) !== JSON.stringify(nextProps.gameService.installationActivityMap)) {
      return true;
    }
    return false;
  }

  renderChallenge = (challenge, index, activityMap) => {
    const available = !activityMap || activityMap[challenge._id] == "active";
    return(
      <TouchableOpacity
        key={challenge._id}
        onPress={()=>{
          if(available) gameService.joinChallengeInstallation(challenge);
        }}
        style = {{
          margin: 20, 
          position: "absolute", 
          left: buttonPositions[index].x, 
          top: buttonPositions[index].y,
          width: 160
        }}
      >
      <View style={{
        opacity: available ? 1 : 0.5,
        alignItems: "center", 
        justifyContent: "center", 
      }}
      >
        <ImageBackground 
            imageStyle={{resizeMode: 'stretch'}}
            style={{height: 60, width: 60, alignItems: "center", justifyContent: "center"}}
            source={challengeBackground}>
            <UIText size="xl" verticalCenter>{challenge.shorthand}</UIText>
            { (activityMap && activityMap[challenge._id] == "active") && 
              <Image style={{position: "absolute", bottom: -8, left: 11}} source={userMarker}/>
            }
        </ImageBackground>
        <UIText size="m" style={{textAlign: "center"}}>{storageService.getSequenceNameFromChallenge(challenge).toUpperCase()}</UIText>
      </View>
      </TouchableOpacity>
    )
  }
  

  render() {

    const challenges = this.props.installation ? this.props.installation.challenges : [];
    const challengeButtons = challenges.map((challenge, index) => {return this.renderChallenge(challenge, index, this.props.gameService.installationActivityMap)});
    
    return (
      <View style={{width: "100%", height: "100%"}}> 
        {challengeButtons}
      </View>
    );
  }
}

export default withGameService(InstallationOverview);
