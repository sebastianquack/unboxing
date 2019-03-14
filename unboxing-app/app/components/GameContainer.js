import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService} from './ServiceConnector';

import ScreenContainer from './ScreenContainer'

import ChallengeSelector from './ChallengeSelector';
import ChallengeView from './ChallengeView';

class GameContainer extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    const content = [
      this.props.gameService.gameMode == "manual" && !this.props.gameService.activeChallenge && <ChallengeSelector key="1"/>,
      this.props.gameService.activeChallenge && <ChallengeView key="2"/>
    ]

    return (
      <View>
        <ScreenContainer
          primaryScreen={content}
        />

      </View>
    );
  }
}

export default withGameService(GameContainer);
