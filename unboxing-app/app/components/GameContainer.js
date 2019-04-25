import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {withGameService, withSequenceService, withPeakService} from './ServiceConnector';
import {gameService, sequenceService, storageService} from '../services';

import ScreenContainer from './ScreenContainer'
import PrimaryScreen from './PrimaryScreen'
import SecondaryScreen from './SecondaryScreen'
import StatusBar from './StatusBar'
import Button from './Button'
import ConnectionIndicator from './ConnectionIndicator'
import VideoPlayer from './VideoPlayer'

import ChallengeView from './ChallengeView';
import TrackSelector from './TrackSelector';
import {InfoStream} from './InfoStream';
import Welcome from './Welcome';
import SensorModulator from './SensorModulator';
import Instructor from './Instructor';

class GameContainer extends React.Component { 
  constructor(props) { 
    super(props);
    this.state = {};
  }

  render() {

    let statusBar = null;
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
    let backgroundContent = null;

    // configure content
    if(this.props.gameService.activeChallenge) {
      
      if(this.props.gameService.challengeStatus == "navigate" && this.props.gameService.walkStatus == "ongoing") {
        backgroundContent = this.props.gameService.activePlace ? <Image
              source={{uri: "file:///sdcard/unboxing/files/places/" + this.props.gameService.activePlace.tag + "/" + this.props.gameService.activePlace.navigationDiagram}}
              style={{
                height: "100%",
                width: "100%"
              }}
            /> : null;
      } else {
        mainContent = <ChallengeView/>        
      }

      if(!gameService.nthPlaceInTutorial(0) 
        && this.props.gameService.challengeStatus != "navigate") {
        statusBar = <StatusBar 
          title={this.props.gameService.statusBarTitle} 
          description={this.props.gameService.statusBarSubtitle} 
          steps={this.props.gameService.pathLength >= 1 ? this.props.gameService.pathLength : null}
          currentStep={this.props.gameService.pathIndex >= 0 ? this.props.gameService.pathIndex : null}
          minutesToEnd={this.props.gameService.minutesToEnd}
          endText={storageService.t("time-left")}
          midSection={
            <ConnectionIndicator 
              current={this.props.gameService.numChallengeParticipants} 
              max={this.props.sequenceService.currentSequence ? this.props.sequenceService.currentSequence.tracks.length : 0} 
            />
          }
        />  
      }

      if(gameService.nthPlaceInTutorial(0) 
        && (this.props.gameService.challengeStatus == "prepare" || this.props.gameService.challengeStatus == "play")
        ) {
       statusBar = <StatusBar 
          title={storageService.t("practice-sequence-title")} 
          description={storageService.t("practice-sequence-subtitle")} 
          minutesToEnd={this.props.gameService.minutesToEnd}
          endText={storageService.t("time-left")}
          />
      }

    } else {
      if(this.props.gameService.walkStatus != "ended" 
        && this.props.gameService.walkStatus != "tutorial-intro"
        && this.props.gameService.challengeStatus != "tutorial") {
        mainContent = <Welcome
          supertitle={storageService.t("main-title-super")}
          title={storageService.t("main-title")}
          subtitle={storageService.t("main-title-sub")}
        />
      }
    }

    
    // special case: video playback
    if(this.props.gameService.activeVideo) {
      modalContent = <VideoPlayer source={this.props.gameService.activeVideo}/> 
      buttonModal = <Button type="wide" text={storageService.t("video-close")} onPress={()=>{gameService.stopVideo()}}/>
    }

    // special case: tutorial
    if(
      this.props.gameService.walkStatus == "tutorial-intro" || 
      this.props.gameService.challengeStatus == "tutorial") {
      secondaryScreen = this.props.gameService.activePath.startInstrument ? <SecondaryScreen type="instrument" instrument={this.props.gameService.activePath.startInstrument} /> : null;
    }  

    if(this.props.gameService.walkStatus == "tutorial-intro") {
      buttonRight = <Button text={storageService.t("continue")} onPress={()=>{gameService.handleRightButton()}}/>;
    }
    
    // configure modal
    if(this.props.gameService.showInstrumentSelector) {
        modalContent = <TrackSelector selectedTracks={this.props.gameService.selectedTracks} sequence={this.props.sequenceService.currentSequence}/>
        buttonModal = <Button type="wide" text={storageService.t("close")} onPress={()=>{gameService.handleCloseModal()}}/>
    }
    
    // configure secondary screen and buttons
    const instrumentName = this.props.sequenceService.currentTrack ? this.props.sequenceService.currentTrack.name : null
    
    switch(this.props.gameService.challengeStatus) {
      case "navigate":
        if(this.props.gameService.allowCheckInButton) {
          buttonRight = <Button type="round" walk text={storageService.t("check-in")} onPress={()=>{gameService.handleRightButton()}}/>;   
        } 
        secondaryScreen = this.props.gameService.activePlace ? <SecondaryScreen type="navigation" target={this.props.gameService.activePlace.tag + this.props.gameService.activePlace.shorthand} /> : null;
        break;

      case "tutorial":
        if(this.props.gameService.tutorialStatus == "step-2-playing") {
          mainContent = <SensorModulator mode={"volume tilt"} item={{path: gameService.getPracticeSoundFile(2)}}/>     
        }
        buttonRight = this.props.gameService.tutorialStatus == "complete" ?
          <Button text={storageService.t("continue")} onPress={()=>{gameService.handleRightButton()}}/> : null;  
        overlayContent = <Instructor mode={this.props.gameService.tutorialStatus}/>   
        break;
      
      case "prepare":
        if(this.props.gameService.activePlace && !gameService.nthPlaceInTutorial(0)) {
          buttonLeft = <Button back type="wide" text={storageService.t("back")} onPress={()=>{gameService.handleLeftButton()}}/>;  
        }
        
        if(this.props.gameService.allowPlaceExit && this.props.gameService.activePath) {
          buttonRight = <Button type="home" text={storageService.t("continue")} onPress={()=>{gameService.handleLeftButton()}}/>;
        } else {
          buttonRight = instrumentName ? <Button text={storageService.t("play")} onPress={()=>{gameService.handleRightButton()}}/> : null;  
        }
        
        secondaryScreen = <SecondaryScreen type="instrument" instrument={instrumentName} />;
        if(!gameService.nthPlaceInTutorial(0)) {
          buttonMid = <Button type="change" onPress={()=>{gameService.handleMidButton()}} />;  
        }
        break;
 
      case "play":
        buttonLeft = <Button back type="wide" text={storageService.t("back")} onPress={()=>{gameService.handleLeftButton()}}/>;
        secondaryScreen = <SecondaryScreen type="instrument" instrument={instrumentName} />;
        if(!gameService.nthPlaceInTutorial(0)) {
          buttonMid= <Button type="change" onPress={()=>{gameService.handleMidButton()}} />;
        }
        break;
    }

    return (
      <View>
        <ScreenContainer
          primaryScreen = {<PrimaryScreen
              backgroundColor={this.props.peakService.isUp ? "passive" : "active" }
              // backgroundFlow
              backgroundContent = { backgroundContent }
              mainContent = { mainContent }
              overlayContent = { overlayContent }
              scrollContent = { scrollContent }
              infoStreamContent = { <InfoStream/> }
            />}
          secondaryScreen = {secondaryScreen}
          buttonRight = {buttonRight}
          buttonMid = {buttonMid}
          buttonLeft = {buttonLeft}
          statusBar = {statusBar}
          modalContent = {modalContent}      
          buttonModal = {buttonModal}    
        />

      </View>
    );
  }
}

export default withPeakService(withGameService(withSequenceService(GameContainer)));
