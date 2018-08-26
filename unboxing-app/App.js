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

import {globalStyles} from './config/globalStyles';
import ServerConnector from './app/components/ServerConnector';

import SensorControls from './app/components/SensorControls';
import Sequencer from './app/components/Sequencer';
import SoundManager from './app/components/SoundManager';

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];

  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>

        <KeepAwake />
        
        <Text style={globalStyles.titleText}>Unboxing</Text>

        <ServerConnector/>

        <SoundManager/>

      </ScrollView>
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
