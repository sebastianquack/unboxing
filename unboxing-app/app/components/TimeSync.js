import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  Switch
} from 'react-native';

//import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';

import {globalStyles} from '../../config/globalStyles';

import {soundService} from '../services/soundService';
import {ServiceValue} from '../components/ServiceConnector';

class TimeSync extends React.Component { 
  constructor(props) {
  	super(props);

    this.handleTestClickSwitch = this.handleTestClickSwitch.bind(this);
    this.handleSyncPress = this.handleSyncPress.bind(this);
    this.correctSync = this.correctSync.bind(this);
  }

  // time sync controls
  handleSyncPress() {
    console.log("sync button pressed, calling server");
    avgTimeDeltas((delta)=>{
      soundService.setDelta(delta);
      alert("Time sync completed");
    });
  }

  handleTestClickSwitch(value) {
    this.props.setTestClick(value);
    if(value) {
      // schedule click to the next second
      this.props.loadSound("/misc/click.mp3");
      this.props.scheduleNextSound(Math.ceil(this.props.getSyncTime()/1000)*1000);
    } else {
      this.props.scheduleNextSound(null);
    }
  }

  // called when user clicks plus or minus delta correction button
  correctSync(d) {
    soundService.setDelta(soundService.getDelta() + d);
  }

  render() {
  	return (
  		<View>
        <Text>Time delta: <ServiceValue service="sound" value="delta"/>
        </Text>
        
        <View style={globalStyles.buttons}>
          <TouchableOpacity style={globalStyles.button} onPress={this.handleSyncPress}>
            <Text>Sync Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.button} onPress={()=>this.correctSync(5)}>
            <Text>+5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.button} onPress={()=>this.correctSync(-5)}>
            <Text>-5</Text>
          </TouchableOpacity>
          <View>
            <Text>Test Click</Text>
            <Switch value={this.props.testClick} onValueChange={this.handleTestClickSwitch}/>
          </View>
        </View>
        
      </View>
  	);
  }
}

function measureDelta(callback) {
  let sendTimeStamp = (new Date()).getTime();
  Meteor.call("getTime", (err, serverTime) => {
    if(err) {
        alert("error retrieving time from server");
        console.log(err);
        return;
    }
    let receiveTimeStamp = (new Date()).getTime();
    let latency = (receiveTimeStamp - sendTimeStamp) / 2.0;
    let delta = receiveTimeStamp - (serverTime + latency);
    callback({latency: latency, delta: delta});
  });
}

function avgTimeDeltas(callback) {
  let deltas = [];
  let timeout = 1000;
  let num = 10;

  // send num requests to server, save deltas
  console.log("starting measurement of time deltas");
  for(let i = 0; i < num; i++) {
    
    setTimeout(()=>{
      measureDelta((delta)=>{
        deltas.push(delta)
        if(i == num - 1) {
          console.log("measurement complete");
          console.log(JSON.stringify(deltas));
          console.log("sorting by latency");
          deltas.sort(function(a, b){return a.latency - b.latency});
          console.log(JSON.stringify(deltas));
          console.log("calculating average delta for fastest half of reponses:");
          let sum = 0;
          let counter = 0;
          for(let j = 0; j < deltas.length / 2.0; j++) {
            sum += deltas[j].delta;
            counter++;
          }
          let avg = sum / counter;
          console.log("result: " + avg);
          callback(avg);
        }
      });  
    }, i * timeout); 
  }  
}

export default TimeSync;
