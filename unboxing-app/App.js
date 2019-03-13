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
  Slider,
  Switch
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';

import {ServiceConnector} from './app/components/ServiceConnector';

import {globalStyles} from './config/globalStyles';

import ServerConnector from './app/components/ServerConnector';
import Files from './app/components/Files';
import TimeSync from './app/components/TimeSync';
import GameContainer from './app/components/GameContainer';
import NearbyStatus from './app/components/NearbyStatus';
import Gestures from './app/components/Gestures';
import SensorInfo from './app/components/SensorInfo';
import DebugToggle from './app/components/DebugToggle';
import GameModeAdmin from './app/components/GameModeAdmin';

const sections = [
  {
    name: "GameModeAdmin",
    component:GameModeAdmin,
    default: false

  },
  {
    name: "ServerConnector",
    component:ServerConnector,
    default: false,
  },
  {
    name: "TimeSync",
    component:TimeSync,
    default: false,
  },
  {
    name: "SensorInfo",
    component:SensorInfo,
    default: false,
  },
  {
    name: "Gestures",
    component:Gestures,
    default: false,
  },
  {
    name: "Files",
    component:Files,
    default: false,
  },
  {
    name: "NearbyStatus",
    component:NearbyStatus,
    default: true,
  },          
]

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    
    this.state = {
      adminMenu: true
    };    

    this.initSections()
  }

  toggleSection = (value,name) => {
    this.setState({
      ["show" + name]: value
    })
  }

  showSection = (name) => {
    return this.state["show" + name]
  }

  initSections = () => {
    sections.forEach( section => {
      this.state["show" + section.name] = section.default
    })
  }

  renderSectionSwitch = (name) => {
    return <View key={name}>
        <Text style={{fontSize: 16}}>{name}</Text>
        <Switch value={this.state["show" + name]} onValueChange={value => this.toggleSection(value, name)}/>
      </View>
  }

  renderSections = () => {
    return sections.map(section => <View key={section.name} style={{borderTopWidth: 2, borderStyle:"dotted"}}>
      {this.renderSectionSwitch(section.name)}
      {this.showSection(section.name) && <View><section.component /></View>}
    </View>)
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
        <View>
          { this.renderSections() }
        </View>        
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
