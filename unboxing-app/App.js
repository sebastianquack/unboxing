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
      adminButtonRight: false,
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
      {this.showSection(section.name) && <View><section.component adminClose={()=>this.setState({adminMenu: false})}/></View>}
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
    let style = {...styles.adminButton};
    if(!this.state.adminMenu) {
      style.backgroundColor = 'rgba(200,200,200,0)';
      style.height = 50;
      style.width = 200;
    }
    //console.warn(style);

    return (
      <View style={style}>
      <TouchableOpacity
        onPress={()=>{
          if(this.state.adminMenu) {
            this.setState({adminMenu: false})
            this.setState({adminButton2: false})
          }  

          if(!this.state.adminMenu) {
            if(this.state.adminButton2) {
              this.setState({adminMenu: true})  
              this.setState({adminButton2: false})
            }
          }
        }}
      >
        <Text>SCHLIESSEN</Text>
      </TouchableOpacity>
      </View>
    )
  }
    

  renderAdminButton2 = ()=>{
    if(this.state.adminMenu) return null;
    return (
    <TouchableOpacity 
        style={{...styles.adminButton2, width: 100, height: 100}}
        onPress={()=>{
          this.setState({adminButton2: !this.state.adminButton2})}
        }
      >
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
        <View style={{marginTop:10, marginBottom: 10}}>
          { this.renderBuildInfo() }
        </View>
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
            {this.renderAdminButton2()}
          </View>
        </ServiceConnector>
      ]
    );
  }
}

export default App;


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill
  },
  adminMenu: {
    zIndex: 99,
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  adminMenu__translucent: {
    backgroundColor: 'rgba(200,200,200,0.5)'
  },  
  adminButton: {
    padding: 10,  
    backgroundColor:'rgba(200,200,200,0.5)', 
    borderRadius: 5,
    position: 'absolute',
    top:30,
    right:10,
    zIndex:100,
  },
  adminButton2: {
    opacity: 0.8,
    padding: 10,
    backgroundColor:'rgba(200,200,200,0)',
    borderRadius: 5,
    position: 'absolute',
    top:30,
    right:350,
    zIndex:100,
  }
});
