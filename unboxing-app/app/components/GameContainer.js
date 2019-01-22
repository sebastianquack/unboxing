import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withServices} from './ServiceConnector';

import ChallengeSelector from './ChallengeSelector';
import ChallengeView from './ChallengeView';

class GameContainer extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        {this.props.gameService.challengeStatus != "list" ? 
          <ChallengeView/> : <ChallengeSelector/>
        }
      </View>
    );
  }
}

export default withServices(GameContainer, ["gameService"]);
