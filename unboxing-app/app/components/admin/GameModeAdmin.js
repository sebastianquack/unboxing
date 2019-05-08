import React, { Component } from 'react';
import { Alert, Text, View, StyleSheet, TouchableOpacity, Switch, Picker, BackHandler } from 'react-native';

import RestartAndroid from 'react-native-restart-android'

import {globalStyles} from '../../../config/globalStyles';
import {gameService, storageService, soundService} from '../../services';
import {withGameService, withStorageService, withSoundService} from '../ServiceConnector';

import DebugToggle from './DebugToggle';



class GameModeAdmin extends React.Component { 
  constructor(props) {
    super(props);
  }

  render() {
    let walkItems = [<Picker.Item key="none" label={"-"} value={null}/>]
    if(this.props.storageService.collections.walks) {
      walkItems.push(this.props.storageService.collections.walks.map(w=>
        <Picker.Item key={w._id} label={w.description} value={w}/>));
    }
    let placeItems = [<Picker.Item key="none" label={"-"} value={null}/>]
    if(this.props.storageService.collections.places) {
      placeItems.push(this.props.storageService.collections.places.map(p=>
        <Picker.Item key={p._id} label={p.description_en} value={p}/>));
    }
    let challengeItems = [<Picker.Item key="none" label={"-"} value={null}/>]
    if(this.props.storageService.collections.challenges) {
      challengeItems.push(this.props.storageService.collections.challenges.map(c=>
        <Picker.Item key={c._id} label={c.name + " " + storageService.getSequenceNameFromChallenge(c)} value={c}/>));
    }
    let installationItems = [<Picker.Item key="none" label={"-"} value={null}/>]
    if(this.props.storageService.collections.installations) {
      installationItems.push(this.props.storageService.collections.installations.map(i=>
        <Picker.Item key={i._id} label={i.name} value={i}/>));
    }
    
    return (
      <View>
        <Text>gameMode: {this.props.gameService.gameMode}</Text>
        <Text>activeInstallation: {this.props.gameService.activeInstallation ? JSON.stringify(this.props.gameService.activeInstallation).substring(0, 100) + "..." : "none"}</Text>
        <Text>activeWalk: {this.props.gameService.activeWalk ? JSON.stringify(this.props.gameService.activeWalk).substring(0,100) + "..." : "none"}</Text>
        <Text>walkStatus: {this.props.gameService.walkStatus}</Text>
        <Text>walkStartTime: {this.props.gameService.walkStartTime}</Text>
        <Text>tutorialStatus: {this.props.gameService.tutorialStatus}</Text>
        <Text>activePath: {this.props.gameService.activePath ? JSON.stringify(this.props.gameService.activePath) : "none"}</Text>
        <Text>pathIndex: {this.props.gameService.pathIndex}</Text>
        <Text>activePlaceReference: {JSON.stringify(this.props.gameService.activePlaceReference)}</Text>
        <Text>activePlace: {JSON.stringify(this.props.gameService.activePlace)}</Text>
        <Text>minutesToEnd: {this.props.gameService.minutesToEnd}</Text>
        <Text>activeChallenge: {JSON.stringify(this.props.gameService.activeChallenge)}</Text>
        <Text>challengeStatus: {this.props.gameService.challengeStatus}</Text>
        <Text>challengeStageIndex: {this.props.gameService.challengeStageIndex}</Text>
        <Text>numChallengeParticipants: {this.props.gameService.numChallengeParticipants}</Text>
        <Text>numChallengeParticipantsWithInstrument: {this.props.gameService.numChallengeParticipantsWithInstrument}</Text>
        <Text>infoStream: {JSON.stringify(this.props.gameService.infoStream)}</Text>
        <Text>installationActivityMap: {JSON.stringify(this.props.gameService.installationActivityMap)}</Text>

        <Text style={{marginTop: 20}}>start installation:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.startInstallationByName(itemValue.name);
                this.props.adminClose();
              }}}
        >
              {installationItems}
        </Picker>
        <Text style={{marginTop: 20}}>start tutorial for walk:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.startTutorialForWalk(itemValue);
                this.props.adminClose();
              }}}
        >
              {walkItems}
        </Picker>
        <Text style={{marginTop: 20}}>start walk:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.startWalkById(itemValue._id, soundService.getSyncTime());
                this.props.adminClose();
              }}}
        >
              {walkItems}
        </Picker>        
        <Text style={{marginTop: 20}}>navigate to a place:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.setupMinimalWalk(itemValue) 
                this.props.adminClose();
              }}}
        >
              {placeItems}
        </Picker>
        <Text style={{marginTop: 20}}>jump to a challenge:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.jumpToChallenge(itemValue);
                this.props.adminClose();
              }}}
        >
              {challengeItems}
        </Picker>
        
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={()=>{
            Alert.alert(
              'Confirm',
              'Restart App?',
              [
                {text: 'Yes', onPress: () => RestartAndroid.restart()},
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              {cancelable: true},
            );
          }}><Text>Restart App</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={()=>{
            Alert.alert(
              'Confirm',
              'Restart App (remove saved gameState)?',
              [
                {text: 'Yes', onPress: () => { 
                  storageService.saveGameStateToFile({}, () => { RestartAndroid.restart() }); 
                }},
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              {cancelable: true},
            );
          }}><Text>Restart App (without resume)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={()=>{
            Alert.alert(
              'Confirm',
              'Close App?',
              [
                {text: 'Yes', onPress: () => { 
                  //RNExitApp.exitApp();
                  BackHandler.exitApp();
                }},
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              {cancelable: true},
            );
          }}><Text>Close App</Text>

        </TouchableOpacity>                        
        <DebugToggle/>    
      </View>
    );
  }
}

export default withSoundService(withGameService(withStorageService(GameModeAdmin)));