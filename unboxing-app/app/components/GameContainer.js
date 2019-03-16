import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';
import {withGameService} from './ServiceConnector';

import ScreenContainer from './ScreenContainer'
import PrimaryScreen from './PrimaryScreen'
import SecondaryScreen from './SecondaryScreen'
import StatusBar from './StatusBar'
import Button from './Button'

import ChallengeSelector from './ChallengeSelector';
import ChallengeView from './ChallengeView';

import {gameService} from '../services';

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
          primaryScreen = {<PrimaryScreen
              backgroundColor="active"
              // backgroundFlow
              // mainContent = {<Text>Content</Text>}
              // overlayContent = {<Text>Overlay Content -- DIRIGENT</Text>}
              scrollContent = { content }
            />}
          secondaryScreen = {<SecondaryScreen type="instrument" instrument="piano" />}
          buttonRight = {<Button text="Play" onPress={()=>{gameService.handlePlayButton()}}/>}
          buttonMid = {<Button type="change" onPress={()=>{gameService.handleMidButton()}} />}
          buttonLeft = {<Button type="home" text="Back" onPress={()=>{gameService.handleBackButton()}}/>}
          statusBar = {<StatusBar title={this.props.gameService.statusBarTitle} description={this.props.gameService.statusBarSubtitle} />}
        />

      </View>
    );
  }
}

export default withGameService(GameContainer);
