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

import {ServiceConnector, ServiceValue} from './app/components/ServiceConnector';
import {soundService} from './app/services/soundService';

import {globalStyles} from './config/globalStyles';

import ServerConnector from './app/components/ServerConnector';
import Files from './app/components/Files';
import TimeSync from './app/components/TimeSync';
import SensorControls from './app/components/SensorControls';
import Sequencer from './app/components/Sequencer';

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    
    this.state = {
      host: "127.0.0.1"
    };
  }

  handleHostChange = (host) => {
    setTimeout(()=>this.setState({host}), 1000)
  }
  
  render() {
    return (
      <ServiceConnector>
        <ScrollView contentContainerStyle={styles.container}>

          <ServerConnector onHostChange={this.handleHostChange}/>

          <KeepAwake />
          
          <Text style={globalStyles.titleText}>Unboxing</Text>

          <TimeSync/>
          
          <SensorControls/>
        
          <Sequencer/>

          <Files host={this.state.host}/>
        
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
  }
});
