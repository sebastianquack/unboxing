import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch, Picker } from 'react-native';

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
      walkItems.push(this.props.storageService.collections.walks.filter(w=>w.active).map(w=>
        <Picker.Item key={w._id} label={w.description} value={w}/>));
    }
    let placeItems = [<Picker.Item key="none" label={"-"} value={null}/>]
    if(this.props.storageService.collections.places) {
      placeItems.push(this.props.storageService.collections.places.map(p=>
        <Picker.Item key={p._id} label={p.description} value={p}/>));
    }
    let challengeItems = [<Picker.Item key="none" label={"-"} value={null}/>]
    if(this.props.storageService.collections.challenges) {
      challengeItems.push(this.props.storageService.collections.challenges.map(c=>
        <Picker.Item key={c._id} label={c.name + " " + storageService.getSequenceNameFromChallenge(c)} value={c}/>));
    }
    
    return (
      <View>
        <Text>gameMode: {this.props.gameService.gameMode}</Text>
        <Text>activeWalk: {this.props.gameService.activeWalk ? JSON.stringify(this.props.gameService.activeWalk) : "none"}</Text>
        <Text>walkStatus: {this.props.gameService.walkStatus}</Text>
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

        <Text style={{marginTop: 20}}>start a walk:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.setActiveWalk(itemValue) 
                this.props.adminClose();
              }}}
        >
              {walkItems}
        </Picker>
        <TouchableOpacity 
          style={globalStyles.button}
          onPress={()=>{
            if(this.props.storageService.collections.places.length >= 2) {
              gameService.setupTutorialWalk()
              this.props.adminClose();  
            }
          }}><Text>Test Tutorial</Text>
        </TouchableOpacity>
        <Text style={{marginTop: 20}}>navigate to a place:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.setupMinimalWalk(itemValue) 
                gameService.initInfoStream();
                this.props.adminClose();
              }}}
        >
              {placeItems}
        </Picker>
        <Text style={{marginTop: 20}}>jump to a challenge:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) {
                gameService.setGameMode("manual");                
                gameService.leaveChallenge();
                gameService.setActiveChallenge(itemValue) 
                gameService.initInfoStream();
                this.props.adminClose();
              }}}
        >
              {challengeItems}
        </Picker>
        <DebugToggle/>
         <TouchableOpacity 
          style={globalStyles.button}
          onPress={()=>{
            soundService.runSoundTest();
          }}><Text>Run Crazy Sound Test</Text>
        </TouchableOpacity>
        <Text style={{marginBottom: 20}}>soundService errorLog: {JSON.stringify(this.props.soundService.errorLog)}</Text>
      </View>
    );
  }
}

export default withSoundService(withGameService(withStorageService(GameModeAdmin)));