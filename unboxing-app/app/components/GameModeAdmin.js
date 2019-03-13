import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch, Picker } from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import {gameService} from '../services';
import {withGameService, withStorageService} from './ServiceConnector';

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
    return (
      <View>
        <Text>gameMode: {this.props.gameService.gameMode}</Text>
        <Text>activeWalk: {this.props.gameService.activeWalk ? this.props.gameService.activeWalk.description : "none"}</Text>
        <Text>walkStatus: {this.props.gameService.walkStatus}</Text>
        <Text>pathIndex: {this.props.gameService.pathIndex}</Text>
        <Text>activePlaceReference: {JSON.stringify(this.props.gameService.activePlaceReference)}</Text>
        <Text>activePlace: {JSON.stringify(this.props.gameService.activePlace)}</Text>
        <Text>activeChallenge: {JSON.stringify(this.props.gameService.activeChallenge)}</Text>
        <Text>challengeStatus: {this.props.gameService.challengeStatus}</Text>

        <Text style={{marginTop: 20}}>start a new walk:</Text>
        <Picker
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) gameService.setActiveWalk(itemValue) }}
        >
              {walkItems}
        </Picker>
        {this.props.gameService.gameMode != "manual" &&
          <TouchableOpacity
            style={globalStyles.button}
            onPress={()=>{
              gameService.setGameMode("manual");
            }}
          >
          <Text>Enter manual mode</Text>
        </TouchableOpacity>
        }
      </View>
    );
  }
}

export default withGameService(withStorageService(GameModeAdmin));