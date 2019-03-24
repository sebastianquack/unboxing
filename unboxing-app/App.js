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
import SequenceAdmin from './app/components/admin/SequenceAdmin';
import LanguageSelector from './app/components/admin/LanguageSelector';

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
    name: "SequenceAdmin",
    component:SequenceAdmin,
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
      adminMenu: false,
      adminTranslucent: false,
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

  renderBuildInfo = () => {
    if (__DEV__) {
      return <Text style={{color: "orange"}}>Development build</Text>
    } else {
      return <Text style={{color: "green"}}>Production build</Text>
    }
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
    const conditionalStyles = this.state.adminTranslucent ? styles.adminMenu__translucent : {}
    return (
      <ScrollView {...styles.adminMenu} {...conditionalStyles}>
        <Text style={globalStyles.titleText}>Admin
        </Text>
        <Text style={{fontSize: 16}}>translucent</Text>
          <Switch value={this.state.adminTranslucent} onValueChange={value => this.setState({adminTranslucent: value})}/>                
        <View>
        <LanguageSelector/>
          { this.renderSections() }
        </View>        
        { this.renderBuildInfo() }
      </ScrollView>
    );
  }
  
  render() {
    return (
      [
        <KeepAwake key="KeepAwake" />,
        <StatusBar key="StatusBar" translucent backgroundColor="transparent" barStyle="dark-content" />,
        <ServiceConnector key="ServiceConnector">
          <View {...styles.container}>
            { (this.state.adminMenu && this.state.adminTranslucent || !this.state.adminMenu) && <GameContainer/> }
            {this.state.adminMenu &&
              this.renderAdminMenu() 
            }
            {this.renderAdminButton()}
          </View>
        </ServiceConnector>
      ]
    );
  }
}

export default App;


const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  adminMenu: {
    position: 'absolute',
    zIndex: 99,
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    padding: 10,
    paddingTop: 30,
  },
  adminMenu__translucent: {
    backgroundColor: 'rgba(200,200,200,0.5)'
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
