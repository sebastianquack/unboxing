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
  Switch,
  StatusBar,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';

import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';

import {ServiceConnector} from './app/components/ServiceConnector';

import {globalStyles} from './config/globalStyles';

import GameContainer from './app/components/GameContainer';
import ServerConnector from './app/components/admin/ServerConnector';
import Files from './app/components/admin/Files';
import TimeSync from './app/components/admin/TimeSync';
import NearbyStatus from './app/components/admin/NearbyStatus';
import Gestures from './app/components/admin/Gestures';
import SensorInfo from './app/components/admin/SensorInfo';
import DebugToggle from './app/components/admin/DebugToggle';
import GameModeAdmin from './app/components/admin/GameModeAdmin';

const sections = [
  {
    name: "GameModeAdmin",
    component:GameModeAdmin,
    default: true

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
    default: false,
  },          
]

class App extends Component {

  constructor(props) {
    super(props);
    console.ignoredYellowBox = [
     'Setting a timer'
    ];
    
    this.state = {
      adminMenu: false
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
      <View {...styles.adminMenu}>
        <Text style={globalStyles.titleText}>Admin</Text>
        <View>
          { this.renderSections() }
        </View>        
      </View>
    );
  }
  
  render() {
    return (
      [
        <KeepAwake key="KeepAwake" />,
        <StatusBar key="StatusBar" translucent backgroundColor="transparent" barStyle="dark-content" />,
        <ServiceConnector key="ServiceConnector">
          <ScrollView contentContainerStyle={styles.container}>
            {this.renderAdminButton()}
            {this.state.adminMenu ?
              this.renderAdminMenu() 
            :
              <GameContainer/> 
            }
          </ScrollView>
        </ServiceConnector>
      ]
    );
  }
}

export default App;


const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  adminMenu: {
    padding: 10,
    paddingTop: 30,
  },
  adminButton: {
    opacity: 0.8,
    padding: 10,
    backgroundColor:'rgba(200,200,200,0.5)',
    borderRadius: 5,
    position: 'absolute',
    top:30,
    right:10,
    zIndex:100,
  }
});
