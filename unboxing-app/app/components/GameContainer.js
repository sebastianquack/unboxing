import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {withGameService, withSequenceService, withNearbyService, withPeakService} from './ServiceConnector';
import {gameService, sequenceService} from '../services';

import ScreenContainer from './ScreenContainer'
import PrimaryScreen from './PrimaryScreen'
import SecondaryScreen from './SecondaryScreen'
import StatusBar from './StatusBar'
import Button from './Button'
import ConnectionIndicator from './ConnectionIndicator'

import ChallengeSelector from './ChallengeSelector';
import ChallengeView from './ChallengeView';
import TrackSelector from './TrackSelector';
import {InfoStream} from './InfoStream';

class GameContainer extends React.Component { 
  constructor(props) { 
    super(props);
    this.state = {};
  }

  render() {

    let mainContent = null; 
    let scrollContent = null;
    let infoStreamContent = null;
    let overlayContent = null;
    let secondaryScreen = null;
    let buttonLeft = null;
    let buttonMid = null;
    let buttonRight = null;
    let modalContent = null;
    let buttonModal = null;

    // configure content
    if(this.props.gameService.gameMode == "manual" && !this.props.gameService.activeChallenge) {
      scrollContent = <ChallengeSelector/>
    } else {
      mainContent = <ChallengeView/>        
    }
        
    // configure modal
    if(this.props.gameService.showInstrumentSelector) {
        modalContent = <TrackSelector sequence={this.props.sequenceService.currentSequence}/>
        buttonModal = <Button type="wide" text="Auswählen" onPress={()=>{gameService.handleCloseModal()}}/>
    }
    
    // configure secondary screen and buttons
    const instrumentName = this.props.sequenceService.currentTrack ? this.props.sequenceService.currentTrack.name : null
    
    switch(this.props.gameService.challengeStatus) {
      case "navigate": 
        buttonRight = <Button text="Check In" onPress={()=>{gameService.handlePlayButton()}}/>; 
        secondaryScreen = <SecondaryScreen type="navigation" target="default" />;
        break;
      
      case "prepare": 
        buttonLeft = <Button type="home" text="Exit" onPress={()=>{gameService.handleBackButton()}}/>;
        buttonRight = instrumentName ? <Button text="Play" onPress={()=>{gameService.handlePlayButton()}}/> : null;
        secondaryScreen = <SecondaryScreen type="instrument" instrument={instrumentName} />;
        buttonMid= <Button type="change" onPress={()=>{gameService.handleMidButton()}} />;
        overlayContent = <ConnectionIndicator current={this.props.nearbyService.numConnections + 1} max={this.props.sequenceService.currentSequence.tracks.length} />;
        break;
 
      case "play":
        buttonLeft = <Button type="home" text="Back" onPress={()=>{gameService.handleBackButton()}}/>;
        secondaryScreen = <SecondaryScreen type="instrument" instrument={instrumentName} />;
        buttonMid= <Button type="change" onPress={()=>{gameService.handleMidButton()}} />;
        break;
    }

    return (
      <View>
        <ScreenContainer
          primaryScreen = {<PrimaryScreen
              backgroundColor={this.props.peakService.isDown ? "active" : "passive" }
              // backgroundFlow
              mainContent = { mainContent }
              overlayContent = { overlayContent }
              scrollContent = { scrollContent }
              infoStreamContent = { this.props.gameService.infoStream.length ? <InfoStream/> : null }
            />}
          secondaryScreen = {secondaryScreen}
          buttonRight = {buttonRight}
          buttonMid = {buttonMid}
          buttonLeft = {buttonLeft}
          statusBar = {<StatusBar title={this.props.gameService.statusBarTitle} description={this.props.gameService.statusBarSubtitle} />}
          modalContent = {modalContent}      
          buttonModal = {buttonModal}    
        />

      </View>
    );
  }
}

export default withPeakService(withNearbyService(withGameService(withSequenceService(GameContainer))));
