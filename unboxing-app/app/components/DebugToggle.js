import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';

import {globalStyles} from '../../config/globalStyles';
import {withGameService} from '../components/ServiceConnector';
import {gameService} from '../services';

class DebugToggle extends React.Component { 
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <View style={{width:"25%"}}>
          <Text>Debugmode Off/On</Text>         
          <Text>{JSON.stringify(this.props)}</Text>
          <Switch value={this.props.gameService.debugMode} onValueChange={gameService.toggleDebugMode}/>
        </View>
        
      </View>
    );
  }
}

export default withGameService(DebugToggle);