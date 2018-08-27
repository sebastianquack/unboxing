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
import SoundManager from './app/components/SoundManager';
import Files from './app/components/Files';

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
      <ScrollView contentContainerStyle={styles.container}>

        <ServerConnector 
          onHostChange={this.handleHostChange}
        />

        <KeepAwake />
        
        <Text style={globalStyles.titleText}>Unboxing</Text>

        <SoundManager/>

        <Files 
          host={this.state.host}
        />
      
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
