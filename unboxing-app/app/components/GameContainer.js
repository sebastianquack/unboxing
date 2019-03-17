import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {withGameService, withSequenceService} from './ServiceConnector';
import {gameService, sequenceService} from '../services';

import ScreenContainer from './ScreenContainer'
import PrimaryScreen from './PrimaryScreen'
import SecondaryScreen from './SecondaryScreen'
import StatusBar from './StatusBar'
import Button from './Button'

import ChallengeSelector from './ChallengeSelector';
import ChallengeView from './ChallengeView';
import TrackSelector from './TrackSelector';



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

    const modalContent = this.props.gameService.showInstrumentSelector ? 
      <TrackSelector sequence={this.props.sequenceService.currentSequence}/> : null
    
    const buttonModal = this.props.gameService.showInstrumentSelector ? 
      <Button type="wide" text="Auswählen" onPress={()=>{gameService.handleCloseModal()}}/> : null

    const instrumentName = this.props.sequenceService.currentTrack ? this.props.sequenceService.currentTrack.name : null

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
          secondaryScreen = {<SecondaryScreen type="instrument" instrument={instrumentName} />}
          buttonRight = {<Button text="Play" onPress={()=>{gameService.handlePlayButton()}}/>}
          buttonMid = {<Button type="change" onPress={()=>{gameService.handleMidButton()}} />}
          buttonLeft = {<Button type="home" text="Back" onPress={()=>{gameService.handleBackButton()}}/>}
          statusBar = {<StatusBar title={this.props.gameService.statusBarTitle} description={this.props.gameService.statusBarSubtitle} />}
          modalContent = {modalContent}      
          buttonModal = {buttonModal}    
        />

      </View>
    );
  }
}

export default withGameService(withSequenceService(GameContainer));
