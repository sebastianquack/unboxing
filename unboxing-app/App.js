/**
 * Main App Component - Todo: move out most functionality into sub components
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Slider
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';

import {ServiceConnector} from './app/components/ServiceConnector';
import {withServices} from './app/components/ServiceConnector';

import {globalStyles} from './config/globalStyles';

import ServerConnector from './app/components/ServerConnector';
import Files from './app/components/Files';
import TimeSync from './app/components/TimeSync';
import GameContainer from './app/components/GameContainer';
import NearbyStatus from './app/components/NearbyStatus';
import Gestures from './app/components/Gestures';
import SensorInfo from './app/components/SensorInfo';


class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    
    this.state = {
      adminMenu: false
    };    
  }

  renderAdminButton = ()=>{
    return (
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={()=>{
          this.setState({adminMenu: !this.state.adminMenu})}
        }
      >
        <Text>toggle admin</Text>
      </TouchableOpacity>
    );
  }

  renderAdminMenu() {
    return (
      <View>
        <Text style={globalStyles.titleText}>Admin</Text>
        <ServerConnector/>
        <TimeSync/>
        {<SensorInfo />}
        <Gestures />
        <Files/>
        <NearbyStatus/>
      </View>
    );
  }
  
  render() {
    return (
      <ServiceConnector>
        <KeepAwake/>
        <ScrollView contentContainerStyle={styles.container}>
          {this.renderAdminButton()}
          {this.state.adminMenu ?
            this.renderAdminMenu() 
          :
            <GameContainer/> 
          }
        </ScrollView>
      </ServiceConnector>
    );
  }
}

export default App;


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    padding: 20
  },
  adminButton: {
    marginBottom: 10,
    padding: 10,
    backgroundColor:'#eee',
    borderRadius: 5
  }
});
