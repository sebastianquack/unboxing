import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {withGameService, withSequenceService, withPeakService, withRelayService} from './ServiceConnector';
import {gameService, sequenceService, storageService} from '../services';

import ScreenContainer from './ScreenContainer'
import PrimaryScreen from './PrimaryScreen'
import SecondaryScreen from './SecondaryScreen'
import StatusBar from './StatusBar'
import Button from './Button'
import ConnectionIndicator from './ConnectionIndicator'
import VideoPlayer from './VideoPlayer'
import UIText from './UIText'


import ChallengeView from './ChallengeView';
import TrackSelector from './TrackSelector';
import {InfoStream} from './InfoStream';
import Welcome from './Welcome';
import SensorModulator from './SensorModulator';
import Instructor from './Instructor';

import InstallationOverview from './InstallationOverview';

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

    // standard is to show info stream
    infoStreamContent = <InfoStream/>
    
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

      if(this.props.gameService.challengeStatus != "navigate") {
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

      if(this.props.gameService.tutorialStatus == "tutorial-complete" && 
        (this.props.gameService.challengeStatus == "prepare" 
        || this.props.gameService.challengeStatus == "play"))
        {
       statusBar = <StatusBar 
          title={storageService.t("practice-sequence-title")} 
          description={storageService.t("practice-sequence-subtitle")} 
          minutesToEnd={this.props.gameService.minutesToEnd}
          endText={storageService.t("time-left")}
          />
      }

    } else {
      
      if(this.props.gameService.gameMode == "manual" || this.props.gameService.gameMode == "walk") {
        // home screen
        if(this.props.gameService.walkStatus != "ended"         
          && this.props.gameService.challengeStatus != "tutorial") {
          mainContent = <Welcome
            supertitle={storageService.t("main-title-super")}
            title={storageService.t("main-title")}
            subtitle={storageService.t("main-title-sub")}
          />
        }
      }

    }

    // special case: installation home screen 
    if(this.props.gameService.gameMode == "installation" && !this.props.gameService.activeChallenge) {
      if(this.props.gameService.installationConencted) {
        if(this.props.gameService.tutorialStatus == "tutorial-installation-complete") {
          mainContent = <InstallationOverview installation={this.props.gameService.activeInstallation}/>
          statusBar = <StatusBar 
            title={this.props.gameService.statusBarTitle} 
            description={""} 
            steps={7}
            currentStep={0}
          />
          infoStreamContent = null;  
        } else {
          infoStreamContent = <InfoStream/>
          secondaryScreen = <SecondaryScreen type="instrument" instrument={this.props.gameService.installationStartInstrument} />;              
          switch(this.props.gameService.tutorialStatus) {
            case "tutorial-installation-1":
              overlayContent = <Instructor mode={"volume"}/>              
              break;
            case "tutorial-installation-2":
              overlayContent = <Instructor mode={"einsatz"}/>   
              break;
            case "tutorial-installation-playing":
              overlayContent = <Instructor mode={"volume"}/>   
              mainContent = <SensorModulator mode={"volume tilt"} item={{path: gameService.getPracticeSoundFile("1", this.props.gameService.installationStartInstrument)}}/>     
          }
        }
      } else {
        mainContent = <UIText>connecting...</UIText>
      }      
    }

    
    // special case: video playback
    if(this.props.gameService.activeVideo) {
      modalContent = <VideoPlayer source={this.props.gameService.activeVideo}/> 
      buttonModal = <Button type="wide" text={storageService.t("video-close")} onPress={()=>{gameService.stopVideo()}}/>
    }

    // special case: tutorial
    if(this.props.gameService.challengeStatus == "tutorial") {
      secondaryScreen = this.props.gameService.walkInstrument ? <SecondaryScreen type="instrument" instrument={this.props.gameService.walkInstrument} /> : null;
    }  

    if(this.props.gameService.tutorialStatus == "tutorial-intro") {
      buttonRight = <Button type="play" text={storageService.t("continue")} onPress={()=>{gameService.handleRightButton()}}/>;
    }
    
    // configure modal
    if(this.props.gameService.showInstrumentSelector) {
        modalContent = <TrackSelector selectedTracks={this.props.gameService.selectedTracks} sequence={this.props.sequenceService.currentSequence}/>
        buttonModal = <Button type="wide" text={storageService.t("close")} onPress={()=>{gameService.handleCloseModal(true)}}/>
    }
    
    // configure secondary screen and buttons
    const instrumentName = this.props.sequenceService.currentTrack ? this.props.sequenceService.currentTrack.name : null
    
    switch(this.props.gameService.challengeStatus) {
      case "tutorial":
        if(this.props.gameService.tutorialStatus == "step-2" || this.props.gameService.tutorialStatus == "step-1") {
          overlayContent = <Instructor mode={"einsatz"}/>
        }
        if(this.props.gameService.tutorialStatus == "step-2-playing") {
          mainContent = <SensorModulator mode={"volume tilt"} item={{path: gameService.getPracticeSoundFile(2)}}/>     
          overlayContent = <Instructor mode={"volume"}/>
        }
        if(this.props.gameService.tutorialStatus == "ready-for-practice") {
          buttonRight = <Button type="play" text={storageService.t("continue")} onPress={()=>{gameService.handleRightButton()}}/>
        }
        break;
      case "navigate":
        if(this.props.gameService.allowCheckInButton) {
          buttonRight = <Button type="check-in" text={storageService.t("check-in")} onPress={()=>{gameService.handleRightButton()}}/>;   
        } 
        secondaryScreen = this.props.gameService.activePlace ? <SecondaryScreen type="navigation" target={this.props.gameService.activePlace.tag + this.props.gameService.activePlace.shorthand} /> : null;
        break;

      case "prepare":
        if(this.props.gameService.activePlace) {
          buttonLeft = <Button type="leave" text={storageService.t("back")} onPress={()=>{gameService.handleLeftButton()}}/>;  
        }

        if(this.props.gameService.gameMode == "installation") {
          buttonLeft = <Button type="leave" text={storageService.t("back")} onPress={()=>{gameService.handleLeftButton()}}/>;   
        }
        
        buttonRight = instrumentName ? <Button type="play" text={storageService.t("play")} onPress={()=>{gameService.handleRightButton()}}/> : null;  
        
        secondaryScreen = <TouchableOpacity onPress={()=>{gameService.handleMidButton()}}>
          <SecondaryScreen type="instrument" instrument={instrumentName} /></TouchableOpacity>;
        
        if(this.props.gameService.tutorialStatus != "practice-sequence") {
          buttonMid = <Button type="change" onPress={()=>{gameService.handleMidButton()}} />;    
        }
        break;
 
      case "play":
        if(this.props.gameService.debugMode || this.props.gameService.gameMode == "installation") {
          buttonLeft = <Button type="leave" text={storageService.t("back")} onPress={()=>{gameService.handleLeftButton()}}/>;  
        }
        if(this.props.sequenceService.isLooping) {
          secondaryScreen = 
          <TouchableOpacity onPress={()=>{gameService.handleMidButton()}}>
            <SecondaryScreen type="instrument" instrument={instrumentName} />
          </TouchableOpacity>;
        } else {
          secondaryScreen = <SecondaryScreen type="instrument" instrument={instrumentName} />;  
        }
        // only show middle button during loop challenge
        if(gameService.isChallengeLooping()) {
          buttonMid= <Button type="change" onPress={()=>{gameService.handleMidButton()}} />;
        }
        if(this.props.sequenceService.instructorState) {
          overlayContent = <Instructor mode={this.props.sequenceService.instructorState}/>     
        }
        break;
    }

    //console.warn("render GameContainer");

    return (
      <View>
        <ScreenContainer
          primaryScreen = {<PrimaryScreen
              backgroundColor={(
                this.props.peakService.isUp && 
                (this.props.gameService.tutorialStatus == "tutorial-installation-2" 
                  || this.props.gameService.tutorialStatus == "step-1" 
                  || this.props.gameService.tutorialStatus == "step-2" 
                  || (this.props.gameService.challengeStatus == "play" && this.props.sequenceService.currentTrack))) 
                  ? "passive" : "active" }
              backgroundFlow = { 
                this.props.gameService.challengeStatus == "off" 
                || this.props.gameService.challengeStatus == "prepare" 
                || this.props.gameService.challengeStatus == "tutorial" 
              }
              backgroundContent = { backgroundContent }
              mainContent = { mainContent }
              overlayContent = { overlayContent }
              scrollContent = { scrollContent }
              infoStreamContent = { infoStreamContent }
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

export default withRelayService(withPeakService(withGameService(withSequenceService(GameContainer))));
//export default withRelayService(withGameService(withSequenceService(GameContainer)));
