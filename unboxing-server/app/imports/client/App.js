import React, { Component, Switch } from 'react';

import {DevicesInfo, InstallationsInfo, WalksInfo, EventsInfo, PlacesInfo, ChallengesInfo, NetworkInfo, ServersInfo, FilesInfo, GesturesInfo, SequencesInfo, ImportExport, TranslationsInfo} from './';
 
const sections = [
  {
    name: "Devices",
    component:DevicesInfo,
    default: false
  },  
  {
    name: "Installations",
    component:InstallationsInfo,
    default: false
  },
  {
    name: "Walks",
    component:WalksInfo,
    default: false
  },
  {
    name: "Places",
    component:PlacesInfo,
    default: false
  },    
  {
    name: "Challenges",
    component:ChallengesInfo,
    default: false
  },    
  {
    name: "Sequences",
    component:SequencesInfo,
    default: false
  },    
  {
    name: "Gestures",
    component:GesturesInfo,
    default: false
  },    
  {
    name: "Events",
    component:EventsInfo,
    default: false
  },    
  {
    name: "Files",
    component:FilesInfo,
    default: false
  },    
  {
    name: "ImportExport",
    component:ImportExport,
    default: false
  },        
  {
    name: "Translations",
    component:TranslationsInfo,
    default: false
  },
  {
    name: "Servers",
    component:ServersInfo,
    default: false
  },       
]

// App component - represents the whole app
export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hostname: ""
    }

  }

  async componentDidMount() {
    Meteor.call('hostname', (error,hostname) => 
      this.setState({hostname})
    )
  }

  toggleSection = (name) => {
    let value = this.state["show" + name];
    console.log(value);
    this.setState({
        ["show" + name]: !value
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
    return (
      <div style={{display: "inline-block", paddingLeft: "0.25em"}}>
        <input
              type="button"
              value={this.showSection(name) ? "hide" : "show"}
              onClick={  value => this.toggleSection(name) } />
      </div>
      );
  }

  renderSections = () => {
    return sections.map(section => 
    <div key={section.name} style={{borderWidth: 1, borderStyle:"dotted", padding:"1em", margin:"0.5em"}}>
      <h3 style={{marginTop: 0, marginBottom: 0}}>{section.name}{this.renderSectionSwitch(section.name)}</h3>
      {this.showSection(section.name) && <div><section.component /></div>}
    </div>)
  }
 
  render() {
    console.log(this.state);
    return (
      <div className="container" style={{marginBottom: "5em"}}>
        <header>
          <h1>Unboxing Server / {this.state.hostname}</h1>
        </header>

        { this.renderSections() }

      </div>
    );
  }
}